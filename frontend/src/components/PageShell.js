import React from 'react';
import Navbar from './Navbar';
import { Mountain } from 'lucide-react';

/**
 * PageShell — wraps a page in the atlas background, veil, navbar and footer.
 */
const PageShell = ({ children, footer = true, veil = 'atlas-veil', className = '' }) => (
  <div className="min-h-screen atlas-bg">
    <div className={`min-h-screen ${veil} flex flex-col`}>
      <Navbar />
      <main className={`flex-1 ${className}`}>{children}</main>
      {footer && (
        <footer className="border-t border-gold-500/10 bg-obsidian-950/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mountain className="w-5 h-5 text-gold-500" />
              <span className="font-display tracking-[.2em] text-ivory-200">ATLAS</span>
            </div>
            <p className="text-sm text-ivory-500 text-center">
              Connecting North-East India
            </p>
            <p className="text-xs text-ivory-600">© {new Date().getFullYear()} ATLAS · North-East Logistics</p>
          </div>
        </footer>
      )}
    </div>
  </div>
);

export default PageShell;
