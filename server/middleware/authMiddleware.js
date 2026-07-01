// authMiddleware.js
// This runs BEFORE the complaint controller
// It checks if the request has a valid token
// If no token → block the request with 401 error
// If valid token → attach user info to req.user and continue

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // Token comes in the Authorization header like:
  // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized. Please login first." });
  }

  // Extract just the token part (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verify token using our secret key from .env
    // If token is fake or expired → this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user data to request object
    // Now complaint controller can access req.user.id, req.user.name etc.
    req.user = decoded;
    next(); // Move on to the next middleware/controller

  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired. Please login again." });
  }
};

// Admin-only middleware — only allows admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = { protect, adminOnly };