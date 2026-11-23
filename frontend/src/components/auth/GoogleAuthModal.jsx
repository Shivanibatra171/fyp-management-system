import React, { useState } from 'react';
import { X, User, Mail, GraduationCap, Users, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleIcon } from './AuthCommon';

const GoogleAuthModal = ({ isOpen, onClose, onGoogleSignIn, defaultRole = 'student' }) => {
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickGoogleAccounts = [
    {
      name: 'Ali Ahmed',
      email: 'student@university.edu',
      role: 'student',
      roleLabel: 'Student',
      icon: GraduationCap,
      avatarColor: 'bg-indigo-600',
    },
    {
      name: 'Dr. Khursheed',
      email: 'dr.khursheed@university.edu',
      role: 'supervisor',
      roleLabel: 'Supervisor (Faculty)',
      icon: Users,
      avatarColor: 'bg-emerald-600',
    },
    {
      name: 'FYP Coordinator / Admin',
      email: 'admin@university.edu',
      role: 'admin',
      roleLabel: 'Administrator',
      icon: ShieldCheck,
      avatarColor: 'bg-purple-700',
    },
  ];

  const handleQuickSelect = async (account) => {
    try {
      setLoading(true);
      setError('');
      await onGoogleSignIn({
        email: account.email,
        name: account.name,
        role: account.role,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) {
      setError('Please provide a Google email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onGoogleSignIn({
        email: customEmail.trim(),
        name: customName.trim() || customEmail.split('@')[0],
        role: selectedRole,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden relative">
        
        {/* Top Header bar with Google styling */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GoogleIcon className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-gray-500">to continue to CampusCore FYP Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 pt-4 space-y-4">
          {!customMode ? (
            <>
              <p className="text-xs text-gray-600 font-medium">
                Choose an account to sign in:
              </p>

              <div className="space-y-2">
                {quickGoogleAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickSelect(account)}
                      className="w-full p-3 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition flex items-center justify-between group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${account.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-sm`}
                        >
                          {account.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">
                            {account.name}
                          </div>
                          <div className="text-xs text-gray-500">{account.email}</div>
                          <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                            <Icon className="w-3 h-3" />
                            {account.roleLabel}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 transition"
                >
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Use another Google account</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-gray-800">Enter Google Account Info</span>
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  &larr; Back to list
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Google Display Name"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-600 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Google Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="you@gmail.com or you@university.edu"
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-600 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Assign Portal Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student', label: 'Student', icon: GraduationCap },
                    { id: 'supervisor', label: 'Supervisor', icon: Users },
                    { id: 'admin', label: 'Admin', icon: ShieldCheck },
                  ].map((r) => {
                    const RIcon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                          selectedRole === r.id
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <RIcon className="w-3.5 h-3.5" />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Google Account'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-gray-400">
            Protected by CampusCore Unified Single Sign-On (SSO)
          </div>
        </div>

      </div>
    </div>
  );
};

export default GoogleAuthModal;
