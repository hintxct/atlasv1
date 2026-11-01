import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ACCENTS = {
  gold: 'text-gold-300 border-gold-500/30 bg-gold-500/10',
  emerald: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  amber: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  red: 'text-red-300 border-red-500/30 bg-red-500/10',
  sky: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  violet: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
};

const StatCard = ({ icon: Icon, label, value, sub, accent = 'gold', trend }) => (
  <div className="stat-card glass glass-hover rounded-3xl p-6 relative overflow-hidden group">
    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gold-500/5 blur-2xl group-hover:bg-gold-500/10 transition-all duration-500" />
    <div className="flex items-start justify-between gap-3 relative">
      <div className="min-w-0">
        <p className="text-sm text-ivory-400">{label}</p>
        <p className="stat-value text-ivory-100 mt-3 break-words">{value}</p>
        {sub && <p className="text-xs text-ivory-500 mt-1">{sub}</p>}
        {trend !== undefined && (
          <p
            className={`flex items-center gap-1 text-xs mt-2 font-mono ${
              trend >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}% this week
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
