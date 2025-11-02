require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// SUPER SIMPLE CORS - This will definitely work
app.use(
  cors({
    origin: "*", // Allow ALL origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// HEALTH CHECK - This will definitely work
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running perfectly!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// SIMPLE TEST ENDPOINT
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    data: { test: "Backend is responding correctly" },
  });
});

// MOCK REVIEWS ENDPOINT
app.get("/api/reviews", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Amazing Movie Experience",
        content: "This movie was absolutely fantastic!",
        rating: 5,
        author: "John Doe",
        date: "2024-01-15",
      },
      {
        id: 2,
        title: "Great Restaurant",
        content: "The food and service were excellent.",
        rating: 4,
        author: "Jane Smith",
        date: "2024-01-14",
      },
    ],
    total: 2,
  });
});

// MOCK MOVIES ENDPOINT
app.get("/api/movies/popular", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "The Matrix",
        year: "1999",
        rating: 8.7,
        poster: "https://example.com/matrix.jpg",
        genre: "Sci-Fi",
      },
      {
        id: 2,
        title: "Inception",
        year: "2010",
        rating: 8.8,
        poster: "https://example.com/inception.jpg",
        genre: "Action",
      },
      {
        id: 3,
        title: "The Shawshank Redemption",
        year: "1994",
        rating: 9.3,
        poster: "https://example.com/shawshank.jpg",
        genre: "Drama",
      },
    ],
    total: 3,
  });
});

// MOCK RESTAURANTS ENDPOINT
app.get("/api/restaurants", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Italian Bistro",
        cuisine: "Italian",
        rating: 4.5,
        address: "123 Main Street",
        image: "https://example.com/italian.jpg",
      },
      {
        id: 2,
        name: "Sushi Palace",
        cuisine: "Japanese",
        rating: 4.8,
        address: "456 Oak Avenue",
        image: "https://example.com/sushi.jpg",
      },
      {
        id: 3,
        name: "Burger Hub",
        cuisine: "American",
        rating: 4.2,
        address: "789 Pine Road",
        image: "https://example.com/burger.jpg",
      },
    ],
    total: 3,
  });
});

// ROOT ENDPOINT
app.get("/", (req, res) => {
  res.json({
    message: "🔥 KoboWaves Backend API - WORKING VERSION 🔥",
    status: "Fully Operational",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/health - Health check",
      "GET /api/test - Simple test",
      "GET /api/reviews - Sample reviews",
      "GET /api/movies/popular - Popular movies",
      "GET /api/restaurants - Restaurant listings",
    ],
  });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      "/api/health",
      "/api/test",
      "/api/reviews",
      "/api/movies/popular",
      "/api/restaurants",
    ],
  });
});

// ERROR HANDLER
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: error.message,
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🎉 🎉 🎉 SERVER SUCCESSFULLY STARTED! 🎉 🎉 🎉`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 Server is ready to accept requests!`);
  console.log(`\n🔗 Test these URLs:`);
  console.log(`   ✅ Health: https://kobowave-backend.onrender.com/api/health`);
  console.log(`   ✅ Test: https://kobowave-backend.onrender.com/api/test`);
  console.log(
    `   ✅ Reviews: https://kobowave-backend.onrender.com/api/reviews`
  );
  console.log(
    `   ✅ Movies: https://kobowave-backend.onrender.com/api/movies/popular`
  );
  console.log(
    `   ✅ Restaurants: https://kobowave-backend.onrender.com/api/restaurants`
  );
  console.log(`\n🔥 CORS is configured to allow ALL origins`);
  console.log(`🎯 Your frontend should now work perfectly!`);
});

module.exports = app;
