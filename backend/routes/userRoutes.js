// ============================================================
// userRoutes.js - User Management Routes (Admin Only)
// ============================================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

// Admin: View all registered users
router.get('/users', authenticateUser, requireAdmin, userController.getAllUsers);

module.exports = router;
