const request = require("supertest");
const app = require("../app");
const { createUser, tokenFor } = require("./helpers/factories");

const CSRF = { "X-Requested-With": "XMLHttpRequest" };

const findCookie = (res, name) =>
  (res.headers["set-cookie"] || []).find((c) => c.startsWith(`${name}=`));

describe("POST /api/users/login", () => {
  it("sets an httpOnly accessToken cookie and keeps the token out of the body", async () => {
    const { user, password } = await createUser({ name: "fighter" });

    const res = await request(app)
      .post("/api/users/login")
      .set(CSRF)
      .send({ username: "fighter", password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toEqual({ id: user.id, name: "fighter", email: user.email, role: "user" });

    const cookie = findCookie(res, "accessToken");
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toMatch(/Secure/i);
  });

  it("uses Secure and SameSite=None in production", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const { password } = await createUser({ name: "prod" });
      const res = await request(app)
        .post("/api/users/login")
        .set(CSRF)
        .send({ username: "prod", password });

      const cookie = findCookie(res, "accessToken");
      expect(cookie).toMatch(/Secure/i);
      expect(cookie).toMatch(/SameSite=None/i);
    } finally {
      process.env.NODE_ENV = previous;
    }
  });

  it("does not set a cookie for wrong credentials", async () => {
    await createUser({ name: "fighter" });
    const res = await request(app)
      .post("/api/users/login")
      .set(CSRF)
      .send({ username: "fighter", password: "wrong" });

    expect(res.status).toBe(401);
    expect(findCookie(res, "accessToken")).toBeUndefined();
  });
});

describe("POST /api/users/logout", () => {
  it("clears the accessToken cookie", async () => {
    const res = await request(app).post("/api/users/logout").set(CSRF);

    expect(res.status).toBe(200);
    const cookie = findCookie(res, "accessToken");
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  it("logs the agent out so protected routes reject it", async () => {
    const { password } = await createUser({ name: "fighter" });
    const agent = request.agent(app);
    await agent.post("/api/users/login").set(CSRF).send({ username: "fighter", password });

    expect((await agent.get("/api/users/current")).status).toBe(200);
    await agent.post("/api/users/logout").set(CSRF);
    expect((await agent.get("/api/users/current")).status).toBe(401);
  });
});

describe("cookie authentication", () => {
  it("accepts the cookie set by login", async () => {
    const { user, password } = await createUser({ name: "fighter" });
    const agent = request.agent(app);
    await agent.post("/api/users/login").set(CSRF).send({ username: "fighter", password });

    const res = await agent.get("/api/users/current");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: user.id, name: "fighter" });
  });

  it("rejects requests without a cookie", async () => {
    const res = await request(app).get("/api/users/current");
    expect(res.status).toBe(401);
  });

  it("rejects a tampered cookie", async () => {
    const res = await request(app)
      .get("/api/users/current")
      .set("Cookie", "accessToken=not-a-jwt");
    expect(res.status).toBe(401);
  });

  it("no longer accepts a bearer token header", async () => {
    const { user } = await createUser();
    const res = await request(app)
      .get("/api/users/current")
      .set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(res.status).toBe(401);
  });

  it("attaches the user to guest-optional routes when the cookie is present", async () => {
    const { user } = await createUser();
    const res = await request(app)
      .post("/api/orders")
      .set(CSRF)
      .set("Cookie", `accessToken=${tokenFor(user)}`)
      .send({ products: [], totalPrice: 100 });

    expect(res.status).toBe(201);
    expect(res.body.user_id).toBe(user.id);
  });
});

describe("CSRF protection", () => {
  it("rejects state-changing requests without X-Requested-With", async () => {
    const { user } = await createUser();
    const res = await request(app)
      .post("/api/carts")
      .set("Cookie", `accessToken=${tokenFor(user)}`);

    expect(res.status).toBe(403);
  });

  it("allows state-changing requests with X-Requested-With", async () => {
    const { user } = await createUser();
    const res = await request(app)
      .post("/api/carts")
      .set(CSRF)
      .set("Cookie", `accessToken=${tokenFor(user)}`);

    expect(res.status).toBe(201);
  });

  it("does not require the header for safe methods", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
  });
});

describe("CORS", () => {
  it("allows credentials from the client origin", async () => {
    const res = await request(app)
      .options("/api/users/current")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "X-Requested-With");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });
});
