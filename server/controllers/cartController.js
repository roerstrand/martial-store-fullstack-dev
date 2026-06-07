const asyncHandler = require("express-async-handler");
const {
  getAllCartsService,
  getCartService,
  getCurrentUserCartService,
  createCartService,
  updateCartService,
  addProductToCartService,
  removeProductFromCartService,
  increaseQuantityService,
  decreaseQuantityService,
  resetCartService,
} = require("../services/cartService");

// @desc    GET all carts
// @route   GET /api/carts
// @access  private/admin
const getAllCarts = asyncHandler(async (req, res) => {
  const carts = await getAllCartsService();
  res.status(200).json(carts);
});

// @desc    GET cart by id
// @route   GET /api/carts/:id
// @access  private
const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.params.id);
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.status(200).json(cart);
});

// @desc    GET cart for current user
// @route   GET /api/carts/me
// @access  private
const getCurrentUserCart = asyncHandler(async (req, res) => {
  const cart = await getCurrentUserCartService(req.user.id);
  if (!cart) {
    res.status(404);
    throw new Error("No cart found for current user");
  }
  res.status(200).json(cart);
});

// @desc    Create cart for current user
// @route   POST /api/carts
// @access  private
const createCart = asyncHandler(async (req, res) => {
  const cart = await createCartService({ user_id: req.user.id, products: [] });
  res.status(201).json(cart);
});

// @desc    Update cart
// @route   PUT /api/carts/:id
// @access  private
const updateCart = asyncHandler(async (req, res) => {
  const cart = await updateCartService(req.params.id, req.body);
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.status(200).json(cart);
});

// @desc    Add product to cart
// @route   POST /api/carts/:id/products
// @access  private
const addProductToCart = asyncHandler(async (req, res) => {
  const { product_id, size, quantity } = req.body;
  if (!product_id) {
    res.status(400);
    throw new Error("product_id is required");
  }
  const cart = await addProductToCartService(req.params.id, {
    product_id,
    size,
    quantity: quantity || 1,
  });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.status(200).json(cart);
});

// @desc    Remove product from cart
// @route   DELETE /api/carts/:id/products/:productId
// @access  private
const removeProductFromCart = asyncHandler(async (req, res) => {
  const cart = await removeProductFromCartService(
    req.params.id,
    req.params.productId
  );
  if (!cart) {
    res.status(404);
    throw new Error("Cart or product not found");
  }
  res.status(200).json(cart);
});

// @desc    Increase product quantity
// @route   PATCH /api/carts/:id/products/:productId/increase
// @access  private
const increaseQuantity = asyncHandler(async (req, res) => {
  const cart = await increaseQuantityService(
    req.params.id,
    req.params.productId
  );
  if (!cart) {
    res.status(404);
    throw new Error("Cart or product not found");
  }
  res.status(200).json(cart);
});

// @desc    Decrease product quantity
// @route   PATCH /api/carts/:id/products/:productId/decrease
// @access  private
const decreaseQuantity = asyncHandler(async (req, res) => {
  const cart = await decreaseQuantityService(
    req.params.id,
    req.params.productId
  );
  if (!cart) {
    res.status(404);
    throw new Error("Cart or product not found");
  }
  res.status(200).json(cart);
});

// @desc    Reset cart (remove all products)
// @route   DELETE /api/carts/:id/reset
// @access  private
const resetCart = asyncHandler(async (req, res) => {
  const cart = await resetCartService(req.params.id);
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  res.status(200).json(cart);
});

module.exports = {
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
};
