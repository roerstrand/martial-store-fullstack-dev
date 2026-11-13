const { api } = require("./helpers/http");
const { createUser, createProduct } = require("./helpers/factories");

let customer;
let gi;

beforeEach(async () => {
  customer = (await createUser()).user;
  gi = await createProduct(customer);
});

describe("favorites", () => {
  it("returns an empty list when the user has none", async () => {
    const res = await api(customer).get("/api/favorites/me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ products: [] });
  });

  it("creates a list once", async () => {
    expect((await api(customer).post("/api/favorites")).status).toBe(201);
    expect((await api(customer).post("/api/favorites")).status).toBe(400);
  });

  it("adds a product, creating the list if needed, without duplicates", async () => {
    await api(customer).post(`/api/favorites/products/${gi.id}`);
    const res = await api(customer).post(`/api/favorites/products/${gi.id}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].title).toBe("Gi");
  });

  it("removes a product", async () => {
    await api(customer).post(`/api/favorites/products/${gi.id}`);

    const res = await api(customer).delete(`/api/favorites/products/${gi.id}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  it("responds 404 when removing without a list", async () => {
    expect((await api(customer).delete(`/api/favorites/products/${gi.id}`)).status).toBe(404);
  });

  it("keeps lists separate per user", async () => {
    const other = (await createUser()).user;
    await api(customer).post(`/api/favorites/products/${gi.id}`);

    const res = await api(other).get("/api/favorites/me");

    expect(res.body.products).toEqual([]);
  });

  it("requires authentication", async () => {
    expect((await api().get("/api/favorites/me")).status).toBe(401);
  });
});
