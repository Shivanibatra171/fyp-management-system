import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, Phone, Hash, ArrowRight, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: 'Computer Science',
    phone: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        phone: formData.phone.trim(),
      });
      navigate('/student');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration could not be completed. Please ensure backend server is running.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1eb] text-[#2b1810] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-[#ece1d5] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Informational Panel (Dark Coffee) */}
        <div className="lg:col-span-5 bg-[#382115] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-caramel-500 flex items-center justify-center font-black text-white text-base shadow-md">
                FYP
              </div>
              <span className="font-extrabold text-lg tracking-tight text-cream-100">
                Student Registration
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Begin Your Final Year Project Journey
              </h2>
              <p className="text-cream-200 text-sm mt-2 leading-relaxed">
                Create your student portal account to submit proposals, run AI duplicate project checks, get assigned a faculty supervisor, and submit deliverables.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-coffee-700/80 text-xs text-cream-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-caramel-400 shrink-0" />
                <span>Instant AI similarity screening on proposal submissions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-caramel-400 shrink-0" />
                <span>Direct supervisor feedback and milestone grading</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-caramel-400 shrink-0" />
                <span>Digital submission of proposal, midterm & final thesis</span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-xs text-cream-300">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-caramel-300 hover:text-white underline underline-offset-4">
              Sign in to your account &rarr;
            </Link>
          </div>
        </div>

        {/* Right Form Panel (Spacious, multi-column, wide and responsive) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-xl w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#382115] tracking-tight">
                Create Student Account
              </h3>
              <p className="text-sm text-[#7a6455] mt-1">
                Fill in your university enrollment details to register for FYP.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ali Ahmed"
                    required
                    className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@university.edu"
                      required
                      className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                    Student ID / Roll No *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g. CSE-2023-01"
                      required
                      className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                    Department *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Computer System Engineering">Computer System Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92-300-1234567"
                      className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      required
                      className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d4638] mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                      className="w-full bg-[#fbf8f4] border border-[#dfd1c3] focus:border-[#b5743d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2b1810] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 bg-[#382115] hover:bg-[#26140b] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#382115]/15 transition disabled:opacity-50"
              >
                {submitting ? 'Creating student profile...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
