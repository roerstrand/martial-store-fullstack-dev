const Product = require("../models/productModel");

const getAllProducts = async (filter = {}) => {
  return await Product.find(filter);
};

const getProduct = async (id) => {
  return await Product.findById(id);
};

const getCurrentUserProducts = async (userId) => {
  return await Product.find({ user_id: userId }).populate("user_id", "name email");
};

const createProduct = async (productData) => {
  const product = await Product.create(productData);

  return product;
};

const updateProduct = async (id, body) => {
  const product = await Product.findByIdAndUpdate(id, body, {
    new: true,
  });

  return product;
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCurrentUserProducts,
};
