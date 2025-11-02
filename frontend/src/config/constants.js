// Application Constants
export const APP_CONFIG = {
  name: "KoboWave",
  version: "1.0.0",
  author: "Bafokeng Khoali (@BaffyKay)",
  ports: {
    frontend: 3000,
    backend: 5000,
  },
  api: {
    baseURL: "http://localhost:5000/api",
    timeout: 10000,
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  MOVIES: {
    POPULAR: "/movies/popular",
    SEARCH: "/movies/search",
    DETAILS: "/movies/:id",
    OMDB: "/movies/omdb/:title",
  },
  RESTAURANTS: {
    ALL: "/restaurants",
    SEARCH: "/restaurants/search",
    DETAILS: "/restaurants/:id",
  },
  REVIEWS: {
    ALL: "/reviews",
    CREATE: "/reviews",
    UPDATE: "/reviews/:id",
    DELETE: "/reviews/:id",
  },
};

// Route Paths
export const ROUTES = {
  HOME: "/",
  MOVIES: "/movies",
  RESTAURANTS: "/restaurants",
  REVIEWS: "/reviews",
  MY_REVIEWS: "/my-reviews",
  ABOUT: "/about",
  LOGIN: "/login",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: "kobowave_user",
  THEME: "kobowave_theme",
  FAVORITES: "kobowave_favorites",
};
