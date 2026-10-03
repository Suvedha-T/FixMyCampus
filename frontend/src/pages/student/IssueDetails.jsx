import React, { useState, useEffect } from 'react';
import { fetchIssueById } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

/**
 * IssueDetails Component (Student View)
 * Displays the complete report breakdown, optional photo, and chronological updates.
 */
function IssueDetails({ issueId, onNavigate }) {
  const [issue, setIssue] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (issueId) {
      loadIssueDetails();
    }
  }, [issueId]);

  async function loadIssueDetails() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchIssueById(issueId);
      setIssue(data.issue);
      setUpdates(data.updates || []);
    } catch (err) {
      setError(err.message || 'Failed to load issue details.');
    } finally {
      setLoading(false);
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
        <button className="btn btn-secondary" onClick={() => onNavigate('my-reports')}>
          ← Back to My Reports
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onNavigate('my-reports')}
        >
          ← Back to My Reports
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>{issue.title}</h2>
            <p className="subtitle" style={{ marginBottom: '12px' }}>
              Reported on {new Date(issue.created_at).toLocaleDateString()} at{' '}
              {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <StatusBadge status={issue.status} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
            <p style={{ fontWeight: 500 }}>{issue.category}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
            <p style={{ fontWeight: 500 }}>{issue.location}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Department</span>
            <p style={{ fontWeight: 500 }}>
              {issue.department ? issue.department : <span style={{ color: '#94a3b8' }}>Awaiting Assignment</span>}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
            <p style={{ fontWeight: 600, color: '#1e3a8a' }}>{issue.status}</p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <h3>Description</h3>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
            {issue.description}
          </div>
        </div>

        {/* Attached Photo */}
        {issue.image && (
          <div style={{ marginBottom: '24px' }}>
            <h3>Attached Photo</h3>
            <img
              src={issue.image}
              alt="Reported problem"
              className="preview-image"
            />
          </div>
        )}

        {/* Resolution Timeline & History */}
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
                        Updated by: {up.admin_name} (Staff)
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

export default IssueDetails;
