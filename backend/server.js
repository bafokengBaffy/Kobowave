require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// SIMPLE CORS CONFIGURATION - This will work
app.use(
  cors({
    origin: "*", // Allow ALL origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// HEALTH CHECK - Always works
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "KoboWaves Backend is running perfectly!",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// SIMPLE TEST ENDPOINT
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working correctly!",
    timestamp: new Date().toISOString(),
  });
});

// REVIEWS ENDPOINT - With mock data
app.get("/api/reviews", (req, res) => {
  try {
    const reviews = [
      {
        id: 1,
        title: "Amazing Movie Experience",
        content:
          "This movie was absolutely fantastic! Great storyline and acting.",
        rating: 5,
        author: "John Doe",
        date: "2024-01-15",
        type: "movie",
      },
      {
        id: 2,
        title: "Great Restaurant Experience",
        content: "The food and service were excellent. Highly recommended!",
        rating: 4,
        author: "Jane Smith",
        date: "2024-01-14",
        type: "restaurant",
      },
    ];

    res.json({
      success: true,
      data: reviews,
      total: reviews.length,
      message: "Reviews fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
      message: error.message,
    });
  }
});

// MOVIES ENDPOINT - With mock data
app.get("/api/movies/popular", (req, res) => {
  try {
    const movies = [
      {
        id: 1,
        title: "The Matrix",
        year: "1999",
        rating: 8.7,
        genre: "Sci-Fi, Action",
        poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      },
      {
        id: 2,
        title: "Inception",
        year: "2010",
        rating: 8.8,
        genre: "Action, Sci-Fi, Thriller",
        poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      },
    ];

    res.json({
      success: true,
      data: movies,
      total: movies.length,
      message: "Popular movies fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch movies",
      message: error.message,
    });
  }
});

// RESTAURANTS ENDPOINT - With mock data
app.get("/api/restaurants", (req, res) => {
  try {
    const restaurants = [
      {
        id: 1,
        name: "Italian Bistro",
        cuisine: "Italian",
        rating: 4.5,
        address: "123 Main Street, Cityville",
      },
      {
        id: 2,
        name: "Sushi Palace",
        cuisine: "Japanese",
        rating: 4.8,
        address: "456 Oak Avenue, Townsville",
      },
    ];

    res.json({
      success: true,
      data: restaurants,
      total: restaurants.length,
      message: "Restaurants fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch restaurants",
      message: error.message,
    });
  }
});

// ADD REVIEW ENDPOINT
app.post("/api/reviews", (req, res) => {
  try {
    const { title, content, rating, author, type } = req.body;

    // Simple validation
    if (!title || !content || !rating) {
      return res.status(400).json({
        success: false,
        error: "Title, content, and rating are required",
      });
    }

    const newReview = {
      id: Date.now(),
      title,
      content,
      rating: parseInt(rating),
      author: author || "Anonymous",
      type: type || "general",
      date: new Date().toISOString().split("T")[0],
    };

    res.status(201).json({
      success: true,
      data: newReview,
      message: "Review added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to add review",
      message: error.message,
    });
  }
});

// ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "🚀 KoboWaves Backend API - FULLY OPERATIONAL 🚀",
    version: "2.0.0",
    status: "Running Smoothly",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      test: "/api/test",
      reviews: {
        get: "/api/reviews",
        post: "/api/reviews",
      },
      movies: "/api/movies/popular",
      restaurants: "/api/restaurants",
    },
  });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      "GET /api/health",
      "GET /api/test",
      "GET /api/reviews",
      "POST /api/reviews",
      "GET /api/movies/popular",
      "GET /api/restaurants",
    ],
  });
});

// GLOBAL ERROR HANDLER - Critical for production
app.use((error, req, res, next) => {
  console.error("🚨 Global Error Handler:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
  });
});

// START SERVER - Production ready
const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server with error handling
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🎉 KOBOWAVES BACKEND SERVER STARTED SUCCESSFULLY!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 Server URL: http://0.0.0.0:${PORT}`);
  console.log(`\n✅ Available Endpoints:`);
  console.log(`   • GET  /api/health - Health check`);
  console.log(`   • GET  /api/test - Simple test`);
  console.log(`   • GET  /api/reviews - Get all reviews`);
  console.log(`   • POST /api/reviews - Add new review`);
  console.log(`   • GET  /api/movies/popular - Popular movies`);
  console.log(`   • GET  /api/restaurants - Restaurant listings`);
  console.log(`\n🔥 CORS: Enabled for ALL origins`);
  console.log(`📡 Ready to accept requests from your frontend!`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("🚨 Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use`);
  }
});

module.exports = app;
