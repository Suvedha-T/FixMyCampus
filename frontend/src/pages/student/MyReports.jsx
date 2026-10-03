import React, { useState, useEffect } from 'react';
import { fetchMyIssues } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

/**
 * MyReports Page
 * Displays all issues reported by the logged-in student, with filtering by status.
 */
function MyReports({ onNavigate, onSelectIssue }) {
  const [issues, setIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyIssues();
  }, []);

  async function loadMyIssues() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchMyIssues();
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message || 'Failed to load your reports.');
    } finally {
      setLoading(false);
    }
  }

  // Filter issues in memory for fast, smooth response
  const filteredIssues = issues.filter((issue) => {
    if (filterStatus === 'all') return true;
    return issue.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>My Reported Issues</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Track the progress of all campus problems you have submitted
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('report-issue')}
        >
          + Report Issue
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {/* Simple Filter Bar */}
        <div className="filter-bar">
          <label style={{ alignSelf: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
            Filter by Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses ({issues.length})</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {loading ? (
          <p>Loading your reports...</p>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            <p>No issues match the selected filter.</p>
            {issues.length === 0 && (
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '12px' }}
                onClick={() => onNavigate('report-issue')}
              >
                Submit Your First Report
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Department</th>
                  <th>Date Reported</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue, idx) => (
                  <tr key={issue.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{issue.title}</strong>
                    </td>
                    <td>{issue.category}</td>
                    <td>{issue.location}</td>
                    <td>{issue.department || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
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

export default MyReports;
