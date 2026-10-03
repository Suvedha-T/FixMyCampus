import React, { useState, useEffect } from 'react';
import './App.css';

import { getCurrentUser, logoutUser, getProfile } from './services/api';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ReportIssue from './pages/student/ReportIssue';
import MyReports from './pages/student/MyReports';
import IssueDetails from './pages/student/IssueDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllIssues from './pages/admin/AllIssues';
import AdminIssueDetails from './pages/admin/AdminIssueDetails';
import UsersList from './pages/admin/UsersList';

/**
 * App - Root Component
 *
 * Beginner note:
 * Instead of relying on complex routing libraries, we use straightforward
 * React state ('currentPage') to manage view transitions. This makes the
 * code easy to read, debug, and understand.
 */
function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check saved session on load
  useEffect(() => {
    async function verifySession() {
      const user = getCurrentUser();
      const token = localStorage.getItem('token');

      if (token && user) {
        try {
          // Verify token validity with backend
          const res = await getProfile();
          setCurrentUser(res.user);
          // Route to appropriate default dashboard
          if (res.user.role === 'admin') {
            setCurrentPage('admin-dashboard');
          } else {
            setCurrentPage('student-dashboard');
          }
        } catch (err) {
          // If token expired or invalid, clear session
          logoutUser();
          setCurrentUser(null);
          setCurrentPage('login');
        }
      } else {
        setCurrentPage('login');
      }
      setInitialLoading(false);
    }

    verifySession();
  }, []);

  // Handle successful login or registration
  function handleLoginSuccess(user) {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('student-dashboard');
    }
  }

  // Handle logout
  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setSelectedIssueId(null);
    setCurrentPage('login');
  }

  // Handle profile update
  function handleUserUpdated(updatedUser) {
    setCurrentUser(updatedUser);
  }

  // Safe navigation function with role guards
  function navigateTo(page, issueId = null) {
    if (issueId !== null) {
      setSelectedIssueId(issueId);
    }

    // Role-based protection: non-logged-in users cannot access dashboard/reports
    const publicPages = ['login', 'register'];
    if (!currentUser && !publicPages.includes(page)) {
      setCurrentPage('login');
      return;
    }

    // Role-based protection: students cannot access admin pages
    const adminPages = ['admin-dashboard', 'all-issues', 'admin-issue-details', 'users'];
    if (currentUser?.role === 'student' && adminPages.includes(page)) {
      alert('Access denied: Student accounts cannot access administrator pages.');
      setCurrentPage('student-dashboard');
      return;
    }

    // Role-based protection: admins should be in admin areas
    const studentOnlyPages = ['report-issue', 'my-reports'];
    if (currentUser?.role === 'admin' && studentOnlyPages.includes(page)) {
      setCurrentPage('admin-dashboard');
      return;
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: '#64748b' }}>
        <h2>🏫 FixMyCampus</h2>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content View Switcher */}
      <main style={{ flex: 1 }}>
        {/* Public Pages */}
        {currentPage === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'register' && (
          <Register
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
          />
        )}

        {/* Common Authenticated Pages */}
        {currentPage === 'profile' && (
          <Profile
            currentUser={currentUser}
            onUserUpdated={handleUserUpdated}
          />
        )}

        {/* Student Pages */}
        {currentPage === 'student-dashboard' && (
          <StudentDashboard
            onNavigate={navigateTo}
            onSelectIssue={(id) => setSelectedIssueId(id)}
          />
        )}

        {currentPage === 'report-issue' && (
          <ReportIssue
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'my-reports' && (
          <MyReports
            onNavigate={navigateTo}
            onSelectIssue={(id) => setSelectedIssueId(id)}
          />
        )}

        {currentPage === 'issue-details' && (
          <IssueDetails
            issueId={selectedIssueId}
            onNavigate={navigateTo}
          />
        )}

        {/* Admin Pages */}
        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={navigateTo}
            onSelectIssue={(id) => setSelectedIssueId(id)}
          />
        )}

        {currentPage === 'all-issues' && (
          <AllIssues
            onNavigate={navigateTo}
            onSelectIssue={(id) => setSelectedIssueId(id)}
          />
        )}

        {currentPage === 'admin-issue-details' && (
          <AdminIssueDetails
            issueId={selectedIssueId}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'users' && (
          <UsersList
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer>
        <p>
          <strong>FixMyCampus</strong> &copy; {new Date().getFullYear()} – Campus Issue Reporting and Tracking System.
        </p>
        <p style={{ marginTop: '4px', fontSize: '0.8rem', color: '#94a3b8' }}>
          Designed with Node.js, Express, PostgreSQL, and React.
        </p>
      </footer>
    </div>
  );
}

export default App;
