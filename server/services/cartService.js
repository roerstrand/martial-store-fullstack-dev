const {
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
} = require("../repositories/cartRepository");

const getAllCartsService = async () => {
  return await getAllCarts();
};

const getCartService = async (id) => {
  return await getCart(id);
};

const getCurrentUserCartService = async (userId) => {
  return await getCurrentUserCart(userId);
};

const createCartService = async (cartData) => {
  return await createCart(cartData);
};

const updateCartService = async (id, cartData) => {
  return await updateCart(id, cartData);
};

const addProductToCartService = async (cartId, product) => {
  return await addProductToCart(cartId, product);
};

const removeProductFromCartService = async (cartId, productId, size) => {
  return await removeProductFromCart(cartId, productId, size);
};

const increaseQuantityService = async (cartId, productId) => {
  return await increaseQuantity(cartId, productId);
};

const decreaseQuantityService = async (cartId, productId) => {
  return await decreaseQuantity(cartId, productId);
};

const resetCartService = async (id) => {
  return await resetCart(id);
};

module.exports = {
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
};
