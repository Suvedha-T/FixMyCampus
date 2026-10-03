import React, { useState } from 'react';
import { loginUser } from '../services/api';

/**
 * Login Page
 * Allows students and admins to sign in. Includes quick demo buttons for testing.
 */
function Login({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // Helper function to fill demo credentials for quick testing
  function handleQuickLogin(demoEmail, demoPassword) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  }

  return (
    <div className="container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to FixMyCampus</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. student@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Login Helpers */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', textAlign: 'center' }}>
            Quick Demo Accounts (1-Click Fill):
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm btn-block"
              onClick={() => handleQuickLogin('student@campus.edu', 'student123')}
            >
              Fill Student
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm btn-block"
              onClick={() => handleQuickLogin('admin@campus.edu', 'admin123')}
            >
              Fill Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('register');
            }}
          >
            Register as a Student
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
