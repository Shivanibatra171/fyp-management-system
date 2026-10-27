import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400 mb-4" />
        <p className="text-sm font-medium tracking-wide">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective authorized portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'supervisor') return <Navigate to="/supervisor" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
