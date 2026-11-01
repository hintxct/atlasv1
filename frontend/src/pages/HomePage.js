import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import PageShell from '../components/PageShell';
import SectionHeading from '../components/SectionHeading';
import { TICKER_ITEMS } from '../data/mockData';
import {
  GitBranch, Radar, CloudRainWind, Camera, BarChart3,
  Truck, ShieldCheck, Building2, Landmark,
  ArrowRight, Map, AlertTriangle, ChevronRight,
} from 'lucide-react';

const DASHBOARDS = {
  driver: '/driver/dashboard',
  field_official: '/official/dashboard',
  district_admin: '/admin/dashboard',
  state_admin: '/state/dashboard',
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STATS = [
  { value: '312', label: 'Active Convoys' },
  { value: '82%', label: 'Roads Open' },
  { value: '12', label: 'Road Alerts' },
  { value: '1,204', label: 'Deliveries / Week' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(DASHBOARDS[user.userType] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <PageShell className="home-page">
      {/* ================= HERO ================= */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={0} className="eyebrow mb-6">
            Logistics for North-East India
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="home-title text-ivory-100"
          >
            Better routes.
            <span className="block text-gold-gradient mt-2">Connected communities.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="home-description text-ivory-300"
          >
            Plan deliveries, check road conditions, and keep essential supplies
            moving across the eight North-Eastern states.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="home-actions"
          >
            <button onClick={() => navigate('/login')} className="btn-gold">
              Sign in
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/map')} className="btn-ghost">
              <Map className="w-5 h-5" />
              Explore the map
            </button>
          </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="home-stats"
          >
            {STATS.map((s) => (
              <div key={s.label} className="home-stat">
                <div className="home-stat-value text-gold-300">{s.value}</div>
                <div className="text-sm text-ivory-300 mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
          <p className="text-sm text-ivory-500 mt-4">Sample activity shown</p>
        </div>
      </section>

      {/* ================= ALERT TICKER ================= */}
      <div className="border-y border-gold-500/15 bg-obsidian-950/70 backdrop-blur-md py-3 overflow-hidden">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 font-mono text-[11px] tracking-[.15em] uppercase text-ivory-400"
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 ${
                  item.severity === 'critical'
                    ? 'text-red-400'
                    : item.severity === 'high'
                    ? 'text-amber-400'
                    : 'text-gold-400'
                }`}
              />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title={
              <>
                Everything you need to <span className="text-gold-gradient">plan a delivery</span>
              </>
            }
            sub="Routes, road reports, and delivery updates in one place."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                custom={i % 3}
                className="glass glass-hover rounded-3xl p-8 group"
              >
                <div className="w-14 h-14 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center mb-6">
                  <f.icon className="w-5 h-5 text-gold-300" />
                </div>
                <h3 className="font-display text-2xl text-ivory-100 mb-3">{f.title}</h3>
                <p className="text-sm text-ivory-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="py-24 px-6 border-t border-gold-500/10 bg-obsidian-950/40">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Built for your role"
            sub="A dedicated workspace for drivers, field officials, and administrators."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {ROLES.map((r, i) => (
              <motion.button
                key={r.name}
                onClick={() => navigate('/register')}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                custom={i}
                className="glass glass-hover rounded-3xl p-8 text-left group"
              >
                <r.icon className="w-8 h-8 text-gold-400 mb-5 group-hover:text-gold-300 group-hover:scale-110 transition-all" />
                <h3 className="font-display text-2xl text-ivory-100">{r.name}</h3>
                <p className="text-sm text-ivory-500 mt-2 leading-relaxed">{r.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300 mt-6 group-hover:gap-3 transition-all">
                  Join as {r.name}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-28 px-6 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-6xl text-ivory-100">
            Ready to <span className="text-gold-gradient">get started?</span>
          </h2>
          <p className="text-ivory-400 mt-6 leading-relaxed">
            Create an account for your role. Official and administrator accounts
            require approval.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <button onClick={() => navigate('/register')} className="btn-gold !px-8 !py-4 !text-base">
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/map')} className="btn-ghost !px-8 !py-4 !text-base">
              <Map className="w-5 h-5" />
              Explore the map
            </button>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
};

const FEATURES = [
  { icon: GitBranch, title: 'Route planning', desc: 'Compare routes by distance, road condition, and risk.' },
  { icon: Radar, title: 'Convoy tracking', desc: 'View vehicle locations and delivery progress on the map.' },
  { icon: CloudRainWind, title: 'Weather alerts', desc: 'Check weather risks that may affect your journey.' },
  { icon: Camera, title: 'Field Reporting', desc: 'Drivers and officials pin blockages with photo evidence straight from the roadside.' },
  { icon: GitBranch, title: 'Alternative routes', desc: 'Review other routes when a road is blocked or unsafe.' },
  { icon: BarChart3, title: 'Delivery reports', desc: 'See deliveries, road conditions, and district activity at a glance.' },
];

const ROLES = [
  { icon: Truck, name: 'Driver', desc: 'Manage deliveries, check routes, and report road blockages.' },
  { icon: ShieldCheck, name: 'Field Official', desc: 'Verify road reports and update blockage status.' },
  { icon: Building2, name: 'District Admin', desc: 'Assign deliveries, monitor vehicles, and manage approvals.' },
  { icon: Landmark, name: 'State Admin', desc: 'Review regional activity and coordinate urgent supplies.' },
];

export default HomePage;
