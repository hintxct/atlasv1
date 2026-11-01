import React from 'react';

const TONE_BY_STATUS = {
  active: 'red',
  critical: 'red',
  emergency: 'red',
  rejected: 'red',
  delayed: 'amber',
  high: 'amber',
  pending: 'amber',
  medium: 'amber',
  watch: 'amber',
  clearing: 'sky',
  assigned: 'sky',
  in_progress: 'violet',
  low: 'emerald',
  delivered: 'emerald',
  cleared: 'emerald',
  approved: 'emerald',
  stable: 'emerald',
  verified: 'emerald',
  completed: 'emerald',
};

const Badge = ({ status, tone, children, pulse = true }) => {
  const t = tone || TONE_BY_STATUS[status] || 'muted';
  return (
    <span className={`badge badge-${t}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
      {children || (status ? status.replace(/_/g, ' ') : '')}
    </span>
  );
};

export default Badge;
