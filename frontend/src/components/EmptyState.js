import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="glass rounded-2xl p-12 text-center">
    {Icon && (
      <div className="w-16 h-16 mx-auto rounded-2xl border border-gold-500/25 bg-gold-500/5 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-gold-400" />
      </div>
    )}
    <h3 className="font-display text-xl text-ivory-100">{title}</h3>
    {message && <p className="text-sm text-ivory-500 mt-2 max-w-sm mx-auto leading-relaxed">{message}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
