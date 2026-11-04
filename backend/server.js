
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const client = require('prom-client');

const db = require('./db');
const { seedDatabase } = require('./seed');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// PROMETHEUS CONFIGURATION
// ========================================

// Create a registry
const register = new client.Registry();

// Collect default Node.js metrics
client.collectDefaultMetrics({
  register,
  prefix: 'fixmycampus_'
});

// Total HTTP requests counter
const httpRequestsTotal = new client.Counter({
  name: 'fixmycampus_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// HTTP response time histogram
const httpRequestDuration = new client.Histogram({
  name: 'fixmycampus_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});

// Middleware to measure HTTP requests
app.use((req, res, next) => {

  // Do not count Prometheus scraping requests
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationSeconds =
      duration[0] + duration[1] / 1e9;

    // Use route templates instead of individual IDs
    const route = req.route?.path
      ? req.baseUrl + req.route.path
      : req.path.startsWith('/api/')
        ? 'unmatched_api_route'
        : req.path;

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSeconds);
  });

  next();
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// ========================================
// EXISTING APPLICATION CONFIGURATION
// ========================================

app.use(cors());

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FixMyCampus API is running successfully!'
  });
});

// Database connectivity check
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT NOW() as current_time'
    );

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
      message: 'Failed to query PostgreSQL database',
      error: error.message
    });
  }
});

// Existing application routes
app.use('/api/auth', authRoutes);
app.use('/api', issueRoutes);
app.use('/api', userRoutes);

// ========================================
// START SERVER
// ========================================

async function startServer() {
  try {
    await db.initDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(
        `FixMyCampus backend running on port ${PORT}`
      );
      console.log(
        `Prometheus metrics available at /metrics`
      );
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
