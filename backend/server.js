// ============================================================
// server.js - Main entry point for the FixMyCampus backend API
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { seedDatabase } = require('./seed');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can make requests to this backend
app.use(cors());

// Enable JSON body parsing so we can read req.body in POST and PUT requests
// 10mb limit supports optional base64 image strings cleanly
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FixMyCampus API is running successfully!'
  });
});

// Database connectivity check endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      message: 'Connected to PostgreSQL database successfully!',
      dbType: db.getDbType(),
      serverTime: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query database',
      error: error.message
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', issueRoutes); // Mounts /api/issues, /api/my-issues, /api/stats/*
app.use('/api', userRoutes);  // Mounts /api/users

// Initialize database connection and auto-seed tables on server start
async function startServer() {
  try {
    await db.initDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`FixMyCampus backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
