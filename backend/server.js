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
      {
        id: 3,
        title: "Wonderful Film",
        content: "One of the best movies I've seen this year.",
        rating: 5,
        author: "Mike Johnson",
        date: "2024-01-13",
        type: "movie",
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
        description:
          "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        duration: "136 min",
      },
      {
        id: 2,
        title: "Inception",
        year: "2010",
        rating: 8.8,
        genre: "Action, Sci-Fi, Thriller",
        description:
          "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        duration: "148 min",
      },
      {
        id: 3,
        title: "The Shawshank Redemption",
        year: "1994",
        rating: 9.3,
        genre: "Drama",
        description:
          "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        duration: "142 min",
      },
      {
        id: 4,
        title: "The Dark Knight",
        year: "2008",
        rating: 9.0,
        genre: "Action, Crime, Drama",
        description:
          "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        duration: "152 min",
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
        phone: "+1 555-0101",
        hours: "11:00 AM - 10:00 PM",
        description:
          "Authentic Italian cuisine with fresh ingredients and traditional recipes.",
      },
      {
        id: 2,
        name: "Sushi Palace",
        cuisine: "Japanese",
        rating: 4.8,
        address: "456 Oak Avenue, Townsville",
        phone: "+1 555-0102",
        hours: "12:00 PM - 11:00 PM",
        description:
          "Fresh sushi and traditional Japanese dishes in a modern setting.",
      },
      {
        id: 3,
        name: "Burger Hub",
        cuisine: "American",
        rating: 4.2,
        address: "789 Pine Road, Villagetown",
        phone: "+1 555-0103",
        hours: "10:00 AM - 12:00 AM",
        description: "Gourmet burgers and craft beers in a casual atmosphere.",
      },
      {
        id: 4,
        name: "Spice Garden",
        cuisine: "Indian",
        rating: 4.6,
        address: "321 Maple Lane, Citycenter",
        phone: "+1 555-0104",
        hours: "11:30 AM - 10:30 PM",
        description:
          "Traditional Indian cuisine with authentic spices and flavors.",
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
      id: Date.now(), // Simple ID generation
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
    description: "Movie and Restaurant Review Platform",
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

// ERROR HANDLER
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message,
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
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

module.exports = app;
