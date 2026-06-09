const FavoriteList = require("../models/favoriteModel");

const getFavoriteListByUser = async (userId) => {
  return await FavoriteList.findOne({ user_id: userId }).populate("products");
};

const createFavoriteList = async (userId) => {
  return await FavoriteList.create({ user_id: userId, products: [] });
};

const addProductToFavorites = async (userId, productId) => {
  return await FavoriteList.findOneAndUpdate(
    { user_id: userId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate("products");
};

const removeProductFromFavorites = async (userId, productId) => {
  return await FavoriteList.findOneAndUpdate(
    { user_id: userId },
    { $pull: { products: productId } },
    { new: true }
  ).populate("products");
};

module.exports = {
  getFavoriteListByUser,
  createFavoriteList,
  addProductToFavorites,
  removeProductFromFavorites,
};
