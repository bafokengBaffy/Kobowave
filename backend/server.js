require("dotenv").config();
const express = require("express");

const app = express();

// 🔥 CRITICAL FIX: CORS middleware MUST come first
app.use((req, res, next) => {
  console.log(`🌐 CORS handling: ${req.method} ${req.path}`);

  // Set CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS preflight request");
    return res.status(200).end();
  }

  next();
});

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 🎯 HEALTH CHECK - This MUST work
app.get("/api/health", (req, res) => {
  console.log("✅ Health check endpoint called");
  res.json({
    status: "OK",
    message: "🔥 KoboWave Backend is RUNNING!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// 🎯 SIMPLE TEST ENDPOINT
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Backend API is working perfectly!",
    timestamp: new Date().toISOString(),
  });
});

// 🎯 MOCK REVIEWS ENDPOINT
app.get("/api/reviews", (req, res) => {
  console.log("📝 Reviews endpoint called");
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
});

// 🎯 MOCK MOVIES ENDPOINT
app.get("/api/movies/popular", (req, res) => {
  console.log("🎬 Movies endpoint called");
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
    {
      id: 3,
      title: "The Dark Knight",
      year: "2008",
      rating: 9.0,
      genre: "Action, Crime, Drama",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    },
  ];

  res.json({
    success: true,
    data: movies,
    total: movies.length,
    message: "Popular movies fetched successfully",
  });
});

// 🎯 MOCK RESTAURANTS ENDPOINT
app.get("/api/restaurants", (req, res) => {
  console.log("🍽️ Restaurants endpoint called");
  const restaurants = [
    {
      id: 1,
      name: "Italian Bistro",
      cuisine: "Italian",
      rating: 4.5,
      address: "123 Main Street, Cityville",
      description: "Authentic Italian cuisine with fresh ingredients.",
    },
    {
      id: 2,
      name: "Sushi Palace",
      cuisine: "Japanese",
      rating: 4.8,
      address: "456 Oak Avenue, Townsville",
      description: "Fresh sushi and traditional Japanese dishes.",
    },
  ];

  res.json({
    success: true,
    data: restaurants,
    total: restaurants.length,
    message: "Restaurants fetched successfully",
  });
});

// 🎯 ADD REVIEW ENDPOINT
app.post("/api/reviews", (req, res) => {
  console.log("➕ Add review endpoint called");
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
});

// 🎯 ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "🚀 KoboWave Backend API - FULLY OPERATIONAL 🚀",
    version: "3.0.0",
    status: "🔥 RUNNING PERFECTLY",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/health - Health check",
      "GET /api/test - Simple test",
      "GET /api/reviews - Get all reviews",
      "POST /api/reviews - Add new review",
      "GET /api/movies/popular - Popular movies",
      "GET /api/restaurants - Restaurant listings",
    ],
    cors: "✅ ENABLED FOR ALL ORIGINS",
  });
});

// 🎯 API ROOT ENDPOINT
app.get("/api", (req, res) => {
  res.json({
    message: "🎯 KoboWave API Root",
    status: "active",
    version: "3.0.0",
  });
});

// 404 Handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl} not found`,
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

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.path} not found`,
    message: "Check the API documentation for available endpoints",
  });
});

// Global Error Handler
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

// 🚀 START SERVER - Production Ready
const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("🚨 UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `\n🎉 🎉 🎉 KOBOWAVE BACKEND SERVER STARTED SUCCESSFULLY! 🎉 🎉 🎉`
  );
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 Server: http://0.0.0.0:${PORT}`);
  console.log(`✅ Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🎯 Test: http://0.0.0.0:${PORT}/api/test`);
  console.log(`\n🔥 CORS: ENABLED FOR ALL ORIGINS (*)`);
  console.log(`📡 Ready to accept requests from your frontend!`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = app;
