import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true
});

instance.interceptors.request.use((config) => {
  const token = Cookies.get("tokenTaller");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("tokenTaller");
      Cookies.remove("userTaller");
      if (window.location.pathname !== "/pages/login") window.location.href = "/pages/login";
    }
    return Promise.reject(error);
  }
);

const httpCliente = {
  get: (url, params, config = {}) => instance.get(url, { params: params || {}, ...config }),
  post: (url, body, config = {}) => instance.post(url, body, config),
  put: (url, body, config = {}) => instance.put(url, body, config),
  patch: (url, body, config = {}) => instance.patch(url, body, config),
  delete: (url, config = {}) => instance.delete(url, config)
};

export default httpCliente;
