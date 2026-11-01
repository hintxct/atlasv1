import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogOut, Menu, X, Mountain, Map, CircleDot } from 'lucide-react';

/**
 * DashboardLayout — sidebar command shell shared by all four role dashboards.
 */
const DashboardLayout = ({ roleLabel, nav, active, onNavigate, title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-gold-500/10 shrink-0">
        <div className="w-9 h-9 rounded-full border border-gold-500/50 bg-obsidian-900/60 flex items-center justify-center">
          <Mountain className="w-4 h-4 text-gold-400" />
        </div>
        <div>
          <div className="font-display tracking-[.18em] text-ivory-100 leading-none">ATLAS</div>
          <div className="font-mono text-[8px] tracking-[.28em] text-gold-500/80 uppercase mt-1">{roleLabel}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); setOpen(false); }}
            className={`side-item ${active === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-300 border border-gold-500/25">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer: map shortcut + user card */}
      <div className="p-4 border-t border-gold-500/10 space-y-3 shrink-0">
        <button onClick={() => navigate('/map')} className="side-item">
          <Map className="w-4 h-4" />
          Public map
        </button>
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-display text-gold-300 shrink-0">
            {(user?.name || 'A').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ivory-100 truncate">{user?.name || 'Officer'}</p>
            <p className="font-mono text-[9px] tracking-[.15em] uppercase text-emerald-400 flex items-center gap-1">
              <CircleDot className="w-2.5 h-2.5" /> On duty
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost !p-3"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen atlas-bg">
      <div className="min-h-screen atlas-veil">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 glass-deep border-r border-gold-500/10 z-40">
          {sidebar}
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-50 glass-deep border-b border-gold-500/10 h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-gold-400" />
            <span className="font-display tracking-[.15em] text-ivory-100">ATLAS</span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="btn-ghost !p-3"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <aside className="w-72 h-full pt-16 glass-deep" onClick={(e) => e.stopPropagation()}>
              {sidebar}
            </aside>
          </div>
        )}

        {/* Content */}
        <div className="lg:pl-72 pt-16 lg:pt-0">
          <header className="dashboard-heading px-5 sm:px-8 lg:px-10 pt-10 pb-8">
            <p className="eyebrow mb-2">{roleLabel}</p>
            <h1 className="section-title text-ivory-100">{title}</h1>
            {subtitle && <p className="section-description text-ivory-400">{subtitle}</p>}
            <div className="gold-rule mt-6" />
          </header>
          <main className="dashboard-content px-5 sm:px-8 lg:px-10 pb-16 max-w-[1600px]">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
