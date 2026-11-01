import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mountain, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export const DASHBOARD_ROUTES = {
  driver: '/driver/dashboard',
  field_official: '/official/dashboard',
  district_admin: '/admin/dashboard',
  state_admin: '/state/dashboard',
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  const dashboardRoute = DASHBOARD_ROUTES[user?.userType] || '/';

  return (
    <header
      className={`site-header fixed top-0 inset-x-0 z-[1000] transition-all duration-500 ${
        scrolled || open ? 'site-header-scrolled' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-gold-500/50 bg-obsidian-900/60 flex items-center justify-center group-hover:animate-glow transition-all">
              <Mountain className="w-5 h-5 text-gold-400 group-hover:text-gold-300 transition-colors" />
            </div>
            <div>
              <div className="font-display text-xl tracking-[.18em] text-ivory-100 leading-none">ATLAS</div>
              <div className="text-xs text-gold-400 mt-1">North-East Logistics</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
            <NavLink to="/" end className="nav-link">Home</NavLink>
            <NavLink to="/map" className="nav-link">Map</NavLink>
            <NavLink to="/statistics" className="nav-link">Statistics</NavLink>
            <NavLink to="/mobile" className="nav-link">Mobile App</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
            <NavLink to="/contact" className="nav-link">Contact</NavLink>
          </nav>

          {/* Desktop actions */}
          <div className="hidden xl:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate(dashboardRoute)} className="btn-gold">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button onClick={handleLogout} className="btn-ghost !px-3" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-ghost">Sign In</button>
                <button onClick={() => navigate('/register')} className="btn-gold">Get Started</button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="xl:hidden btn-ghost !p-3"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-navigation" className="xl:hidden glass-deep border-t border-gold-500/10 px-6 py-5 space-y-3 max-h-[calc(100dvh-80px)] overflow-y-auto">
          <NavLink to="/" end onClick={() => setOpen(false)} className="block nav-link">Home</NavLink>
          <NavLink to="/map" onClick={() => setOpen(false)} className="block nav-link">Map</NavLink>
          <NavLink to="/statistics" onClick={() => setOpen(false)} className="block nav-link">Statistics</NavLink>
          <NavLink to="/mobile" onClick={() => setOpen(false)} className="block nav-link">Mobile App</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} className="block nav-link">About</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className="block nav-link">Contact</NavLink>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => { setOpen(false); navigate(dashboardRoute); }}
                className="btn-gold w-full"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="btn-ghost w-full"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { setOpen(false); navigate('/login'); }} className="btn-ghost flex-1">
                Sign In
              </button>
              <button onClick={() => { setOpen(false); navigate('/register'); }} className="btn-gold flex-1">
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
