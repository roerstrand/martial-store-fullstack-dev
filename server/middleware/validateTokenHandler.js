const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_COOKIE } = require("../config/authCookie");

const decodeUser = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET).user;
  } catch {
    return null;
  }
};

const validateToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  const user = decodeUser(token);
  if (!user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  req.user = user;
  next();
});

const optionalValidateToken = (req, res, next) => {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (token) {
    const user = decodeUser(token);
    if (user) req.user = user;
  }
  next();
};

module.exports = validateToken;
module.exports.optionalValidateToken = optionalValidateToken;
