// src/services/api.js
import axios from "axios";

// Determine API base URL with fallbacks
const getApiBaseUrl = () => {
  // Priority 1: Environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Priority 2: Default production backend
  if (process.env.NODE_ENV === "production") {
    return "https://kobowave-backend.onrender.com/api";
  }

  // Priority 3: Local development
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

console.log("🔧 API Configuration:");
console.log("   Environment:", process.env.NODE_ENV);
console.log("   API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Increased timeout to 15 seconds
  withCredentials: false, // Set to true if using cookies/auth
});

// Request interceptor with enhanced logging
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(
      `🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    console.log(`🌍 Full URL: ${fullUrl}`);
    console.log(`⏰ Timeout: ${config.timeout}ms`);
    return config;
  },
  (error) => {
    console.error("🚨 Request setup error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Success: ${response.config.url} - Status: ${response.status}`
    );
    return response;
  },
  (error) => {
    const { config, code, message, response } = error;

    console.error("🚨 API Error Details:", {
      url: config?.url,
      method: config?.method?.toUpperCase(),
      code: code,
      message: message,
      status: response?.status,
      statusText: response?.statusText,
    });

    // Handle different error types
    if (error.code === "ECONNABORTED") {
      console.error(
        "⏰ Request timeout - Backend server is not responding within 15 seconds"
      );
      console.error("💡 Possible solutions:");
      console.error("   1. Check if backend is deployed and running");
      console.error("   2. Verify the backend URL is correct");
      console.error("   3. Check backend logs for errors");
    } else if (
      error.code === "ECONNREFUSED" ||
      error.message === "Network Error"
    ) {
      console.error("🚨 Backend server is not running or connection refused");
      console.error("💡 Please make sure your backend server is running");
      console.error(`   Backend URL: ${API_BASE_URL}`);
    } else if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 404:
          console.error("📭 Endpoint not found - check backend routes");
          break;
        case 500:
          console.error("🔧 Server error - check backend logs");
          break;
        case 503:
          console.error("🛠️ Service unavailable - backend might be starting");
          break;
        default:
          console.error(`📊 Server error: ${error.response.status}`);
      }
    }

    return Promise.reject({
      ...error,
      userMessage: getErrorMessage(error),
    });
  }
);

// Helper function for user-friendly error messages
function getErrorMessage(error) {
  if (error.code === "ECONNABORTED") {
    return "Request timeout. Please try again.";
  }
  if (error.code === "ECONNREFUSED" || error.message === "Network Error") {
    return "Cannot connect to server. Please check your connection.";
  }
  if (error.response?.status === 404) {
    return "Requested resource not found.";
  }
  if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  }
  return "An unexpected error occurred.";
}

// Movie API calls with error handling
export const movieAPI = {
  getPopular: async () => {
    try {
      const response = await api.get("/movies/popular");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch popular movies:", error);
      // Return fallback data or re-throw
      throw error;
    }
  },
  search: async (query) => {
    try {
      const response = await api.get(
        `/movies/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Movie search failed:", error);
      throw error;
    }
  },
  getDetails: async (id) => {
    try {
      const response = await api.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch movie details:", error);
      throw error;
    }
  },
};

// Restaurant API calls with error handling
export const restaurantAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/restaurants");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      throw error;
    }
  },
  search: async (query) => {
    try {
      const response = await api.get(
        `/restaurants/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Restaurant search failed:", error);
      throw error;
    }
  },
  getDetails: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch restaurant details:", error);
      throw error;
    }
  },
};

// Review API calls with enhanced error handling
export const reviewAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/reviews", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      throw error;
    }
  },
  getByMovie: async (movieId) => {
    try {
      const response = await api.get(`/reviews/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch reviews for movie ${movieId}:`, error);
      throw error;
    }
  },
  getByRestaurant: async (restaurantId) => {
    try {
      const response = await api.get(`/reviews/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch reviews for restaurant ${restaurantId}:`,
        error
      );
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch review ${id}:`, error);
      throw error;
    }
  },
  create: async (reviewData) => {
    try {
      const response = await api.post("/reviews", reviewData);
      return response.data;
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    }
  },
  update: async (id, reviewData) => {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update review ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete review ${id}:`, error);
      throw error;
    }
  },
};

// Health check with retry logic
export const healthCheck = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get("/health");
      console.log("✅ Backend health check passed");
      return response.data;
    } catch (error) {
      console.warn(`⚠️ Health check attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error("❌ All health check attempts failed");
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const health = await healthCheck();
    console.log("🔗 Backend connection test:", health);
    return { success: true, data: health };
  } catch (error) {
    console.error("🔗 Backend connection test failed:", error.message);
    return {
      success: false,
      error: error.message,
      suggestion: "Check if backend is deployed and running",
    };
  }
};

export default api;
