const request = require("supertest");
const app = require("../app");

describe("GET /", () => {
  it("responds with api status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Martial store api running");
  });
});

describe("unknown api route", () => {
  it("responds 404", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});
