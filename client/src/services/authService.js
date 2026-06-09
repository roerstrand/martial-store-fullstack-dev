import api from "./api";

//Exports direkt i funktionsdeklarationer
export const register = async (userData) => {
  const response = await api.post("users/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("users/login", credentials);
  localStorage.setItem("token", response.data.token);
  return response.data;
};


export const logout = () => {
  localStorage.removeItem("token");
};

export const getCurrentUser = async () => {
  const response = await api.get("users/current");
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put("users/password", { currentPassword, newPassword });
  return response.data;
};

export const updateProfile = async (fields) => {
  const response = await api.put("users/profile", fields);
  return response.data;
};
