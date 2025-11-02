const express = require("express");
const router = express.Router();
const {
  getRestaurants,
  searchRestaurants,
  getRestaurantDetails,
} = require("../controllers/restaurantController");

// Get all restaurants
router.get("/", getRestaurants);

// Search restaurants
router.get("/search", searchRestaurants);

// Get restaurant details
router.get("/:id", getRestaurantDetails);

module.exports = router;
