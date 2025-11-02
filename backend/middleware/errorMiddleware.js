const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `Route ${req.originalUrl} does not exist`,
  });
};

module.exports = { errorHandler, notFound };
