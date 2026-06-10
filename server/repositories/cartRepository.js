const Cart = require("../models/cartModel");

const getAllCarts = async () => {
  return await Cart.find();
};

const getCart = async (id) => {
  return await Cart.findById(id).populate("products.product_id");
};

const getCurrentUserCart = async (userId) => {
  return await Cart.findOne({ user_id: userId }).populate("products.product_id");
};

const createCart = async (cartData) => {
  return await Cart.create(cartData);
};

const updateCart = async (id, newCartData) => {
  return await Cart.findByIdAndUpdate(id, newCartData, { new: true });
};

const addProductToCart = async (cartId, product) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return null;

  const existing = cart.products.find(
    (item) =>
      item.product_id.toString() === product.product_id.toString() &&
      item.size === product.size
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.products.push(product);
  }

  await cart.save();
  return await Cart.findById(cart._id).populate("products.product_id");
};

const removeProductFromCart = async (cartId, productId, size) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return null;

  const cartItem = cart.products.find(
    (item) =>
      item.product_id.toString() === productId &&
      (size === undefined || item.size === size)
  );
  if (!cartItem) return null;

  cart.products.pull(cartItem);
  await cart.save();
  return await Cart.findById(cart._id).populate("products.product_id");
};

const increaseQuantity = async (cartId, productId) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return null;

  const cartItem = cart.products.find(
    (item) => item.product_id.toString() === productId
  );
  if (!cartItem) return null;

  cartItem.quantity += 1;
  await cart.save();
  return await Cart.findById(cart._id).populate("products.product_id");
};

const decreaseQuantity = async (cartId, productId) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return null;

  const cartItem = cart.products.find(
    (item) => item.product_id.toString() === productId
  );
  if (!cartItem) return null;

  cartItem.quantity -= 1;
  await cart.save();
  return await Cart.findById(cart._id).populate("products.product_id");
};

const resetCart = async (id) => {
  const cart = await Cart.findById(id);
  if (!cart) return null;

  cart.products = [];
  await cart.save();
  return cart;
};

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
