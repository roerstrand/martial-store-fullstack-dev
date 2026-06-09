const User = require("../models/userModel");

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const findUserByName = async (name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return await User.findOne({ name: new RegExp(`^${escaped}$`, "i") });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const updateUserPassword = async (userId, hashedPassword) => {
  return await User.findByIdAndUpdate(userId, { password: hashedPassword });
};

const updateUserProfile = async (userId, fields) => {
  return await User.findByIdAndUpdate(userId, fields, { new: true, runValidators: true });
};

module.exports = { findUserByEmail, findUserByName, createUser, updateUserPassword, updateUserProfile };
