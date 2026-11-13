const { api } = require("./helpers/http");
const { createUser, createProduct } = require("./helpers/factories");

let admin;
let customer;
let gi;
let gloves;

beforeEach(async () => {
  admin = (await createUser({ role: "admin" })).user;
  customer = (await createUser()).user;
  gi = await createProduct(admin, { title: "Gi" });
  gloves = await createProduct(admin, { title: "Gloves", category: "boxing" });
});

const createCart = async (user = customer) => (await api(user).post("/api/carts")).body;
const addItem = (cart, body) => api(customer).post(`/api/carts/${cart._id}/products`).send(body);

describe("cart lifecycle", () => {
  it("creates an empty cart for the current user", async () => {
    const res = await api(customer).post("/api/carts");

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ user_id: customer.id, products: [] });
  });

  it("responds 404 on /me when the user has no cart", async () => {
    expect((await api(customer).get("/api/carts/me")).status).toBe(404);
  });

  it("returns the current user cart with populated products", async () => {
    const cart = await createCart();
    await addItem(cart, { product_id: gi.id, size: "A2" });

    const res = await api(customer).get("/api/carts/me");

    expect(res.status).toBe(200);
    expect(res.body.products[0]).toMatchObject({ size: "A2", quantity: 1, product_id: { title: "Gi" } });
  });

  it("requires authentication", async () => {
    expect((await api().post("/api/carts")).status).toBe(401);
    expect((await api().get("/api/carts/me")).status).toBe(401);
  });
});

describe("POST /api/carts/:id/products", () => {
  it("requires product_id", async () => {
    const cart = await createCart();
    expect((await addItem(cart, {})).status).toBe(400);
  });

  it("increments quantity for the same product and size", async () => {
    const cart = await createCart();

    await addItem(cart, { product_id: gi.id, size: "A2" });
    const res = await addItem(cart, { product_id: gi.id, size: "A2" });

    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].quantity).toBe(2);
  });

  it("keeps different sizes as separate lines", async () => {
    const cart = await createCart();
    await addItem(cart, { product_id: gi.id, size: "A2" });

    const res = await addItem(cart, { product_id: gi.id, size: "A3" });

    expect(res.body.products.map((p) => p.size)).toEqual(["A2", "A3"]);
  });

  it("responds 404 for a missing cart", async () => {
    const res = await addItem({ _id: "64b000000000000000000000" }, { product_id: gi.id });
    expect(res.status).toBe(404);
  });
});

describe("quantity and removal", () => {
  let cart;
  const lineFor = (res, product) => res.body.products.find((p) => p.product_id._id === product.id);

  beforeEach(async () => {
    cart = await createCart();
    await addItem(cart, { product_id: gi.id, size: "A2" });
    await addItem(cart, { product_id: gi.id, size: "A3" });
    await addItem(cart, { product_id: gloves.id });
  });

  it("increases and decreases quantity", async () => {
    const up = await api(customer).patch(`/api/carts/${cart._id}/products/${gloves.id}/increase`);
    expect(lineFor(up, gloves).quantity).toBe(2);

    const down = await api(customer).patch(`/api/carts/${cart._id}/products/${gloves.id}/decrease`);
    expect(lineFor(down, gloves).quantity).toBe(1);
  });

  it("responds 404 when changing quantity of a product not in the cart", async () => {
    const other = await createProduct(admin, { title: "Other" });
    const res = await api(customer).patch(`/api/carts/${cart._id}/products/${other.id}/increase`);
    expect(res.status).toBe(404);
  });

  it("removes only the line with the given size", async () => {
    const res = await api(customer).delete(`/api/carts/${cart._id}/products/${gi.id}?size=A2`);

    expect(res.status).toBe(200);
    const giLines = res.body.products.filter((p) => p.product_id._id === gi.id);
    expect(giLines.map((p) => p.size)).toEqual(["A3"]);
  });

  it("responds 404 when removing a product not in the cart", async () => {
    const other = await createProduct(admin, { title: "Other" });
    expect((await api(customer).delete(`/api/carts/${cart._id}/products/${other.id}`)).status).toBe(404);
  });

  it("resets the cart", async () => {
    const res = await api(customer).delete(`/api/carts/${cart._id}/reset`);

    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });
});

describe("GET/PUT /api/carts/:id", () => {
  it("returns a cart by id", async () => {
    const cart = await createCart();
    const res = await api(customer).get(`/api/carts/${cart._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(cart._id);
  });

  it("responds 404 for a missing cart", async () => {
    expect((await api(customer).get("/api/carts/64b000000000000000000000")).status).toBe(404);
    expect((await api(customer).delete("/api/carts/64b000000000000000000000/reset")).status).toBe(404);
  });

  it("replaces cart contents", async () => {
    const cart = await createCart();
    const res = await api(customer)
      .put(`/api/carts/${cart._id}`)
      .send({ products: [{ product_id: gi.id, quantity: 3 }] });

    expect(res.status).toBe(200);
    expect(res.body.products[0].quantity).toBe(3);
  });
});

describe("GET /api/carts", () => {
  it("lists all carts for admins", async () => {
    await createCart(customer);
    await createCart(admin);

    const res = await api(admin).get("/api/carts");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("is forbidden for customers", async () => {
    expect((await api(customer).get("/api/carts")).status).toBe(403);
  });
});
