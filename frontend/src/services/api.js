// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
      console.error("🚨 Backend server is not running or connection refused");
      console.error(
        "💡 Please make sure your backend server is running on port 5000"
      );
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Movie API calls
export const movieAPI = {
  getPopular: () => api.get("/movies/popular"),
  search: (query) =>
    api.get(`/movies/search?query=${encodeURIComponent(query)}`),
  getDetails: (id) => api.get(`/movies/${id}`),
};

// Restaurant API calls
export const restaurantAPI = {
  getAll: () => api.get("/restaurants"),
  search: (query) =>
    api.get(`/restaurants/search?query=${encodeURIComponent(query)}`),
  getDetails: (id) => api.get(`/restaurants/${id}`),
};

// Review API calls - UPDATED to match new backend routes
export const reviewAPI = {
  getAll: (params = {}) => api.get("/reviews", { params }),
  getByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),
  getByRestaurant: (restaurantId) =>
    api.get(`/reviews/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (reviewData) => api.post("/reviews", reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Health check
export const healthCheck = () => api.get("/health");

export default api;
