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
  timeout: 15000,
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(
      `🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    console.log(`🌍 Full URL: ${fullUrl}`);
    return config;
  },
  (error) => {
    console.error("🚨 Request setup error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
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
    });

    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout - Backend server is not responding");
    } else if (
      error.code === "ECONNREFUSED" ||
      error.message === "Network Error"
    ) {
      console.error("🚨 Backend server is not running or connection refused");
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

// Enhanced data extraction helper
const extractData = (response) => {
  // Handle different response structures
  if (!response.data) {
    return null;
  }

  // If response has success field and data field
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }

  // If response is directly the data array/object
  if (Array.isArray(response.data) || typeof response.data === "object") {
    return response.data;
  }

  // Fallback: return the entire response data
  return response.data;
};

// Movie API calls with enhanced data handling
export const movieAPI = {
  getPopular: async () => {
    try {
      const response = await api.get("/movies/popular");
      const data = extractData(response);

      // Handle different movie data structures
      if (data && data.results) {
        return data.results; // TMDB-style structure
      }
      if (Array.isArray(data)) {
        return data; // Direct array
      }
      if (data && Array.isArray(data.data)) {
        return data.data; // Nested data structure
      }

      console.warn("Unexpected movie data structure:", data);
      return data || [];
    } catch (error) {
      console.error("Failed to fetch popular movies:", error);
      // Return empty array as fallback
      return [];
    }
  },

  search: async (query) => {
    try {
      const response = await api.get(
        `/movies/search?query=${encodeURIComponent(query)}`
      );
      const data = extractData(response);

      if (data && data.results) {
        return data.results;
      }
      if (Array.isArray(data)) {
        return data;
      }

      return data || [];
    } catch (error) {
      console.error("Movie search failed:", error);
      return [];
    }
  },

  getDetails: async (id) => {
    try {
      const response = await api.get(`/movies/${id}`);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch movie details:", error);
      return null;
    }
  },
};

// Restaurant API calls with enhanced data handling
export const restaurantAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/restaurants");
      const data = extractData(response);

      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }

      console.warn("Unexpected restaurant data structure:", data);
      return data || [];
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      return [];
    }
  },

  search: async (query) => {
    try {
      const response = await api.get(
        `/restaurants/search?query=${encodeURIComponent(query)}`
      );
      const data = extractData(response);

      if (data && data.results) {
        return data.results;
      }
      if (Array.isArray(data)) {
        return data;
      }

      return data || [];
    } catch (error) {
      console.error("Restaurant search failed:", error);
      return [];
    }
  },

  getDetails: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return extractData(response);
    } catch (error) {
      console.error("Failed to fetch restaurant details:", error);
      return null;
    }
  },
};

// Review API calls with enhanced data handling
export const reviewAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/reviews", { params });
      const data = extractData(response);

      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }

      console.warn("Unexpected review data structure:", data);
      return data || [];
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      return [];
    }
  },

  getByMovie: async (movieId) => {
    try {
      const response = await api.get(`/reviews/movie/${movieId}`);
      const data = extractData(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Failed to fetch reviews for movie ${movieId}:`, error);
      return [];
    }
  },

  getByRestaurant: async (restaurantId) => {
    try {
      const response = await api.get(`/reviews/restaurant/${restaurantId}`);
      const data = extractData(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(
        `Failed to fetch reviews for restaurant ${restaurantId}:`,
        error
      );
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/reviews/${id}`);
      return extractData(response);
    } catch (error) {
      console.error(`Failed to fetch review ${id}:`, error);
      return null;
    }
  },

  create: async (reviewData) => {
    try {
      const response = await api.post("/reviews", reviewData);
      return extractData(response);
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    }
  },

  update: async (id, reviewData) => {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData);
      return extractData(response);
    } catch (error) {
      console.error(`Failed to update review ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return extractData(response);
    } catch (error) {
      console.error(`Failed to delete review ${id}:`, error);
      throw error;
    }
  },
};

// Health check with better error handling
export const healthCheck = async (retries = 2) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get("/health");
      console.log("✅ Backend health check passed");
      return extractData(response);
    } catch (error) {
      console.warn(`⚠️ Health check attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const health = await healthCheck();
    console.log("🔗 Backend connection test successful");
    return { success: true, data: health };
  } catch (error) {
    console.error("🔗 Backend connection test failed");
    return {
      success: false,
      error: error.message,
      suggestion: "Backend server may be down or starting up",
    };
  }
};

export default api;
