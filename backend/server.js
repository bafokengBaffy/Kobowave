require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.options("*", cors());

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// HEALTH CHECK - Critical for Render
app.get("/api/health", (req, res) => {
  console.log("✅ Health check called");
  res.json({
    status: "OK",
    message: "KoboWave Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// SIMPLE TEST ENDPOINT
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working!",
    timestamp: new Date().toISOString(),
  });
});

// MOCK DATA ENDPOINTS (Remove complex routes for now)
app.get("/api/reviews", (req, res) => {
  const reviews = [
    {
      id: 1,
      title: "Great Movie!",
      content: "Amazing storyline and acting",
      rating: 5,
      author: "John Doe",
      type: "movie",
    },
  ];
  res.json({ success: true, data: reviews, total: reviews.length });
});

app.get("/api/movies/popular", (req, res) => {
  const movies = [
    {
      id: 1,
      title: "The Matrix",
      year: "1999",
      rating: 8.7,
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    },
    {
      id: 2,
      title: "Inception",
      year: "2010",
      rating: 8.8,
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    },
  ];
  res.json({ success: true, data: movies, total: movies.length });
});

app.get("/api/restaurants", (req, res) => {
  const restaurants = [
    {
      id: 1,
      name: "Italian Bistro",
      cuisine: "Italian",
      rating: 4.5,
      address: "123 Main Street",
    },
  ];
  res.json({ success: true, data: restaurants, total: restaurants.length });
});

// ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "🚀 KoboWave Backend API - RUNNING",
    version: "1.0.0",
    status: "Active",
    endpoints: [
      "GET /api/health",
      "GET /api/test",
      "GET /api/reviews",
      "GET /api/movies/popular",
      "GET /api/restaurants",
    ],
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.path} not found`,
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("🚨 Server Error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// START SERVER - Production Ready
const PORT = process.env.PORT || 5000;

// Critical: Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("🚨 UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🎉 KoboWave Backend Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 Server: http://0.0.0.0:${PORT}`);
  console.log(`✅ Health: http://0.0.0.0:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = app;
