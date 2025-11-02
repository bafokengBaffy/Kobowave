let reviews = [
  {
    id: 1,
    type: "movie",
    itemId: 550,
    itemTitle: "Fight Club",
    content:
      "Amazing movie with incredible plot twists! The character development was outstanding.",
    rating: 5,
    author: "MovieLover123",
    authorId: "user1",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    type: "restaurant",
    itemId: 1,
    itemTitle: "Maseru Steakhouse",
    content:
      "Best steak in Maseru! The service was excellent and atmosphere was perfect.",
    rating: 5,
    author: "FoodExplorer",
    authorId: "user3",
    createdAt: "2024-01-13T19:20:00Z",
    updatedAt: "2024-01-13T19:20:00Z",
  },
];

const getReviews = (req, res) => {
  const { type, itemId } = req.query;
  let filteredReviews = reviews;

  if (type) {
    filteredReviews = filteredReviews.filter((review) => review.type === type);
  }

  if (itemId) {
    filteredReviews = filteredReviews.filter(
      (review) => review.itemId === parseInt(itemId)
    );
  }

  res.json({
    success: true,
    data: filteredReviews,
    count: filteredReviews.length,
  });
};

const createReview = (req, res) => {
  const { type, itemId, itemTitle, content, rating, author, authorId } =
    req.body;

  if (!type || !itemId || !itemTitle || !content || !rating || !author) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  const newReview = {
    id: reviews.length + 1,
    type,
    itemId: parseInt(itemId),
    itemTitle,
    content,
    rating: parseInt(rating),
    author,
    authorId: authorId || "anonymous",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reviews.push(newReview);

  res.status(201).json({
    success: true,
    data: newReview,
  });
};

const updateReview = (req, res) => {
  const { id } = req.params;
  const { content, rating } = req.body;

  const reviewIndex = reviews.findIndex((r) => r.id === parseInt(id));

  if (reviewIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Review not found",
    });
  }

  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    content: content || reviews[reviewIndex].content,
    rating: rating ? parseInt(rating) : reviews[reviewIndex].rating,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: reviews[reviewIndex],
  });
};

const deleteReview = (req, res) => {
  const { id } = req.params;
  const reviewIndex = reviews.findIndex((r) => r.id === parseInt(id));

  if (reviewIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Review not found",
    });
  }

  const deletedReview = reviews.splice(reviewIndex, 1)[0];

  res.json({
    success: true,
    data: deletedReview,
    message: "Review deleted successfully",
  });
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
