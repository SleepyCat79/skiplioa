import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30000, // Increased timeout to 30 seconds
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log error details for debugging
    if (err.code === "ECONNABORTED") {
      console.error("Request timeout:", err.config?.url);
    } else if (err.code === "ERR_NETWORK") {
      console.error("Network error:", err.message);
    } else if (err.response) {
      console.error("API error:", err.response.status, err.response.data);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
