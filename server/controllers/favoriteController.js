const asyncHandler = require("express-async-handler");
const {
  getMyFavoriteListService,
  createFavoriteListService,
  addProductToFavoritesService,
  removeProductFromFavoritesService,
} = require("../services/favoriteService");

// @desc    GET favorite list for current user
// @route   GET /api/favorites/me
// @access  private
const getMyFavoriteList = asyncHandler(async (req, res) => {
  const favoriteList = await getMyFavoriteListService(req.user.id);
  if (!favoriteList) {
    return res.status(200).json({ products: [] });
  }
  res.status(200).json(favoriteList);
});

// @desc    Create favorite list for current user
// @route   POST /api/favorites
// @access  private
const createFavoriteList = asyncHandler(async (req, res) => {
  const existing = await getMyFavoriteListService(req.user.id);
  if (existing) {
    res.status(400);
    throw new Error("Favorite list already exists");
  }
  const favoriteList = await createFavoriteListService(req.user.id);
  res.status(201).json(favoriteList);
});

// @desc    Add product to favorites
// @route   POST /api/favorites/products/:productId
// @access  private
const addProductToFavorites = asyncHandler(async (req, res) => {
  const favoriteList = await addProductToFavoritesService(req.user.id, req.params.productId);
  if (!favoriteList) {
    res.status(404);
    throw new Error("Favorite list not found");
  }
  res.status(200).json(favoriteList);
});

// @desc    Remove product from favorites
// @route   DELETE /api/favorites/products/:productId
// @access  private
const removeProductFromFavorites = asyncHandler(async (req, res) => {
  const favoriteList = await removeProductFromFavoritesService(req.user.id, req.params.productId);
  if (!favoriteList) {
    res.status(404);
    throw new Error("Favorite list not found");
  }
  res.status(200).json(favoriteList);
});

module.exports = {
  getMyFavoriteList,
  createFavoriteList,
  addProductToFavorites,
  removeProductFromFavorites,
};
