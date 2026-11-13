const { api } = require("./helpers/http");
const Article = require("../models/articleModel");

const makeArticle = (overrides = {}) =>
  Article.create({
    title: "Guard basics",
    excerpt: "Intro",
    content: "Body",
    author: "Coach",
    category: "bjj",
    ...overrides,
  });

describe("GET /api/articles", () => {
  it("returns all articles without filters", async () => {
    await makeArticle();
    await makeArticle({ title: "Jab", category: "boxing" });

    const res = await api().get("/api/articles");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filters by category", async () => {
    await makeArticle();
    await makeArticle({ title: "Jab", category: "boxing" });

    const res = await api().get("/api/articles?category=boxing");

    expect(res.body.map((a) => a.title)).toEqual(["Jab"]);
  });

  it("returns a random sample limited by limit", async () => {
    await Promise.all([1, 2, 3, 4, 5].map((n) => makeArticle({ title: `A${n}` })));

    const res = await api().get("/api/articles?random=true&limit=2");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("defaults the random sample size to 3", async () => {
    await Promise.all([1, 2, 3, 4, 5].map((n) => makeArticle({ title: `A${n}` })));

    const res = await api().get("/api/articles?random=true");

    expect(res.body).toHaveLength(3);
  });
});

describe("GET /api/articles/:id", () => {
  it("returns one article", async () => {
    const article = await makeArticle();

    const res = await api().get(`/api/articles/${article.id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Guard basics");
  });

  it("responds 404 for a missing article", async () => {
    expect((await api().get("/api/articles/64b000000000000000000000")).status).toBe(404);
  });
});
