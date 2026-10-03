import React from 'react';

/**
 * StatusBadge - A simple reusable badge that displays the issue status
 * with distinct, beginner-friendly color styling.
 */
function StatusBadge({ status }) {
  const normalized = (status || 'Reported').toLowerCase().replace(/\s+/g, '-');
  const className = `badge badge-${normalized}`;

  return <span className={className}>{status || 'Reported'}</span>;
}

export default StatusBadge;
