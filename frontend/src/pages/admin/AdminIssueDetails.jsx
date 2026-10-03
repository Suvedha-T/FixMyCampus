import React, { useState, useEffect } from 'react';
import { fetchIssueById, updateIssueStatus, assignIssueDepartment } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

/**
 * AdminIssueDetails Component
 * Allows administrators to review an issue, change its status,
 * assign a department, and write status update comments.
 */
function AdminIssueDetails({ issueId, onNavigate }) {
  const [issue, setIssue] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Status form state
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Department form state
  const [newDepartment, setNewDepartment] = useState('');
  const [deptComment, setDeptComment] = useState('');
  const [submittingDept, setSubmittingDept] = useState(false);

  const statuses = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
  const departments = [
    'Maintenance',
    'IT Support',
    'Housekeeping',
    'Electrical',
    'Academic Affairs',
    'Security',
    'Civil / Infrastructure',
    'Other'
  ];

  useEffect(() => {
    if (issueId) {
      loadIssue();
    }
  }, [issueId]);

  async function loadIssue() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchIssueById(issueId);
      setIssue(data.issue);
      setUpdates(data.updates || []);
      setNewStatus(data.issue.status);
      setNewDepartment(data.issue.department || '');
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }

  // Handle status update submission
  async function handleStatusSubmit(e) {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!newStatus) {
      setActionError('Please select a valid status.');
      return;
    }

    try {
      setSubmittingStatus(true);
      const res = await updateIssueStatus(issueId, newStatus, statusComment);
      setActionSuccess(`Status updated to "${newStatus}"!`);
      setStatusComment('');
      // Reload issue data to update timeline
      await loadIssue();
    } catch (err) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setSubmittingStatus(false);
    }
  }

  // Handle department assignment submission
  async function handleDepartmentSubmit(e) {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!newDepartment) {
      setActionError('Please select a department.');
      return;
    }

    try {
      setSubmittingDept(true);
      const res = await assignIssueDepartment(issueId, newDepartment, deptComment);
      setActionSuccess(`Assigned to "${newDepartment}"!`);
      setDeptComment('');
      // Reload issue data to update timeline
      await loadIssue();
    } catch (err) {
      setActionError(err.message || 'Failed to assign department.');
    } finally {
      setSubmittingDept(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error || 'Issue not found.'}</div>
        <button className="btn btn-secondary" onClick={() => onNavigate('all-issues')}>
          ← Back to All Issues
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onNavigate('all-issues')}
        >
          ← Back to All Issues
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onNavigate('admin-dashboard')}
        >
          Dashboard
        </button>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>{issue.title}</h2>
            <p className="subtitle" style={{ marginBottom: '8px' }}>
              Reported on {new Date(issue.created_at).toLocaleDateString()} at{' '}
              {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <StatusBadge status={issue.status} />
          </div>
        </div>

        {/* Reporter & Location Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Reporter</span>
            <p style={{ fontWeight: 600 }}>{issue.reporter_name}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{issue.reporter_email}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
            <p style={{ fontWeight: 500 }}>{issue.category}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
            <p style={{ fontWeight: 500 }}>{issue.location}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Department</span>
            <p style={{ fontWeight: 500 }}>
              {issue.department ? (
                <span style={{ color: '#1e3a8a', fontWeight: 600 }}>{issue.department}</span>
              ) : (
                <span style={{ color: '#94a3b8' }}>Unassigned</span>
              )}
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Description</h3>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
            {issue.description}
          </div>
        </div>

        {/* Attached Photo */}
        {issue.image && (
          <div style={{ marginBottom: '24px' }}>
            <h3>Attached Photo</h3>
            <img src={issue.image} alt="Problem attachment" className="preview-image" />
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

        {/* Admin Action Section */}
        <h3 style={{ color: '#1e3a8a', marginBottom: '16px' }}>⚙️ Administrative Actions</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          
          {/* Action 1: Change Status */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ marginBottom: '12px', color: '#1e293b' }}>1. Update Status</h4>
            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label htmlFor="selectStatus">New Status</label>
                <select
                  id="selectStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="statusComment">Admin Remark / Comment</label>
                <input
                  id="statusComment"
                  type="text"
                  placeholder="e.g. Technician dispatched to site"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm btn-block"
                disabled={submittingStatus}
              >
                {submittingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Action 2: Assign Department */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ marginBottom: '12px', color: '#1e293b' }}>2. Assign Department</h4>
            <form onSubmit={handleDepartmentSubmit}>
              <div className="form-group">
                <label htmlFor="selectDept">Department</label>
                <select
                  id="selectDept"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="deptComment">Assignment Note</label>
                <input
                  id="deptComment"
                  type="text"
                  placeholder="e.g. Work order ticket #1042 issued"
                  value={deptComment}
                  onChange={(e) => setDeptComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm btn-block"
                disabled={submittingDept}
              >
                {submittingDept ? 'Assigning...' : 'Assign Department'}
              </button>
            </form>
          </div>

        </div>

        {/* Resolution History / Timeline */}
        <div>
          <h3>Resolution History & Updates</h3>
          {updates.length === 0 ? (
            <p style={{ color: '#64748b' }}>No updates logged yet.</p>
          ) : (
            <ul className="timeline">
              {updates.map((up) => (
                <li key={up.id} className="timeline-item">
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>
                        <StatusBadge status={up.status} />
                      </strong>
                      <span className="timeline-time">
                        {new Date(up.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ marginTop: '6px', color: '#334155' }}>
                      {up.comment || 'Status updated.'}
                    </p>
                    {up.admin_name && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        By Staff: {up.admin_name}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminIssueDetails;
