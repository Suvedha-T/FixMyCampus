import React, { useState, useEffect } from 'react';
import { fetchAllIssues } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

/**
 * AllIssues Page (Admin View)
 * Displays all campus issues with instant filtering by status, category, and text search.
 */
function AllIssues({ onNavigate, onSelectIssue }) {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIssues();
  }, []);

  async function loadIssues() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAllIssues();
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message || 'Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }

  // Filter issues based on status, category, and search query
  const filteredIssues = issues.filter((issue) => {
    // Status filter
    if (statusFilter !== 'all' && issue.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'all' && issue.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title?.toLowerCase().includes(q);
      const matchLocation = issue.location?.toLowerCase().includes(q);
      const matchReporter = issue.reporter_name?.toLowerCase().includes(q);
      const matchDept = issue.department?.toLowerCase().includes(q);
      return matchTitle || matchLocation || matchReporter || matchDept;
    }
    return true;
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>All Campus Issues</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Manage, verify, and resolve issues across the entire campus
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={loadIssues}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh List'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {/* Filter Controls */}
        <div className="filter-bar">
          <div>
            <input
              type="text"
              placeholder="Search by title, location, or reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: '260px' }}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Furniture">Furniture</option>
              <option value="Plumbing">Plumbing</option>
              <option value="IT & Network">IT & Network</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
          Showing {filteredIssues.length} of {issues.length} total issues
        </div>

        {loading ? (
          <p>Loading campus issues...</p>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            <p>No campus issues match your search criteria.</p>
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
                  <th>Reporter</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue, idx) => (
                  <tr key={issue.id}>
                    <td>{idx + 1}</td>
                    <td><strong>{issue.title}</strong></td>
                    <td>{issue.category}</td>
                    <td>{issue.location}</td>
                    <td>
                      <div>{issue.reporter_name}</div>
                      <small style={{ color: '#64748b' }}>{issue.reporter_email}</small>
                    </td>
                    <td>{issue.department || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
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

export default AllIssues;
