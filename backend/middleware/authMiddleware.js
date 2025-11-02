const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication token required",
    });
  }

  // For demo purposes - in production, validate JWT token
  next();
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    req.user = { id: "demo-user", username: "demo" };
  }

  next();
};

module.exports = { authMiddleware, optionalAuth };
