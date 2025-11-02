const validateReview = (req, res, next) => {
  const { content, rating, type, itemId, itemTitle, author } = req.body;

  if (!content || !rating || !type || !itemId || !itemTitle || !author) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  if (type !== "movie" && type !== "restaurant") {
    return res.status(400).json({
      success: false,
      error: 'Type must be either "movie" or "restaurant"',
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: "Rating must be between 1 and 5",
    });
  }

  next();
};

module.exports = { validateReview };
