const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const {
  getProductsService,
  getProductService,
  createProductService,
  updateProductService,
  deleteProductService,
  getCurrentUserProductsService,
} = require("../services/productService");

// @desc GET all products
// @route GET /api/products
// @access public
const getProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.newArrival === "true")   filter.isNewArrival   = true;
  if (req.query.limitedSale === "true")  filter.isLimitedSale  = true;
  if (req.query.category)               filter.category       = req.query.category;

  const products = await getProductsService(filter);

  if (!products) {
    res.status(404);
    throw new Error("No products found");
  }
  res.status(200).json(products);
});

// @desc GET one product by id
// @route GET /api/products/:id
// @access public
const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductService(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

// @desc GET all products for current user
// @route GET /api/products
// @access private
const getCurrentUserProducts = asyncHandler(async (req, res) => {
  const products = await getCurrentUserProductsService(req.user.id);

  if (!products) {
    res.status(404);
    throw new Error("No products found for current user");
  }
  res.status(200).json(products);
});

// @desc create one product
// @route POST /api/products
// @access private/admin
const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, category, image, sale, rating, sold } = req.body;
  if (!title || !price || !description || !category) {
    res.status(400);
    throw new Error("title, price, description and category are required");
  }
  const product = await createProductService({
    title, price, description, category,
    image: image || "",
    sale: sale ?? 0,
    rating: rating ?? 0,
    sold: sold ?? 0,
    user_id: req.user.id,
  });
  res.status(201).json(product);
});

// @desc update one product
// @route PUT /api/products/:id
// @access private/admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(req.params.id, req.body);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

// @desc delete one product
// @route DELETE /api/products/:id
// @access private/admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await deleteProductService(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json({ message: "Product deleted" });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCurrentUserProducts,
};
