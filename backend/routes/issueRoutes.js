// ============================================================
// issueRoutes.js - Issue Reporting & Management Endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

// Student: Report a new issue
router.post('/issues', authenticateUser, issueController.createIssue);

// Student: View their own reported issues
router.get('/my-issues', authenticateUser, issueController.getMyIssues);

// Student: Summary statistics for student dashboard
router.get('/stats/student', authenticateUser, issueController.getStudentStats);

// Admin: Summary statistics for admin dashboard
router.get('/stats/admin', authenticateUser, requireAdmin, issueController.getAdminStats);

// Admin: View all reported issues (with optional filters)
router.get('/issues', authenticateUser, requireAdmin, issueController.getAllIssues);

// View single issue details and update history (Student can view own, Admin can view all)
router.get('/issues/:id', authenticateUser, issueController.getIssueById);

// Admin: Update issue status
router.put('/issues/:id/status', authenticateUser, requireAdmin, issueController.updateIssueStatus);

// Admin: Assign department to issue
router.put('/issues/:id/assign', authenticateUser, requireAdmin, issueController.assignDepartment);

module.exports = router;
