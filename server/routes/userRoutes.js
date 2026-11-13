const express = require("express");
const tokenHandler = require("../middleware/validateTokenHandler");
const adminValidator = require("../middleware/adminValidator");
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUsers,
  changePassword,
  updateProfile,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/current", tokenHandler, getCurrentUser);
router.get("/", tokenHandler, adminValidator, getUsers);
router.put("/password", tokenHandler, changePassword);
router.put("/profile", tokenHandler, updateProfile);

module.exports = router;
