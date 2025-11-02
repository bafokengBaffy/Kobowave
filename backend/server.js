require("dotenv").config();
const express = require("express");
const cors = require("cors");
const moviesRoutes = require("./routes/movies");
const reviewsRoutes = require("./routes/reviews");
const restaurantsRoutes = require("./routes/restaurants");

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://kobowaves.onrender.com",
  // Add more production domains as needed
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`🚫 CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Security middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `${timestamp} - ${req.method} ${req.originalUrl} - Origin: ${
      req.headers.origin || "No Origin"
    } - IP: ${req.ip}`
  );
  next();
});

// Routes
app.use("/api/movies", moviesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/restaurants", restaurantsRoutes);

// Enhanced health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running smoothly",
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || process.env.SERVER_PORT || 5000,
    omdbConfigured: !!process.env.OMDB_API_KEY,
    firebaseConfigured: !!process.env.FIREBASE_PROJECT_ID,
    corsAllowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

// Enhanced test route for reviews (with better error handling)
app.get("/api/reviews/test", async (req, res) => {
  try {
    // Dynamic import to avoid startup issues if Firebase fails
    const { reviewService } = require("./services/firebaseService");

    // Test Firebase connection
    const reviews = await reviewService.getAllReviews();

    res.json({
      success: true,
      message: "Reviews API is working with Firebase",
      data: {
        totalReviews: reviews.length,
        reviews: reviews.slice(0, 3),
        firebaseStatus: "Connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Reviews test error:", error);
    res.status(500).json({
      success: false,
      error: "Reviews API test failed: " + error.message,
      firebaseStatus: "Disconnected",
      suggestion: "Check Firebase configuration and credentials",
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple test endpoints that don't depend on external services
app.get("/api/test/simple", (req, res) => {
  res.json({
    success: true,
    message: "Simple test endpoint working",
    data: {
      test: "This is a simple response without external dependencies",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// Enhanced simple test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is responding correctly",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin || "No Origin Header",
      status:
        allowedOrigins.includes(req.headers.origin) || !req.headers.origin
          ? "Allowed"
          : "Blocked",
    },
    services: {
      omdb: !!process.env.OMDB_API_KEY ? "Configured" : "Not configured",
      firebase: !!process.env.FIREBASE_PROJECT_ID
        ? "Configured"
        : "Not configured",
    },
  });
});

// Debug endpoint
app.get("/api/debug", (req, res) => {
  const admin = require("firebase-admin");

  res.json({
    status: "active",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    platform: process.platform,
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      configured: !!process.env.FIREBASE_PROJECT_ID,
    },
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin,
      status:
        allowedOrigins.includes(req.headers.origin) || !req.headers.origin
          ? "Allowed"
          : "Blocked",
    },
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to KoboWaves Backend API",
    version: "1.0.0",
    status: "Operational",
    endpoints: {
      health: "/api/health",
      test: "/api/test",
      debug: "/api/debug",
      movies: "/api/movies",
      reviews: "/api/reviews",
      restaurants: "/api/restaurants",
    },
    documentation: "Add your API docs link here",
    timestamp: new Date().toISOString(),
  });
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  // CORS specific error
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: `CORS Policy: Origin '${req.headers.origin}' not allowed`,
      allowedOrigins: allowedOrigins,
      timestamp: new Date().toISOString(),
    });
  }

  // MongoDB/Database errors
  if (error.name === "MongoError" || error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Database error occurred",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack,
      details: error.toString(),
    }),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler - must be last middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      "GET /",
      "GET /api/health",
      "GET /api/test",
      "GET /api/debug",
      "GET /api/test/simple",
      "GET /api/reviews/test",
      "GET /api/movies/popular",
      "GET /api/reviews",
      "GET /api/restaurants",
    ],
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Enhanced server initialization
const startServer = async () => {
  try {
    console.log("🔄 Starting server initialization...");
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔧 CORS Allowed Origins:`, allowedOrigins);
    console.log(`📊 Port: ${PORT}`);

    // Initialize Firebase collections (with better error handling)
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
    const server = app.listen(PORT, (err) => {
      if (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
      }

      const address = server.address();
      console.log(`\n🎉 Server successfully started!`);
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Access URLs:`);
      console.log(`   Local: http://localhost:${PORT}`);
      console.log(`   Network: http://0.0.0.0:${PORT}`);
      console.log(
        `🎬 OMDb API: ${
          process.env.OMDB_API_KEY ? "✅ Configured" : "❌ Not configured"
        }`
      );
      console.log(
        `🔥 Firebase: ${
          process.env.FIREBASE_PROJECT_ID
            ? "✅ Configured"
            : "❌ Not configured"
        }`
      );

      console.log(`\n🔗 Available endpoints:`);
      console.log(`   📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`   🧪 Simple test: http://localhost:${PORT}/api/test`);
      console.log(`   🔍 Debug info: http://localhost:${PORT}/api/debug`);
      console.log(
        `   🎥 Movies API: http://localhost:${PORT}/api/movies/popular`
      );
      console.log(`   📝 Reviews API: http://localhost:${PORT}/api/reviews`);
      console.log(
        `   🍽️  Restaurants API: http://localhost:${PORT}/api/restaurants`
      );
      console.log(`\n🚀 Ready to accept requests from:`, allowedOrigins);
    });

    // Enhanced server event handlers
    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

    server.on("listening", () => {
      console.log("📡 Server is listening for connections");
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error(
          "❌ Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to initialize server:", error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
