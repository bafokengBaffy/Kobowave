// backend/routes/reviews.js
const express = require("express");
const router = express.Router();
const { reviewService } = require("../services/firebaseService");

// GET /api/reviews - Get all reviews with optional filtering
router.get("/", async (req, res) => {
  try {
    const { type, itemId, authorId } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (itemId) filters.itemId = itemId;
    if (authorId) filters.authorId = authorId;

    const reviews = await reviewService.getAllReviews(filters);

    res.json({
      success: true,
      data: reviews,
      total: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews",
    });
  }
});

// GET /api/reviews/movie/:movieId - Get reviews for a specific movie
router.get("/movie/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    const reviews = await reviewService.getReviewsByMovie(movieId);

    res.json({
      success: true,
      data: reviews,
      total: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch movie reviews",
    });
  }
});

// GET /api/reviews/restaurant/:restaurantId - Get reviews for a specific restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await reviewService.getReviewsByRestaurant(restaurantId);

    res.json({
      success: true,
      data: reviews,
      total: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching restaurant reviews:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch restaurant reviews",
    });
  }
});

// GET /api/reviews/:id - Get a specific review
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewService.getReviewById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch review",
    });
  }
});

// POST /api/reviews - Create a new review
router.post("/", async (req, res) => {
  try {
    const { type, itemId, itemTitle, content, rating, author, authorId } =
      req.body;

    // Validation
    if (!type || !itemId || !content || !rating || !author || !authorId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    const reviewData = {
      type,
      itemId,
      itemTitle,
      content,
      rating: parseInt(rating),
      author,
      authorId,
    };

    const newReview = await reviewService.createReview(reviewData);

    res.status(201).json({
      success: true,
      data: newReview,
      message: "Review created successfully",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create review",
    });
  }
});

// PUT /api/reviews/:id - Update a review
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    const existingReview = await reviewService.getReviewById(id);

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (rating !== undefined) updateData.rating = parseInt(rating);

    const updatedReview = await reviewService.updateReview(id, updateData);

    res.json({
      success: true,
      data: updatedReview,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update review",
    });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await reviewService.deleteReview(id);

    res.json({
      success: true,
      data: deletedReview,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete review",
    });
  }
});

module.exports = router;
