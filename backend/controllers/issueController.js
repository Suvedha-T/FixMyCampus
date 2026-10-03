// ============================================================
// issueController.js - Issue Management Handlers
//
// Beginner note:
// This controller handles all issue lifecycle steps:
// reporting, viewing personal/all issues, updating status,
// and assigning departments.
// ============================================================

const db = require('../db');

/**
 * Report a new campus issue (Student)
 * POST /api/issues
 */
async function createIssue(req, res) {
  try {
    const { title, description, category, location, image } = req.body;
    const userId = req.user.id;

    // 1. Validation: ensure required fields are present
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and location are required.'
      });
    }

    if (title.trim() === '' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title and description cannot be empty.'
      });
    }

    // 2. Insert issue into the database
    // Default status is 'Reported'
    const result = await db.query(
      `INSERT INTO issues (user_id, title, description, category, location, image, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Reported')
       RETURNING *`,
      [
        userId,
        title.trim(),
        description.trim(),
        category.trim(),
        location.trim(),
        image || null
      ]
    );

    const newIssue = result.rows[0];

    // 3. Insert initial entry into issue_updates table for audit history
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, NULL, 'Reported', 'Issue submitted by student.')`,
      [newIssue.id]
    );

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully!',
      issue: newIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting issue.'
    });
  }
}

/**
 * Get all issues reported by the logged-in student
 * GET /api/my-issues
 */
async function getMyIssues(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM issues 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      issues: result.rows
    });
  } catch (error) {
    console.error('Get my issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your issues.'
    });
  }
}

/**
 * Get all issues (Admin only, with optional filters)
 * GET /api/issues
 */
async function getAllIssues(req, res) {
  try {
    const { status, category } = req.query;

    let queryText = `
      SELECT i.*, u.name as reporter_name, u.email as reporter_email
      FROM issues i
      JOIN users u ON i.user_id = u.id
    `;
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`i.status = $${params.length}`);
    }

    if (category && category !== 'all') {
      params.push(category);
      conditions.push(`i.category = $${params.length}`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' ORDER BY i.created_at DESC';

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      issues: result.rows
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving all issues.'
    });
  }
}

/**
 * Get single issue details by ID (along with chronological updates)
 * GET /api/issues/:id
 */
async function getIssueById(req, res) {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch issue details joined with reporter's name
    const issueResult = await db.query(
      `SELECT i.*, u.name as reporter_name, u.email as reporter_email
       FROM issues i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [issueId]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    const issue = issueResult.rows[0];

    // Business Rule Check:
    // If user is a student, they cannot view another student's issue
    if (userRole === 'student' && issue.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reported issues.'
      });
    }

    // Fetch issue updates / history
    const updatesResult = await db.query(
      `SELECT iu.*, u.name as admin_name
       FROM issue_updates iu
       LEFT JOIN users u ON iu.admin_id = u.id
       WHERE iu.issue_id = $1
       ORDER BY iu.created_at ASC`,
      [issueId]
    );

    res.json({
      success: true,
      issue,
      updates: updatesResult.rows
    });
  } catch (error) {
    console.error('Get issue by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving issue details.'
    });
  }
}

/**
 * Update issue status (Admin only)
 * PUT /api/issues/:id/status
 */
async function updateIssueStatus(req, res) {
  try {
    const issueId = req.params.id;
    const { status, comment } = req.body;
    const adminId = req.user.id;

    const validStatuses = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Update status in issues table
    const result = await db.query(
      `UPDATE issues
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, issueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    // Log the status change into issue_updates table
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issueId, adminId, status, comment || `Status changed to ${status}`]
    );

    res.json({
      success: true,
      message: `Issue status updated to ${status}`,
      issue: result.rows[0]
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating issue status.'
    });
  }
}

/**
 * Assign department to issue (Admin only)
 * PUT /api/issues/:id/assign
 */
async function assignDepartment(req, res) {
  try {
    const issueId = req.params.id;
    const { department, comment } = req.body;
    const adminId = req.user.id;

    if (!department || department.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Department is required.'
      });
    }

    // Update department and automatically set status to 'Assigned' if it was 'Reported' or 'Verified'
    const current = await db.query('SELECT status FROM issues WHERE id = $1', [issueId]);
    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.'
      });
    }

    let newStatus = current.rows[0].status;
    if (newStatus === 'Reported' || newStatus === 'Verified') {
      newStatus = 'Assigned';
    }

    const result = await db.query(
      `UPDATE issues
       SET department = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [department.trim(), newStatus, issueId]
    );

    // Record the assignment in issue_updates table
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [
        issueId,
        adminId,
        newStatus,
        comment || `Assigned to department: ${department.trim()}`
      ]
    );

    res.json({
      success: true,
      message: `Assigned to ${department.trim()}`,
      issue: result.rows[0]
    });
  } catch (error) {
    console.error('Assign department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error assigning department.'
    });
  }
}

/**
 * Get simple statistics for the student dashboard
 * GET /api/stats/student
 */
async function getStudentStats(req, res) {
  try {
    const userId = req.user.id;

    // Total reports by this student
    const totalRes = await db.query(
      'SELECT COUNT(*) as count FROM issues WHERE user_id = $1',
      [userId]
    );

    // Pending reports (anything not Resolved)
    const pendingRes = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE user_id = $1 AND status != 'Resolved'",
      [userId]
    );

    // Resolved reports
    const resolvedRes = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE user_id = $1 AND status = 'Resolved'",
      [userId]
    );

    // Recent 5 reports
    const recentRes = await db.query(
      'SELECT * FROM issues WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    res.json({
      success: true,
      stats: {
        total: parseInt(totalRes.rows[0].count, 10),
        pending: parseInt(pendingRes.rows[0].count, 10),
        resolved: parseInt(resolvedRes.rows[0].count, 10)
      },
      recentIssues: recentRes.rows
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving student statistics.'
    });
  }
}

/**
 * Get simple statistics for the admin dashboard
 * GET /api/stats/admin
 */
async function getAdminStats(req, res) {
  try {
    // Total issues
    const totalRes = await db.query('SELECT COUNT(*) as count FROM issues');

    // Reported issues
    const reportedRes = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE status = 'Reported'"
    );

    // In Progress issues
    const inProgressRes = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE status = 'In Progress'"
    );

    // Resolved issues
    const resolvedRes = await db.query(
      "SELECT COUNT(*) as count FROM issues WHERE status = 'Resolved'"
    );

    // Recent 5 issues with reporter name
    const recentRes = await db.query(`
      SELECT i.*, u.name as reporter_name, u.email as reporter_email
      FROM issues i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        total: parseInt(totalRes.rows[0].count, 10),
        reported: parseInt(reportedRes.rows[0].count, 10),
        inProgress: parseInt(inProgressRes.rows[0].count, 10),
        resolved: parseInt(resolvedRes.rows[0].count, 10)
      },
      recentIssues: recentRes.rows
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics.'
    });
  }
}

module.exports = {
  createIssue,
  getMyIssues,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  assignDepartment,
  getStudentStats,
  getAdminStats
};
