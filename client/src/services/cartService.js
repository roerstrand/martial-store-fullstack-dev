import api from "./api";

export const getCart = async () => {
  const response = await api.get("/carts/me");
  return response.data;
};

export const createCart = async () => {
  const response = await api.post("/carts");
  return response.data;
};

export const addCartItem = async (cartId, productId, size) => {
  const response = await api.post(`/carts/${cartId}/products`, { product_id: productId, size });
  return response.data;
};

export const removeCartItem = async (cartId, productId, size) => {
  const response = await api.delete(`/carts/${cartId}/products/${productId}`, {
    params: size ? { size } : undefined,
  });
  return response.data;
};

export const increaseQuantity = async (cartId, productId) => {
  const response = await api.patch(`/carts/${cartId}/products/${productId}/increase`);
  return response.data;
};

export const decreaseQuantity = async (cartId, productId) => {
  const response = await api.patch(`/carts/${cartId}/products/${productId}/decrease`);
  return response.data;
};

export const resetCart = async (cartId) => {
  const response = await api.delete(`/carts/${cartId}/reset`);
  return response.data;
};
