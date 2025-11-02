require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// SUPER SIMPLE CORS - Allow everything
app.use(cors());
app.use(express.json());

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Simple test endpoints
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    data: { test: "Backend is responding" },
  });
});

// Mock data endpoints (no Firebase dependency)
app.get("/api/reviews", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: "Great movie!", rating: 5 },
      { id: 2, title: "Amazing restaurant", rating: 4 },
    ],
  });
});

app.get("/api/movies/popular", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: "Sample Movie 1", rating: 8.5 },
      { id: 2, title: "Sample Movie 2", rating: 7.8 },
    ],
  });
});

app.get("/api/restaurants", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: "Sample Restaurant 1", cuisine: "Italian" },
      { id: 2, name: "Sample Restaurant 2", cuisine: "Mexican" },
    ],
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "KoboWaves Backend API - MINIMAL VERSION",
    status: "Running",
    endpoints: [
      "/api/health",
      "/api/test",
      "/api/reviews",
      "/api/movies/popular",
      "/api/restaurants",
    ],
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
