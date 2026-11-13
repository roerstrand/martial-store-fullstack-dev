const request = require("supertest");
const app = require("../../app");
const { tokenFor } = require("./factories");

const CSRF = { "X-Requested-With": "XMLHttpRequest" };
const METHODS = ["get", "post", "put", "patch", "delete"];

const api = (user) =>
  Object.fromEntries(
    METHODS.map((method) => [
      method,
      (url) => {
        const req = request(app)[method](url).set(CSRF);
        return user ? req.set("Cookie", `accessToken=${tokenFor(user)}`) : req;
      },
    ]),
  );

module.exports = { api, CSRF };
