// ============================================================
// db.js - PostgreSQL Database Connection Module
//
// Beginner note:
// In Node.js, we don't open and close a database connection for
// every single request. Instead, we use a "Pool" or client instance
// that manages connections efficiently.
// ============================================================

require('dotenv').config();
const { Pool } = require('pg');
const path = require('path');

let queryFn = null;
let dbType = 'unknown';

/**
 * Initializes the database connection.
 * 1. If DATABASE_URL is configured in .env, connects via standard pg.Pool.
 * 2. If no DATABASE_URL is provided, uses an embedded PostgreSQL engine (PGlite)
 *    so the project runs instantly on any machine without installing PostgreSQL.
 */
async function initDB() {
  if (queryFn) return queryFn;

  const dbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();

  if (dbUrl) {
    // Connect to external or local PostgreSQL server
    try {
      const pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false
      });

      // Test the connection
      await pool.query('SELECT 1');
      console.log(' Connected to external PostgreSQL via Pool');
      dbType = 'PostgreSQL (pg.Pool)';

      queryFn = async (text, params = []) => {
        return pool.query(text, params);
      };
      return queryFn;
    } catch (err) {
      console.warn(' Failed to connect to external PostgreSQL:', err.message);
      console.log(' Falling back to embedded PostgreSQL (PGlite)...');
    }
  }

  // Embedded PostgreSQL fallback: authentic Postgres running in local ./data folder
  try {
    const { PGlite } = require('@electric-sql/pglite');
    const dataDir = path.join(__dirname, 'data');
    const pglite = new PGlite(dataDir);
    await pglite.waitReady;

    console.log(' Connected to embedded PostgreSQL (PGlite storage at ./backend/data)');
    dbType = 'PostgreSQL (Embedded PGlite)';

    queryFn = async (text, params = []) => {
      // PGlite returns { rows, ... } identical to pg
      const res = await pglite.query(text, params);
      return res;
    };
    return queryFn;
  } catch (embeddedErr) {
    console.error(' Error initializing database:', embeddedErr);
    throw embeddedErr;
  }
}

/**
 * Executes a SQL query with parameters.
 * Usage: const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
 */
async function query(text, params = []) {
  if (!queryFn) {
    await initDB();
  }
  return queryFn(text, params);
}

module.exports = {
  initDB,
  query,
  getDbType: () => dbType
};
