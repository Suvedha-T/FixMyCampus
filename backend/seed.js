// ============================================================
// seed.js - Database Initialization and Starter Data Seeder
//
// Beginner note:
// Seeding gives us ready-to-test accounts and sample issues
// so we don't start with a blank database every time.
// ============================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  console.log('--- Initializing Database Tables & Seed Data ---');

  // Step 1: Read and run schema.sql to create tables
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split and run each CREATE TABLE statement
  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.query(statement);
  }
  console.log('✓ Database tables verified/created successfully');

  // Step 2: Ensure Default Admin User exists
  const adminEmail = 'admin@campus.edu';
  const existingAdmin = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

  let adminId;
  if (existingAdmin.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Campus Admin', adminEmail, hashedPassword, 'admin']
    );
    adminId = result.rows[0].id;
    console.log('✓ Created default admin user: admin@campus.edu (password: admin123)');
  } else {
    adminId = existingAdmin.rows[0].id;
    console.log('✓ Admin user already exists');
  }

  // Step 3: Ensure Default Student User exists
  const studentEmail = 'student@campus.edu';
  const existingStudent = await db.query('SELECT * FROM users WHERE email = $1', [studentEmail]);

  let studentId;
  if (existingStudent.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('student123', 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['Alex Student', studentEmail, hashedPassword, 'student']
    );
    studentId = result.rows[0].id;
    console.log('✓ Created default student user: student@campus.edu (password: student123)');
  } else {
    studentId = existingStudent.rows[0].id;
    console.log('✓ Student user already exists');
  }

  // Step 4: Ensure Sample Campus Issues exist
  const existingIssues = await db.query('SELECT COUNT(*) as count FROM issues');
  const issueCount = parseInt(existingIssues.rows[0].count, 10);

  if (issueCount === 0) {
    // 1. In Progress Issue
    const issue1 = await db.query(
      `INSERT INTO issues (user_id, title, description, category, location, status, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        studentId,
        'Projector not displaying HDMI signal',
        'The ceiling-mounted projector in Room 204 does not detect any connected laptop via HDMI.',
        'IT & Network',
        'Block B, Room 204',
        'In Progress',
        'IT Support'
      ]
    );

    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issue1.rows[0].id, adminId, 'Reported', 'Issue submitted by student.']
    );
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issue1.rows[0].id, adminId, 'Verified', 'Admin confirmed projector HDMI port is malfunctioning.']
    );
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issue1.rows[0].id, adminId, 'In Progress', 'IT technician assigned to replace the cable and test display.']
    );

    // 2. Reported Issue
    const issue2 = await db.query(
      `INSERT INTO issues (user_id, title, description, category, location, status, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        studentId,
        'Water leakage near 1st floor water cooler',
        'Puddle forming on the hallway floor creating slipping hazard.',
        'Plumbing',
        'Science Building, 1st Floor Hallway',
        'Reported',
        null
      ]
    );
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issue2.rows[0].id, null, 'Reported', 'Issue reported by student. Pending administrator verification.']
    );

    // 3. Resolved Issue
    const issue3 = await db.query(
      `INSERT INTO issues (user_id, title, description, category, location, status, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        studentId,
        'Broken study chair with wobbly leg',
        'Wooden leg was loose and dangerous to sit on.',
        'Furniture',
        'Main Library, 2nd Floor Quiet Zone',
        'Resolved',
        'Maintenance'
      ]
    );
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issue3.rows[0].id, adminId, 'Reported', 'Issue submitted by student.']
    );
    await db.query(
      `INSERT INTO issue_updates (issue_id, admin_id, status, comment)
       VALUES ($1, $2, $3, $4)`,
      [issue3.rows[0].id, adminId, 'Resolved', 'Maintenance team replaced the damaged chair with a new one.']
    );

    console.log('✓ Inserted 3 sample campus issues with status history');
  } else {
    console.log(`✓ Issues table already contains ${issueCount} issues`);
  }

  console.log('--- Database Initialization Complete ---');
}

// If run directly via: node seed.js
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
