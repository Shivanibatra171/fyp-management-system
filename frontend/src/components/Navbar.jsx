import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, ShieldCheck, Briefcase, GraduationCap, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Determine header title based on current route and role
  const getHeaderTitle = () => {
    if (location.pathname.startsWith('/admin')) {
      return 'Coordinator / Admin Dashboard';
    }
    if (location.pathname.startsWith('/supervisor')) {
      return 'Supervisor Dashboard';
    }
    return 'Student Dashboard';
  };

  // Determine user tagline in mockup format (e.g. "Ali | BS CS", "Dr. Khursheed", "FYP Office")
  const getUserTagline = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'FYP Office';
    if (user.role === 'supervisor') return user.name || 'Dr. Khursheed';
    return `${user.name} | ${user.department || 'Computer System Engineering'}`;
  };

  return (
    <>
      <header className="h-16 bg-[#382115] text-white flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-cream-200 hover:text-white hover:bg-coffee-800 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-caramel-500 flex items-center justify-center font-black text-white text-xs shadow-sm">
              FYP
            </div>
            <h1 className="font-bold text-base sm:text-xl tracking-tight text-white">
              {getHeaderTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {user && (
            <div className="text-right">
              <span className="font-semibold text-xs sm:text-sm text-cream-100 tracking-wide">
                {getUserTagline()}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cream-200 hover:text-white bg-coffee-800/80 hover:bg-coffee-700 border border-coffee-700/60 transition shadow-sm cursor-pointer"
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-[#2b1810]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-[#ece1d5] shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-[#382115] text-lg">Confirm Sign Out</h3>
              <p className="text-xs text-[#7a6455] mt-1.5 leading-relaxed">
                Kya aap logout karna chahte hain? / Are you sure you want to end your current session and sign out of the portal?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-cream-50 text-[#5d4638] text-xs font-bold hover:bg-cream-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
