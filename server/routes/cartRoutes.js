const express = require("express");
const tokenValidator = require("../middleware/validateTokenHandler");
const adminValidator = require("../middleware/adminValidator");
const router = express.Router();

const {
  authorizeCart,
  getAllCarts,
  getCart,
  getCurrentUserCart,
  createCart,
  updateCart,
  addProductToCart,
  removeProductFromCart,
  increaseQuantity,
  decreaseQuantity,
  resetCart,
} = require("../controllers/cartController");

router.route("/").get(tokenValidator, adminValidator, getAllCarts).post(tokenValidator, createCart);

router.get("/me", tokenValidator, getCurrentUserCart);

const ownCart = [tokenValidator, authorizeCart];

router
  .route("/:id")
  .get(ownCart, getCart)
  .put(ownCart, updateCart);

router
  .route("/:id/products")
  .post(ownCart, addProductToCart);

router
  .route("/:id/products/:productId")
  .delete(ownCart, removeProductFromCart);

router.patch("/:id/products/:productId/increase", ownCart, increaseQuantity);
router.patch("/:id/products/:productId/decrease", ownCart, decreaseQuantity);

router.delete("/:id/reset", ownCart, resetCart);

module.exports = router;
