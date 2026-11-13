const { api } = require("./helpers/http");
const { createUser, createProduct } = require("./helpers/factories");
const Cart = require("../models/cartModel");

let admin;
let owner;
let intruder;
let gi;

beforeEach(async () => {
  admin = (await createUser({ role: "admin" })).user;
  owner = (await createUser()).user;
  intruder = (await createUser()).user;
  gi = await createProduct(admin);
});

describe("cart ownership", () => {
  let cart;

  beforeEach(async () => {
    cart = (await api(owner).post("/api/carts")).body;
    await api(owner).post(`/api/carts/${cart._id}/products`).send({ product_id: gi.id, size: "A2" });
  });

  it.each([
    ["get", (id) => `/api/carts/${id}`],
    ["put", (id) => `/api/carts/${id}`],
    ["post", (id) => `/api/carts/${id}/products`],
    ["delete", (id) => `/api/carts/${id}/products/PRODUCT`],
    ["patch", (id) => `/api/carts/${id}/products/PRODUCT/increase`],
    ["patch", (id) => `/api/carts/${id}/products/PRODUCT/decrease`],
    ["delete", (id) => `/api/carts/${id}/reset`],
  ])("hides another user's cart on %s %#", async (method, url) => {
    const res = await api(intruder)[method](url(cart._id).replace("PRODUCT", gi.id)).send({ product_id: gi.id, products: [] });

    expect(res.status).toBe(404);
    const stored = await Cart.findById(cart._id);
    expect(stored.products).toHaveLength(1);
    expect(stored.products[0].quantity).toBe(1);
  });

  it("lets an admin read any cart", async () => {
    expect((await api(admin).get(`/api/carts/${cart._id}`)).status).toBe(200);
  });

  it("does not let the owner move the cart to another user", async () => {
    const res = await api(owner).put(`/api/carts/${cart._id}`).send({ user_id: intruder.id, products: [] });

    expect(res.status).toBe(200);
    expect(res.body.user_id).toBe(owner.id);
    expect(res.body.products).toEqual([]);
  });
});

describe("order ownership", () => {
  const body = () => ({ products: [{ product_id: gi.id, quantity: 1, price: 100 }], totalPrice: 100 });

  it("hides another user's order", async () => {
    const order = (await api(owner).post("/api/orders").send(body())).body;
    expect((await api(intruder).get(`/api/orders/${order._id}`)).status).toBe(404);
  });

  it("hides guest orders from customers", async () => {
    const order = (await api().post("/api/orders").send(body())).body;
    expect((await api(intruder).get(`/api/orders/${order._id}`)).status).toBe(404);
  });

  it("lets an admin read any order", async () => {
    const order = (await api(owner).post("/api/orders").send(body())).body;
    expect((await api(admin).get(`/api/orders/${order._id}`)).status).toBe(200);
  });
});

describe("GET /api/products/myProducts", () => {
  it("returns only the current user's products without leaking the password hash", async () => {
    await createProduct(admin, { title: "Belt" });
    const otherAdmin = (await createUser({ role: "admin" })).user;
    await createProduct(otherAdmin, { title: "Other" });

    const res = await api(admin).get("/api/products/myProducts");

    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.title).sort()).toEqual(["Belt", "Gi"]);
    res.body.forEach((p) => {
      expect(p.user_id.name).toBe(admin.name);
      expect(p.user_id.password).toBeUndefined();
    });
  });
});

describe("GET /api/users/current", () => {
  it("reflects profile changes without logging in again", async () => {
    await api(owner).put("/api/users/profile").send({ name: "renamed", email: "renamed@test.com" });

    const res = await api(owner).get("/api/users/current");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: owner.id, name: "renamed", email: "renamed@test.com", role: "user" });
  });

  it("rejects a token for a deleted user", async () => {
    await owner.deleteOne();
    expect((await api(owner).get("/api/users/current")).status).toBe(401);
  });
});
