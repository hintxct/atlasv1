import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import PageShell from '../components/PageShell';
import { NE_STATES, DISTRICTS_BY_STATE, VEHICLE_TYPES, validatePhone } from '../utils/helpers';
import {
  ArrowLeft, User, Phone, Lock, MapPin, Truck, ShieldCheck, Building2, UserPlus, Check,
} from 'lucide-react';

const DASHBOARDS = {
  driver: '/driver/dashboard',
  field_official: '/official/dashboard',
  district_admin: '/admin/dashboard',
  state_admin: '/state/dashboard',
};

const ROLE_OPTIONS = [
  { id: 'driver', icon: Truck, label: 'Driver', desc: 'Instant approval' },
  { id: 'field_official', icon: ShieldCheck, label: 'Field Official', desc: 'Admin review' },
  { id: 'district_admin', icon: Building2, label: 'District Admin', desc: 'Admin review' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    userType: 'driver',
    state: 'Assam',
    district: DISTRICTS_BY_STATE['Assam'][0],
    vehicleType: VEHICLE_TYPES[0],
  });
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleStateChange = (state) => {
    setForm((f) => ({ ...f, state, district: DISTRICTS_BY_STATE[state][0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!validatePhone(form.phone)) {
      toast.error('Enter a valid 10-digit Indian phone number');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.success) {
      if (result.user.approvalStatus === 'pending') {
        toast.success('Application submitted — awaiting district approval');
      } else {
        toast.success('Your account is ready');
      }
      navigate(DASHBOARDS[result.user.userType] || '/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <PageShell footer={false}>
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-ivory-500 hover:text-gold-300 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="glass-deep rounded-3xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-display text-3xl text-ivory-100">Create your account</h2>
              <p className="text-sm text-ivory-500 mt-2">
                Choose your role to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role picker */}
              <div>
                <label className="label-dark">Select your crew</label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => set('userType', r.id)}
                      className={`rounded-xl border p-4 text-center transition-all duration-300 ${
                        form.userType === r.id
                          ? 'border-gold-400/70 bg-gold-500/15 shadow-[0_0_25px_rgba(201,169,110,0.2)] scale-[1.02]'
                          : 'border-gold-500/15 bg-white/[.02] hover:border-gold-500/40 hover:bg-gold-500/5'
                      }`}
                    >
                      <r.icon
                        className={`w-6 h-6 mx-auto transition-colors ${
                          form.userType === r.id ? 'text-gold-300' : 'text-ivory-500'
                        }`}
                      />
                      <div className={`text-xs font-semibold mt-2 ${form.userType === r.id ? 'text-ivory-100' : 'text-ivory-400'}`}>
                        {r.label}
                      </div>
                      <div className="font-mono text-[8px] tracking-[.15em] uppercase text-ivory-600 mt-1 flex items-center justify-center gap-1">
                        {form.userType === r.id && <Check className="w-2.5 h-2.5 text-gold-400" />}
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-dark">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600" />
                    <input
                      type="text"
                      placeholder="Tenzing Norbu"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="input-dark !pl-11"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label-dark">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600" />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="input-dark !pl-11"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-dark">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600" />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    className="input-dark !pl-11"
                    required
                  />
                </div>
              </div>

              {/* Territory */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label-dark">State</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600 pointer-events-none" />
                    <select
                      value={form.state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="input-dark !pl-11 appearance-none"
                    >
                      {NE_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-dark">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => set('district', e.target.value)}
                    className="input-dark appearance-none"
                  >
                    {DISTRICTS_BY_STATE[form.state].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vehicle (drivers only) */}
              {form.userType === 'driver' && (
                <div>
                  <label className="label-dark">Vehicle Type</label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600 pointer-events-none" />
                    <select
                      value={form.vehicleType}
                      onChange={(e) => set('vehicleType', e.target.value)}
                      className="input-dark !pl-11 appearance-none"
                    >
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-gold w-full !py-3.5 !text-base">
                {loading ? (
                  <span className="spinner-gold !w-5 !h-5 !border-2" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Submit Application
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-ivory-500 mt-6">
              Already cleared?{' '}
              <Link to="/login" className="text-gold-300 hover:text-gold-200 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default RegisterPage;
