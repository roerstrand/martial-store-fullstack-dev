const { api } = require("./helpers/http");
const { createUser } = require("./helpers/factories");

describe("POST /api/users/register", () => {
  it("creates a user without exposing the password", async () => {
    const res = await api().post("/api/users/register").send({ name: "ninja", email: "ninja@test.com", password: "pw123456" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ _id: expect.any(String), name: "ninja", email: "ninja@test.com" });
  });

  it("requires all fields", async () => {
    expect((await api().post("/api/users/register").send({ name: "ninja" })).status).toBe(400);
  });

  it("rejects a taken username regardless of case", async () => {
    await createUser({ name: "Ninja" });
    const res = await api().post("/api/users/register").send({ name: "ninja", email: "new@test.com", password: "pw" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username already taken");
  });

  it("rejects a taken email", async () => {
    await createUser({ email: "taken@test.com" });
    const res = await api().post("/api/users/register").send({ name: "new", email: "taken@test.com", password: "pw" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already exists");
  });

  it("allows the new user to log in", async () => {
    await api().post("/api/users/register").send({ name: "ninja", email: "ninja@test.com", password: "pw123456" });
    const res = await api().post("/api/users/login").send({ username: "ninja", password: "pw123456" });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/users/login", () => {
  it("requires username and password", async () => {
    expect((await api().post("/api/users/login").send({ username: "x" })).status).toBe(400);
  });

  it("is case-insensitive on username", async () => {
    const { password } = await createUser({ name: "Ninja" });
    expect((await api().post("/api/users/login").send({ username: "NINJA", password })).status).toBe(200);
  });

  it("rejects an unknown user", async () => {
    expect((await api().post("/api/users/login").send({ username: "ghost", password: "x" })).status).toBe(401);
  });
});

describe("GET /api/users", () => {
  it("lists users without passwords for admins", async () => {
    const { user: admin } = await createUser({ role: "admin" });
    await createUser();

    const res = await api(admin).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((u) => expect(u.password).toBeUndefined());
  });

  it("is forbidden for customers", async () => {
    const { user } = await createUser();
    expect((await api(user).get("/api/users")).status).toBe(403);
  });
});

describe("PUT /api/users/password", () => {
  it("requires both passwords", async () => {
    const { user } = await createUser();
    expect((await api(user).put("/api/users/password").send({ newPassword: "x" })).status).toBe(400);
  });

  it("rejects a wrong current password", async () => {
    const { user } = await createUser();
    const res = await api(user).put("/api/users/password").send({ currentPassword: "nope", newPassword: "new" });
    expect(res.status).toBe(401);
  });

  it("changes the password", async () => {
    const { user, password } = await createUser({ name: "ninja" });

    const res = await api(user).put("/api/users/password").send({ currentPassword: password, newPassword: "brandnew" });

    expect(res.status).toBe(200);
    expect((await api().post("/api/users/login").send({ username: "ninja", password })).status).toBe(401);
    expect((await api().post("/api/users/login").send({ username: "ninja", password: "brandnew" })).status).toBe(200);
  });
});

describe("PUT /api/users/profile", () => {
  it("requires a field to update", async () => {
    const { user } = await createUser();
    expect((await api(user).put("/api/users/profile").send({})).status).toBe(400);
  });

  it("updates name and email", async () => {
    const { user } = await createUser();
    const res = await api(user).put("/api/users/profile").send({ name: "renamed", email: "renamed@test.com" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: "renamed", email: "renamed@test.com" });
  });

  it("allows keeping the own name", async () => {
    const { user } = await createUser({ name: "ninja" });
    expect((await api(user).put("/api/users/profile").send({ name: "Ninja" })).status).toBe(200);
  });

  it("rejects a name or email taken by someone else", async () => {
    await createUser({ name: "taken", email: "taken@test.com" });
    const { user } = await createUser();

    expect((await api(user).put("/api/users/profile").send({ name: "taken" })).status).toBe(400);
    expect((await api(user).put("/api/users/profile").send({ email: "taken@test.com" })).status).toBe(400);
  });
});
