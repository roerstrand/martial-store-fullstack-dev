import axios from "axios";
import { resolveApiBaseUrl } from "./apiBaseUrl";

const api = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env),
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

export default api;
