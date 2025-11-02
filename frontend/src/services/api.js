// src/services/api.js
import axios from "axios";

// Simple API configuration
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://kobowave-backend.onrender.com/api"
    : "http://localhost:5000/api";

console.log("🔧 API Configuration:");
console.log("   Environment:", process.env.NODE_ENV);
console.log("   API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Simple request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("🚨 Request setup error:", error);
    return Promise.reject(error);
  }
);

// Simple response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Success: ${response.config.url} - Status: ${response.status}`
    );
    return response;
  },
  (error) => {
    console.error("🚨 API Error:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      status: error.response?.status,
    });

    return Promise.reject(error);
  }
);

// Simple data extractor
const getData = (response) => {
  return response.data?.data || response.data;
};

// Movie API
export const movieAPI = {
  getPopular: async () => {
    try {
      const response = await api.get("/movies/popular");
      const data = getData(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch popular movies:", error.message);
      return [];
    }
  },
};

// Restaurant API
export const restaurantAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/restaurants");
      const data = getData(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch restaurants:", error.message);
      return [];
    }
  },
};

// Review API
export const reviewAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/reviews");
      const data = getData(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch reviews:", error.message);
      return [];
    }
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    console.log("✅ Backend health check passed");
    return response.data;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    throw error;
  }
};

export default api;
