import api from "./api";

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/products${query ? `?${query}` : ""}`);
  return response.data;
};

export const getNewArrivals = async () => {
  const response = await api.get("/products?newArrival=true");
  return response.data;
};

export const getLimitedSale = async () => {
  const response = await api.get("/products?limitedSale=true");
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
