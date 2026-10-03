import React, { useState, useEffect } from 'react';
import { fetchAdminStats } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

/**
 * AdminDashboard Component
 * Displays high-level campus metrics (Total, Reported, In Progress, Resolved)
 * and recent campus issue activity.
 */
function AdminDashboard({ onNavigate, onSelectIssue }) {
  const [stats, setStats] = useState({ total: 0, reported: 0, inProgress: 0, resolved: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminStats();
      setStats(data.stats);
      setRecentIssues(data.recentIssues || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator statistics.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Campus Administrator Dashboard</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Overview of reported campus facility and maintenance issues
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('all-issues')}
          >
            Manage All Issues
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('users')}
          >
            View Users
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Admin Stat Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Issues</h4>
          <div className="stat-number">{loading ? '...' : stats.total}</div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <h4>Reported (New)</h4>
          <div className="stat-number">{loading ? '...' : stats.reported}</div>
        </div>

        <div className="stat-card progress">
          <h4>In Progress</h4>
          <div className="stat-number">{loading ? '...' : stats.inProgress}</div>
        </div>

        <div className="stat-card resolved">
          <h4>Resolved</h4>
          <div className="stat-number">{loading ? '...' : stats.resolved}</div>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3>Recent Campus Issues</h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('all-issues')}
          >
            View All Issues ({stats.total}) →
          </button>
        </div>

        {loading ? (
          <p>Loading recent issues...</p>
        ) : recentIssues.length === 0 ? (
          <p style={{ color: '#64748b' }}>No campus issues reported yet.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Reporter</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td><strong>{issue.title}</strong></td>
                    <td>{issue.reporter_name || 'Student'}</td>
                    <td>{issue.category}</td>
                    <td>{issue.location}</td>
                    <td>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          onSelectIssue(issue.id);
                          onNavigate('admin-issue-details');
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
