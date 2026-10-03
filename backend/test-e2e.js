// ============================================================
// test-e2e.js - End-to-End Test Suite for FixMyCampus
//
// Beginner note:
// This script simulates a real student and admin interacting with
// the REST API from start to finish, testing every feature and
// security rule.
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RUNNING COMPLETE FIXMYCAMPUS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // Test 1: API Health Check
    // ----------------------------------------------------
    console.log('[1/14] Testing API Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health check returns status ok (200)');

    // ----------------------------------------------------
    // Test 2: Database Connectivity
    // ----------------------------------------------------
    console.log('\n[2/14] Testing Database Connection...');
    const dbRes = await fetch(`${BASE_URL}/db-test`);
    const dbData = await dbRes.json();
    assert(dbRes.status === 200 && dbData.success === true, 'Database is connected and query succeeds');

    // ----------------------------------------------------
    // Test 3: Student Registration
    // ----------------------------------------------------
    console.log('\n[3/14] Testing Student Registration...');
    const randomEmail = `test_student_${Date.now()}@campus.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Test',
        email: randomEmail,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token && regData.user.role === 'student', 'Student successfully registered with role student');
    const newStudentToken = regData.token;
    const newStudentId = regData.user.id;

    // ----------------------------------------------------
    // Test 4: Default Student Login
    // ----------------------------------------------------
    console.log('\n[4/14] Testing Default Student Login...');
    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@campus.edu',
        password: 'student123'
      })
    });
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && studentLoginData.user.role === 'student', 'Default student login succeeds');
    const studentToken = studentLoginData.token;

    // ----------------------------------------------------
    // Test 5: Default Admin Login
    // ----------------------------------------------------
    console.log('\n[5/14] Testing Default Admin Login...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@campus.edu',
        password: 'admin123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.user.role === 'admin', 'Default admin login succeeds');
    const adminToken = adminLoginData.token;

    // ----------------------------------------------------
    // Test 6: Student Reports an Issue
    // ----------------------------------------------------
    console.log('\n[6/14] Testing Student Reporting an Issue...');
    const createRes = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Broken window latch in Lab 3',
        description: 'Window cannot be locked properly, posing a security hazard overnight.',
        category: 'Laboratory',
        location: 'Engineering Block, 3rd Floor, Lab 3'
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.issue.id && createData.issue.status === 'Reported', 'Issue created with status Reported');
    const testIssueId = createData.issue.id;

    // ----------------------------------------------------
    // Test 7: Student Views "My Reports"
    // ----------------------------------------------------
    console.log('\n[7/14] Testing Student Fetching My Reports...');
    const myIssuesRes = await fetch(`${BASE_URL}/my-issues`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const myIssuesData = await myIssuesRes.json();
    assert(
      myIssuesRes.status === 200 &&
      Array.isArray(myIssuesData.issues) &&
      myIssuesData.issues.some((i) => i.id === testIssueId),
      'Student can view their own reported issue in My Reports'
    );

    // ----------------------------------------------------
    // Test 8: Student Dashboard Stats
    // ----------------------------------------------------
    console.log('\n[8/14] Testing Student Dashboard Stats...');
    const sStatsRes = await fetch(`${BASE_URL}/stats/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const sStatsData = await sStatsRes.json();
    assert(
      sStatsRes.status === 200 &&
      sStatsData.stats.total >= 1 &&
      sStatsData.stats.pending >= 1,
      'Student dashboard stats returned total and pending counts'
    );

    // ----------------------------------------------------
    // Test 9: Security Check - Student Cannot Access Admin Endpoints
    // ----------------------------------------------------
    console.log('\n[9/14] Testing Security: Student Blocked from Admin Routes...');
    const blockedRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(blockedRes.status === 403, 'Student attempting to access /api/users receives 403 Forbidden');

    // ----------------------------------------------------
    // Test 10: Admin Views All Issues & Stats
    // ----------------------------------------------------
    console.log('\n[10/14] Testing Admin Viewing All Issues & Stats...');
    const allRes = await fetch(`${BASE_URL}/issues`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const allData = await allRes.json();
    assert(allRes.status === 200 && allData.count >= 1, 'Admin can view all reported issues across campus');

    const aStatsRes = await fetch(`${BASE_URL}/stats/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const aStatsData = await aStatsRes.json();
    assert(aStatsRes.status === 200 && aStatsData.stats.total >= 1, 'Admin dashboard stats returned total campus counts');

    // ----------------------------------------------------
    // Test 11: Admin Assigns Department
    // ----------------------------------------------------
    console.log('\n[11/14] Testing Admin Assigning Department...');
    const assignRes = await fetch(`${BASE_URL}/issues/${testIssueId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        department: 'Maintenance',
        comment: 'Assigned to carpentry repair team.'
      })
    });
    const assignData = await assignRes.json();
    assert(
      assignRes.status === 200 &&
      assignData.issue.department === 'Maintenance' &&
      assignData.issue.status === 'Assigned',
      'Admin assigned department and status updated to Assigned'
    );

    // ----------------------------------------------------
    // Test 12: Admin Updates Status to "In Progress" & "Resolved"
    // ----------------------------------------------------
    console.log('\n[12/14] Testing Admin Changing Status to In Progress & Resolved...');
    const progressRes = await fetch(`${BASE_URL}/issues/${testIssueId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'In Progress',
        comment: 'Technician currently on site repairing window frame.'
      })
    });
    const progressData = await progressRes.json();
    assert(progressRes.status === 200 && progressData.issue.status === 'In Progress', 'Status updated to In Progress');

    const resolveRes = await fetch(`${BASE_URL}/issues/${testIssueId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Resolved',
        comment: 'Latch replaced and verified secure.'
      })
    });
    const resolveData = await resolveRes.json();
    assert(resolveRes.status === 200 && resolveData.issue.status === 'Resolved', 'Status updated to Resolved');

    // ----------------------------------------------------
    // Test 13: Audit Trail / Timeline Verification
    // ----------------------------------------------------
    console.log('\n[13/14] Testing Issue Timeline & History...');
    const detailRes = await fetch(`${BASE_URL}/issues/${testIssueId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const detailData = await detailRes.json();
    assert(
      detailRes.status === 200 &&
      detailData.updates.length >= 4 &&
      detailData.updates[detailData.updates.length - 1].status === 'Resolved',
      'Timeline contains all chronological status updates with comments and staff attribution'
    );

    // ----------------------------------------------------
    // Test 14: Admin Views Users & Profile Update
    // ----------------------------------------------------
    console.log('\n[14/14] Testing User Management & Profile Update...');
    const usersRes = await fetch(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();
    assert(usersRes.status === 200 && usersData.users.length >= 2, 'Admin can view all registered users');

    const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ name: 'Alex Student Updated' })
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && profileData.user.name === 'Alex Student Updated', 'User profile update succeeded');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
