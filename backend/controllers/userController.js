// ============================================================
// userController.js - User Management Handlers (Admin Only)
// ============================================================

const db = require('../db');

/**
 * Get all registered campus users (Admin only)
 * GET /api/users
 */
async function getAllUsers(req, res) {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving registered users.'
    });
  }
}

module.exports = {
  getAllUsers
};
