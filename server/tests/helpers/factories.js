const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");

const createUser = async (overrides = {}) => {
  const password = overrides.password || "secret123";
  const user = await User.create({
    name: overrides.name || `user${Math.random().toString(36).slice(2, 8)}`,
    email: overrides.email || `${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: await bcrypt.hash(password, 4),
    role: overrides.role || "user",
  });
  return { user, password };
};

const tokenFor = (user) =>
  jwt.sign(
    { user: { name: user.name, email: user.email, id: user.id, role: user.role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" },
  );

const createProduct = async (owner, overrides = {}) =>
  Product.create({
    user_id: owner._id,
    title: "Gi",
    price: 1000,
    description: "A gi",
    category: "bjj",
    ...overrides,
  });

module.exports = { createUser, tokenFor, createProduct };
