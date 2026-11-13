import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

export default api;
