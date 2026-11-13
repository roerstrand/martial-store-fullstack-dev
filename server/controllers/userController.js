const asyncHandler = require("express-async-handler");
const {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  baseCookieOptions,
} = require("../config/authCookie");
const {
  registerUserService,
  loginUserService,
  getCurrentUserService,
  changePasswordService,
  updateProfileService,
} = require("../services/userService");

// @desc Register a user
// @route POST /api/users/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const user = await registerUserService({ name, email, password });
  res.status(201).json(user);
});

// @desc Login a user
// @route POST /api/users/login
// @access public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }

  const { token, user } = await loginUserService({ username, password });
  res.cookie(ACCESS_TOKEN_COOKIE, token, accessTokenCookieOptions());
  res.status(200).json({ user });
});

// @desc Logout the current user
// @route POST /api/users/logout
// @access public
const logoutUser = (req, res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions());
  res.status(200).json({ message: "Logged out" });
};

// @desc Get current user
// @route GET /api/users/current
// @access private
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getCurrentUserService(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  res.status(200).json(user);
});

// @desc Get all users
// @route GET /api/users
// @access private/admin
const getUsers = asyncHandler(async (req, res) => {
  const User = require("../models/userModel");
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

// @desc Change current user's password
// @route PUT /api/users/password
// @access private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  await changePasswordService({ userId: req.user.id, currentPassword, newPassword });
  res.status(200).json({ message: "Password updated successfully" });
});

// @desc Update current user's name/email
// @route PUT /api/users/profile
// @access private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) {
    res.status(400);
    throw new Error("Nothing to update");
  }
  const updated = await updateProfileService({ userId: req.user.id, name, email });
  res.status(200).json(updated);
});

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser, getUsers, changePassword, updateProfile };
