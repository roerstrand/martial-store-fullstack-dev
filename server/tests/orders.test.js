const { api } = require("./helpers/http");
const { createUser, createProduct } = require("./helpers/factories");

let admin;
let customer;
let gi;

beforeEach(async () => {
  admin = (await createUser({ role: "admin" })).user;
  customer = (await createUser()).user;
  gi = await createProduct(admin);
});

const orderBody = () => ({
  products: [{ product_id: gi.id, quantity: 2, price: 1000 }],
  totalPrice: 2000,
  shippingMethod: "standard",
  carrier: "PostNord",
});

describe("POST /api/orders", () => {
  it("creates a guest order without a user", async () => {
    const res = await api().post("/api/orders").send(orderBody());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ user_id: null, totalPrice: 2000, status: "pending", carrier: "PostNord" });
  });

  it("links the order to the logged in user", async () => {
    const res = await api(customer).post("/api/orders").send(orderBody());
    expect(res.body.user_id).toBe(customer.id);
  });

  it("requires products and totalPrice", async () => {
    expect((await api().post("/api/orders").send({ products: [] })).status).toBe(400);
  });
});

describe("GET /api/orders/me", () => {
  it("returns only the current user orders", async () => {
    await api(customer).post("/api/orders").send(orderBody());
    await api(admin).post("/api/orders").send(orderBody());
    await api().post("/api/orders").send(orderBody());

    const res = await api(customer).get("/api/orders/me");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].products[0].product_id.title).toBe("Gi");
  });

  it("requires authentication", async () => {
    expect((await api().get("/api/orders/me")).status).toBe(401);
  });
});

describe("GET /api/orders/:id", () => {
  it("returns an order", async () => {
    const order = (await api(customer).post("/api/orders").send(orderBody())).body;
    const res = await api(customer).get(`/api/orders/${order._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(order._id);
  });

  it("responds 404 for a missing order", async () => {
    expect((await api(customer).get("/api/orders/64b000000000000000000000")).status).toBe(404);
  });
});

describe("admin order management", () => {
  let order;

  beforeEach(async () => {
    order = (await api(customer).post("/api/orders").send(orderBody())).body;
  });

  it("lists all orders", async () => {
    await api().post("/api/orders").send(orderBody());
    const res = await api(admin).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("updates status", async () => {
    const res = await api(admin).patch(`/api/orders/${order._id}/status`).send({ status: "shipped" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("shipped");
  });

  it("requires a status", async () => {
    expect((await api(admin).patch(`/api/orders/${order._id}/status`).send({})).status).toBe(400);
  });

  it("deletes an order", async () => {
    expect((await api(admin).delete(`/api/orders/${order._id}`)).status).toBe(200);
    expect((await api(admin).delete(`/api/orders/${order._id}`)).status).toBe(404);
  });

  it("is forbidden for customers", async () => {
    expect((await api(customer).get("/api/orders")).status).toBe(403);
    expect((await api(customer).patch(`/api/orders/${order._id}/status`).send({ status: "shipped" })).status).toBe(403);
    expect((await api(customer).delete(`/api/orders/${order._id}`)).status).toBe(403);
  });
});
