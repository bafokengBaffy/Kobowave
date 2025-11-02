require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moviesRoutes = require("./routes/movies");
const reviewsRoutes = require("./routes/reviews");
const restaurantsRoutes = require("./routes/restaurants");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/movies", moviesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/restaurants", restaurantsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    port: process.env.SERVER_PORT,
    omdbConfigured: !!process.env.OMDB_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Test route for reviews (with error handling)
app.get("/api/reviews/test", async (req, res) => {
  try {
    // Dynamically require to avoid startup issues
    const { reviewService } = require("./services/firebaseService");
    const reviews = await reviewService.getAllReviews();

    res.json({
      success: true,
      message: "Reviews API is working with Firebase",
      data: {
        totalReviews: reviews.length,
        reviews: reviews.slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Reviews test error:", error);
    res.status(500).json({
      success: false,
      error: "Reviews API test failed: " + error.message,
    });
  }
});

// Simple test endpoint that doesn't require Firebase
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is responding",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error: " + error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

const PORT = process.env.SERVER_PORT || 5000;

// Initialize Firebase and start server
const startServer = async () => {
  try {
    console.log("🔄 Starting server initialization...");

    // Initialize Firebase collections (with try-catch)
    try {
      const { initializeCollections } = require("./services/firebaseService");
      await initializeCollections();
      console.log("✅ Firebase collections initialized");
    } catch (firebaseError) {
      console.error(
        "⚠️ Firebase initialization warning:",
        firebaseError.message
      );
      console.log("🔄 Continuing without Firebase...");
    }

    // Start server
    app.listen(PORT, (err) => {
      if (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
      }

      console.log(`\n🎉 Server successfully started!`);
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(
        `🎬 OMDb API: ${
          process.env.OMDB_API_KEY ? "Configured" : "Not configured"
        }`
      );
      console.log(`\n🔗 Available endpoints:`);
      console.log(`   📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`   🧪 Simple test: http://localhost:${PORT}/api/test`);
      console.log(
        `   🎥 Movies API: http://localhost:${PORT}/api/movies/popular`
      );
      console.log(`   📝 Reviews API: http://localhost:${PORT}/api/reviews`);
      console.log(
        `   🍽️  Restaurants API: http://localhost:${PORT}/api/restaurants`
      );
      console.log(`\n🚀 Ready to accept requests!`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize server:", error);
    process.exit(1);
  }
};

startServer();
