const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {
  findUserByEmail,
  findUserByName,
  createUser,
  updateUserPassword,
} = require("../repositories/userRepository");

const registerUserService = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword });
  return { _id: user.id, name: user.name, email: user.email };
};

const loginUserService = async ({ username, password }) => {
  const user = await findUserByName(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    {
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        role: user.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" },
  );

  return {
    token: accessToken,
    user: { name: user.name, email: user.email, id: user.id, role: user.role },
  };
};

const changePasswordService = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(userId, hashedPassword);
};

module.exports = { registerUserService, loginUserService, changePasswordService };
