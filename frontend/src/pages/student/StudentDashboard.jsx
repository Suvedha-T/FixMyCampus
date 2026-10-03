import React, { useState, useEffect } from 'react';
import { fetchStudentStats } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

/**
 * StudentDashboard Component
 * Displays simple summary statistics (Total, Pending, Resolved) and recent reports.
 */
function StudentDashboard({ onNavigate, onSelectIssue }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
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
      const data = await fetchStudentStats();
      setStats(data.stats);
      setRecentIssues(data.recentIssues || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Student Dashboard</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Overview of your reported campus issues</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('report-issue')}
        >
          + Report New Issue
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Reports</h4>
          <div className="stat-number">{loading ? '...' : stats.total}</div>
        </div>

        <div className="stat-card pending">
          <h4>Pending Reports</h4>
          <div className="stat-number">{loading ? '...' : stats.pending}</div>
        </div>

        <div className="stat-card resolved">
          <h4>Resolved Reports</h4>
          <div className="stat-number">{loading ? '...' : stats.resolved}</div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3>Recent Reports</h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('my-reports')}
          >
            View All Reports →
          </button>
        </div>

        {loading ? (
          <p>Loading recent reports...</p>
        ) : recentIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
            <p>You haven't reported any issues yet.</p>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: '10px' }}
              onClick={() => onNavigate('report-issue')}
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
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
                    <td>{issue.category}</td>
                    <td>{issue.location}</td>
                    <td>
                      <StatusBadge status={issue.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          onSelectIssue(issue.id);
                          onNavigate('issue-details');
                        }}
                      >
                        View Details
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

export default StudentDashboard;
