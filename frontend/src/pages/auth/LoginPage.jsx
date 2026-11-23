import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { GoogleIcon, SparklesAccent, SkylineDecoration } from '../../components/auth/AuthCommon';
import GoogleAuthModal from '../../components/auth/GoogleAuthModal';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const sessionExpired = searchParams.get('expired') === 'true';

  const routeByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'supervisor') navigate('/supervisor');
    else navigate('/student');
  };

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
      routeByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials or server not reachable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (googleUser) => {
    const user = await googleLogin(googleUser);
    routeByRole(user.role);
  };

  const fillQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#edeefc] text-[#1e1e2d] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Background Soft Organic Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#e0e3fc] rounded-full blur-3xl pointer-events-none opacity-80" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#dadafc] rounded-full blur-3xl pointer-events-none opacity-80" />

      {/* Discrete Quick Test Credentials Banner for Examiners & Teachers */}
      <div className="mb-4 z-20 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-600 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm">
        <span className="font-bold text-indigo-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" /> Quick Demo Fill:
        </span>
        <button
          type="button"
          onClick={() => fillQuickDemo('student@university.edu', 'Password@123')}
          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition"
        >
          🎓 Student
        </button>
        <button
          type="button"
          onClick={() => fillQuickDemo('dr.khursheed@university.edu', 'Password@123')}
          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition"
        >
          👥 Supervisor
        </button>
        <button
          type="button"
          onClick={() => fillQuickDemo('admin@university.edu', 'Password@123')}
          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition"
        >
          🛡️ Admin
        </button>
      </div>

      {/* Main Split Authentication Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-indigo-950/10 border border-indigo-100/70 overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 min-h-[580px]">
        
        {/* Left Banner (Royal Indigo/Purple Brand Showcase) */}
        <div className="bg-gradient-to-b from-[#5c50ee] via-[#4f46e5] to-[#4338ca] text-white p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Decorative Circle Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo & Title */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
                  CampusCore
                </h1>
                <p className="text-[11px] font-medium text-indigo-200 mt-1 tracking-wider uppercase">
                  FYP Management System
                </p>
              </div>
            </div>

            {/* Slogan & Description */}
            <div className="mt-8">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-200">
                Plan • Track • Complete
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 leading-snug">
                Your FYP Journey
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 mt-2 leading-relaxed max-w-xs font-normal">
                A smarter way to manage FYP proposals, progress, and similar project detection.
              </p>
            </div>
          </div>

          {/* Bottom Campus Building Photograph */}
          <div className="mt-6 rounded-2xl overflow-hidden border border-white/20 shadow-lg relative h-40 sm:h-44 group">
            <img
              src="/campus.jpg"
              alt="University Campus Architecture"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/60 via-transparent to-transparent pointer-events-none" />
          </div>

        </div>

        {/* Right Form Panel (Clean White Card matching Mockup) */}
        <div className="p-7 sm:p-9 lg:p-10 flex flex-col justify-between relative bg-white">
          
          {/* Top-Right Decorative Sparkles */}
          <div className="absolute top-6 right-7">
            <SparklesAccent className="text-indigo-400" />
          </div>

          <div>
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Login to your CampusCore account
              </p>
            </div>

            {sessionExpired && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Your session has expired. Please log in again.</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {forgotMsg && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs">
                To reset your password, contact your FYP Coordinator or sign in instantly with Google!
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
              {/* Email Address */}
              <div>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full bg-white border border-gray-200 focus:border-indigo-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-white border border-gray-200 focus:border-indigo-600 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(!forgotMsg)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5c50ee] hover:bg-[#4f43e5] text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-[0.99] disabled:opacity-50 mt-1"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Logging in...' : 'Login'}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-400">
                <span className="bg-white px-3 font-medium">or</span>
              </div>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-sm transition active:scale-[0.99]"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            {/* Footer Navigation */}
            <div className="text-center text-xs text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-700 ml-1 inline-flex items-center gap-0.5 hover:underline"
              >
                Sign Up &gt;
              </Link>
            </div>
          </div>

          {/* Delicate Bottom Skyline Decoration */}
          <SkylineDecoration className="w-full text-indigo-200/50 mt-4" />

        </div>

      </div>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onGoogleSignIn={handleGoogleSignIn}
        defaultRole="student"
      />

    </div>
  );
};

export default LoginPage;
