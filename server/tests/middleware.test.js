const adminValidator = require("../middleware/adminValidator");
const { errorHandler } = require("../middleware/errorMiddleware");
const { requireCsrfHeader } = require("../middleware/csrfMiddleware");

const mockRes = (statusCode = 200) => {
  const res = { statusCode };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(() => res);
  return res;
};

describe("adminValidator", () => {
  it("calls next for admins", () => {
    const next = jest.fn();
    adminValidator({ user: { role: "admin" } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it.each([[undefined], [{ role: "user" }]])("responds 403 for %p", (user) => {
    const res = mockRes();
    const next = jest.fn();
    adminValidator({ user }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("errorHandler", () => {
  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  it("uses err.statusCode when present", () => {
    const res = mockRes();
    errorHandler(Object.assign(new Error("Nope"), { statusCode: 409 }), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Nope" }));
  });

  it("keeps an error status already set on the response", () => {
    const res = mockRes(404);
    errorHandler(new Error("Missing"), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("falls back to 500", () => {
    const res = mockRes(200);
    errorHandler(new Error("Boom"), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("hides the stack in production", () => {
    process.env.NODE_ENV = "production";
    const res = mockRes();
    errorHandler(new Error("Boom"), {}, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ message: "Boom", stack: null });
  });
});

describe("requireCsrfHeader", () => {
  const reqWith = (method, header) => ({ method, get: () => header });

  it.each(["GET", "HEAD", "OPTIONS"])("lets %s through", (method) => {
    const next = jest.fn();
    requireCsrfHeader(reqWith(method), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])("blocks %s without header", (method) => {
    const res = mockRes();
    requireCsrfHeader(reqWith(method), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("lets unsafe methods through with the header", () => {
    const next = jest.fn();
    requireCsrfHeader(reqWith("POST", "XMLHttpRequest"), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
