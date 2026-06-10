const express = require("express");
const tokenValidator = require("../middleware/validateTokenHandler");
const { optionalValidateToken } = require("../middleware/validateTokenHandler");
const adminValidator = require("../middleware/adminValidator");
const {
  getAllOrders,
  getOrder,
  getMyOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

router
  .route("/")
  .get(tokenValidator, adminValidator, getAllOrders)
  .post(optionalValidateToken, createOrder);

router.get("/me", tokenValidator, getMyOrders);

router
  .route("/:id")
  .get(tokenValidator, getOrder)
  .delete(tokenValidator, adminValidator, deleteOrder);

router.patch("/:id/status", tokenValidator, adminValidator, updateOrderStatus);

module.exports = router;
