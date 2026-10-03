// ============================================================
// authMiddleware.js - JWT Authentication & Role Authorization
//
// Beginner note:
// Middleware is a function that runs before your controller.
// It checks if the user has provided a valid token in the
// HTTP Authorization header: "Bearer <token>".
// ============================================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fixmycampus_super_secret_jwt_key_2026';

/**
 * Verifies that the incoming request contains a valid JWT token.
 * Attaches the decoded user payload (id, email, role) to req.user.
 */
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Store user details in the request object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
}

/**
 * Checks if the authenticated user has an 'admin' role.
 * Must be used after authenticateUser.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required.'
    });
  }
  next();
}

module.exports = {
  authenticateUser,
  requireAdmin
};
