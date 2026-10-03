import React, { useState } from 'react';
import { updateProfile } from '../services/api';

/**
 * Profile Page
 * Displays the current user's profile and allows updating their name or password.
 */
function Profile({ currentUser, onUserUpdated }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!name || name.trim() === '') {
      setError('Name cannot be empty.');
      return;
    }

    if (password && password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await updateProfile(name, password || undefined);
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      if (onUserUpdated) {
        onUserUpdated(res.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>My Profile</h2>
        <p className="subtitle">View and update your account details</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div style={{ marginBottom: '20px', padding: '14px', background: '#f8fafc', borderRadius: '6px' }}>
          <p><strong>Account Role:</strong> <span className="user-badge" style={{ textTransform: 'capitalize' }}>{currentUser?.role}</span></p>
          <p><strong>Email Address:</strong> {currentUser?.email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profileName">Full Name</label>
            <input
              id="profileName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password (leave blank to keep current)</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {password && (
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
