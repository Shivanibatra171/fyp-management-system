import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Briefcase, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('expired') === 'true';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      const user = await login(email, password);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'supervisor') navigate('/supervisor');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials or server not connected.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f7f1eb] text-[#2b1810] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-[#ece1d5] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Branding & Test Accounts Panel (Dark Coffee Hero matching Mockup) */}
        <div className="lg:col-span-5 bg-[#382115] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-caramel-500 flex items-center justify-center font-black text-white text-base shadow-md">
                FYP
              </div>
              <span className="font-extrabold text-lg tracking-tight text-cream-100">
                University FYP Portal
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Final Year Project Coordination System
              </h2>
              <p className="text-cream-200 text-sm mt-2 leading-relaxed">
                Centralized platform for proposal submissions, AI-driven similarity checks, supervisor reviews, and milestone progress tracking.
              </p>
            </div>

            {/* 3 Pre-configured Test Accounts per user request */}
            <div className="pt-4 border-t border-coffee-700/80 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-caramel-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-caramel-400" />
                <span>Quick Test Accounts (Click to Fill)</span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@university.edu', 'Password@123')}
                  className="w-full text-left p-3 rounded-xl bg-coffee-800/80 hover:bg-coffee-700/80 border border-coffee-700/60 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-caramel-300">
                        Coordinator / Admin
                      </div>
                      <div className="text-[11px] text-cream-300">admin@university.edu</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-caramel-400 bg-coffee-900 px-2 py-0.5 rounded">
                    Fill &rarr;
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('dr.khursheed@university.edu', 'Password@123')}
                  className="w-full text-left p-3 rounded-xl bg-coffee-800/80 hover:bg-coffee-700/80 border border-coffee-700/60 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-caramel-300">
                        Supervisor (Dr. Khursheed)
                      </div>
                      <div className="text-[11px] text-cream-300">dr.khursheed@university.edu</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-caramel-400 bg-coffee-900 px-2 py-0.5 rounded">
                    Fill &rarr;
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('student@university.edu', 'Password@123')}
                  className="w-full text-left p-3 rounded-xl bg-coffee-800/80 hover:bg-coffee-700/80 border border-coffee-700/60 transition group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-caramel-500/20 text-caramel-300 flex items-center justify-center text-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-caramel-300">
                        Student (Ali Ahmed)
                      </div>
                      <div className="text-[11px] text-cream-300">student@university.edu</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-caramel-400 bg-coffee-900 px-2 py-0.5 rounded">
                    Fill &rarr;
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-cream-300 pt-6">
            Default Password for all test accounts: <strong className="text-white font-mono">Password@123</strong>
          </div>
        </div>

        {/* Right Form Panel (Spacious, clean, responsive) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#382115] tracking-tight">
                Sign in to your account
              </h3>
              <p className="text-sm text-[#7a6455] mt-1">
                Enter your university credentials to access your FYP workspace.
              </p>
            </div>

            {sessionExpired && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Your session has expired. Please log in again.</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    required
                    className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-[#382115] hover:bg-[#26140b] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#382115]/15 transition disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign In to Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 text-center text-xs text-[#7a6455]">
              New student joining this semester?{' '}
              <Link to="/register" className="font-bold text-[#a35f2f] hover:underline underline-offset-4">
                Create Student Account &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
