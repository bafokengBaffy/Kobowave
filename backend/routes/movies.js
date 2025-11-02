// routes/movies.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// OMDb API Configuration
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "http://www.omdbapi.com/";

// Validate API key on startup
if (!OMDB_API_KEY) {
  console.error("ERROR: OMDB_API_KEY is not defined in environment variables");
}

// Get popular movies
router.get("/popular", async (req, res) => {
  try {
    if (!OMDB_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OMDb API key not configured",
      });
    }

    const popularSearchTerms = [
      "avengers",
      "batman",
      "superman",
      "spiderman",
      "iron man",
    ];
    const randomTerm =
      popularSearchTerms[Math.floor(Math.random() * popularSearchTerms.length)];

    const response = await axios.get(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${randomTerm}&type=movie`
    );

    if (response.data.Response === "True") {
      // FIXED: Match frontend expected structure
      res.json({
        success: true,
        data: {
          results: response.data.Search || [],
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: response.data.Error || "No movies found",
      });
    }
  } catch (error) {
    console.error("Error fetching popular movies:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch popular movies from OMDb API",
    });
  }
});

// Search movies by title
router.get("/search", async (req, res) => {
  try {
    if (!OMDB_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OMDb API key not configured",
      });
    }

    const { query, page = 1 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const response = await axios.get(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
        query
      )}&type=movie&page=${page}`
    );

    if (response.data.Response === "True") {
      // FIXED: Match frontend expected structure
      res.json({
        success: true,
        data: {
          results: response.data.Search || [],
          totalResults: response.data.totalResults,
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          results: [],
          totalResults: 0,
        },
      });
    }
  } catch (error) {
    console.error("Error searching movies:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to search movies from OMDb API",
    });
  }
});

// Get movie details by ID
router.get("/:id", async (req, res) => {
  try {
    if (!OMDB_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OMDb API key not configured",
      });
    }

    const { id } = req.params;

    const response = await axios.get(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${id}&plot=full`
    );

    if (response.data.Response === "True") {
      res.json({
        success: true,
        data: response.data,
      });
    } else {
      res.status(404).json({
        success: false,
        error: response.data.Error || "Movie not found",
      });
    }
  } catch (error) {
    console.error("Error fetching movie details:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch movie details from OMDb API",
    });
  }
});

module.exports = router;
