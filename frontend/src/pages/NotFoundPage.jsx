import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-4 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
