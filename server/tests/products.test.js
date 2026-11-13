const { api } = require("./helpers/http");
const { createUser, createProduct } = require("./helpers/factories");

let admin;
let customer;

beforeEach(async () => {
  admin = (await createUser({ role: "admin" })).user;
  customer = (await createUser()).user;
});

describe("GET /api/products", () => {
  it("returns all products", async () => {
    await createProduct(admin, { title: "Gi" });
    await createProduct(admin, { title: "Gloves", category: "boxing" });

    const res = await api().get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.title).sort()).toEqual(["Gi", "Gloves"]);
  });

  it("filters by category", async () => {
    await createProduct(admin, { title: "Gi" });
    await createProduct(admin, { title: "Gloves", category: "boxing" });

    const res = await api().get("/api/products?category=boxing");

    expect(res.body.map((p) => p.title)).toEqual(["Gloves"]);
  });

  it("filters new arrivals and limited sale", async () => {
    await createProduct(admin, { title: "New", isNewArrival: true });
    await createProduct(admin, { title: "Sale", isLimitedSale: true });
    await createProduct(admin, { title: "Plain" });

    const fresh = await api().get("/api/products?newArrival=true");
    const sale = await api().get("/api/products?limitedSale=true");

    expect(fresh.body.map((p) => p.title)).toEqual(["New"]);
    expect(sale.body.map((p) => p.title)).toEqual(["Sale"]);
  });
});

describe("GET /api/products/:id", () => {
  it("returns one product", async () => {
    const product = await createProduct(admin, { title: "Gi" });

    const res = await api().get(`/api/products/${product.id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Gi");
  });

  it("responds 404 for a missing product", async () => {
    const res = await api().get("/api/products/64b000000000000000000000");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/products", () => {
  const body = { title: "Belt", price: 200, description: "Blue belt", category: "bjj" };

  it("requires authentication", async () => {
    expect((await api().post("/api/products").send(body)).status).toBe(401);
  });

  it("requires admin role", async () => {
    expect((await api(customer).post("/api/products").send(body)).status).toBe(403);
  });

  it("validates required fields", async () => {
    const res = await api(admin).post("/api/products").send({ title: "Belt" });
    expect(res.status).toBe(400);
  });

  it("creates a product owned by the admin with defaults", async () => {
    const res = await api(admin).post("/api/products").send(body);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...body, user_id: admin.id, sale: 0, rating: 0, sold: 0, image: "" });
  });
});

describe("PUT /api/products/:id", () => {
  it("updates a product as admin", async () => {
    const product = await createProduct(admin);

    const res = await api(admin).put(`/api/products/${product.id}`).send({ price: 1500 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1500);
  });

  it("responds 404 for a missing product", async () => {
    const res = await api(admin).put("/api/products/64b000000000000000000000").send({ price: 1 });
    expect(res.status).toBe(404);
  });

  it("is forbidden for customers", async () => {
    const product = await createProduct(admin);
    expect((await api(customer).put(`/api/products/${product.id}`).send({ price: 1 })).status).toBe(403);
  });
});

describe("DELETE /api/products/:id", () => {
  it("deletes a product as admin", async () => {
    const product = await createProduct(admin);

    const res = await api(admin).delete(`/api/products/${product.id}`);

    expect(res.status).toBe(200);
    expect((await api().get(`/api/products/${product.id}`)).status).toBe(404);
  });

  it("responds 404 for a missing product", async () => {
    expect((await api(admin).delete("/api/products/64b000000000000000000000")).status).toBe(404);
  });
});
