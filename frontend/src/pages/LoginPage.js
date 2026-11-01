import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageShell from '../components/PageShell';
import { Mountain, ArrowLeft, Phone, Lock, Truck, ShieldCheck, Building2, Landmark, LogIn } from 'lucide-react';

const DASHBOARDS = {
  driver: '/driver/dashboard',
  field_official: '/official/dashboard',
  district_admin: '/admin/dashboard',
  state_admin: '/state/dashboard',
};

const DEMO_LOGINS = [
  { icon: Truck, label: 'Driver', phone: '9876543210' },
  { icon: ShieldCheck, label: 'Field Official', phone: '9876543211' },
  { icon: Building2, label: 'District Admin', phone: '9876543212' },
  { icon: Landmark, label: 'State Admin', phone: '9876543213' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const doLogin = async (phone, password, demo = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = demo ? loginDemo(phone) : await login(phone, password);
      if (result.success) {
        toast.success(demo ? 'Demo workspace opened — sample data only' : `Welcome back, ${result.user.name?.split(' ')[0] || 'traveller'}`);
        navigate(DASHBOARDS[result.user.userType] || '/');
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doLogin(formData.phone, formData.password);
  };

  return (
    <PageShell footer={false}>
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-ivory-500 hover:text-gold-300 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="glass-deep rounded-3xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full border border-gold-500/40 bg-gold-500/10 flex items-center justify-center mb-5 animate-glow">
                <Mountain className="w-7 h-7 text-gold-300" />
              </div>
              <h2 className="font-display text-3xl text-ivory-100">Welcome back</h2>
              <p className="text-sm text-ivory-500 mt-2">Sign in with your registered phone number</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-dark">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600" />
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    className="input-dark !pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-dark">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-dark !pl-11"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full !py-3.5 !text-base">
                {loading ? (
                  <span className="spinner-gold !w-5 !h-5 !border-2" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-ivory-500 mt-6">
              New here?{' '}
              <Link to="/register" className="text-gold-300 hover:text-gold-200 font-semibold transition-colors">
                Request access
              </Link>
            </p>

            <div className="gold-rule my-7" />

            <p className="font-mono text-[10px] tracking-[.25em] uppercase text-ivory-500 text-center mb-4">
              Try a demo workspace
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.phone}
                  type="button"
                  disabled={loading}
                  onClick={() => doLogin(d.phone, null, true)}
                  className="glass glass-hover rounded-xl px-3 py-3.5 flex items-center gap-3 text-left group"
                >
                  <d.icon className="w-4 h-4 text-gold-400 group-hover:text-gold-300 transition-colors shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-ivory-200">{d.label}</div>
                    <div className="text-xs text-ivory-500">Open demo</div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-ivory-500 text-center mt-4">No account needed. Demo changes do not affect real records.</p>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default LoginPage;
