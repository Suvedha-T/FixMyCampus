import React from 'react';

/**
 * Navbar - Simple top navigation bar
 * Displays links depending on whether the user is a Student, Admin, or logged out.
 */
function Navbar({ currentUser, currentPage, onNavigate, onLogout }) {
  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (!currentUser) onNavigate('login');
          else if (currentUser.role === 'admin') onNavigate('admin-dashboard');
          else onNavigate('student-dashboard');
        }}
      >
        🏫 FixMyCampus
      </div>

      <ul className="navbar-links">
        {!currentUser ? (
          // Logged-out Public Links
          <>
            <li>
              <button
                className={currentPage === 'login' ? 'active' : ''}
                onClick={() => onNavigate('login')}
              >
                Login
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'register' ? 'active' : ''}
                onClick={() => onNavigate('register')}
              >
                Register
              </button>
            </li>
          </>
        ) : currentUser.role === 'student' ? (
          // Student Links
          <>
            <li>
              <button
                className={currentPage === 'student-dashboard' ? 'active' : ''}
                onClick={() => onNavigate('student-dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'report-issue' ? 'active' : ''}
                onClick={() => onNavigate('report-issue')}
              >
                Report Issue
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'my-reports' ? 'active' : ''}
                onClick={() => onNavigate('my-reports')}
              >
                My Reports
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'profile' ? 'active' : ''}
                onClick={() => onNavigate('profile')}
              >
                Profile
              </button>
            </li>
            <li>
              <span className="user-badge">Student</span>
            </li>
            <li>
              <button onClick={onLogout} style={{ color: '#fca5a5' }}>
                Logout ({currentUser.name?.split(' ')[0]})
              </button>
            </li>
          </>
        ) : (
          // Admin Links
          <>
            <li>
              <button
                className={currentPage === 'admin-dashboard' ? 'active' : ''}
                onClick={() => onNavigate('admin-dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'all-issues' ? 'active' : ''}
                onClick={() => onNavigate('all-issues')}
              >
                All Issues
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'users' ? 'active' : ''}
                onClick={() => onNavigate('users')}
              >
                Users
              </button>
            </li>
            <li>
              <button
                className={currentPage === 'profile' ? 'active' : ''}
                onClick={() => onNavigate('profile')}
              >
                Profile
              </button>
            </li>
            <li>
              <span className="user-badge" style={{ backgroundColor: '#dc2626' }}>Admin</span>
            </li>
            <li>
              <button onClick={onLogout} style={{ color: '#fca5a5' }}>
                Logout ({currentUser.name?.split(' ')[0]})
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
