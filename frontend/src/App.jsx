import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Protected Route Wrapper
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProposalSubmission from './pages/student/ProposalSubmission';
import ProjectStatusPage from './pages/student/ProjectStatusPage';
import PreviousFypsSearch from './pages/student/PreviousFypsSearch';
import DocumentUpload from './pages/student/DocumentUpload';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import AssignedStudents from './pages/supervisor/AssignedStudents';
import ProposalReviews from './pages/supervisor/ProposalReviews';
import ProgressTracking from './pages/supervisor/ProgressTracking';
import MilestoneGrading from './pages/supervisor/MilestoneGrading';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSupervisors from './pages/admin/ManageSupervisors';
import SupervisorAllocation from './pages/admin/SupervisorAllocation';
import ManageProjects from './pages/admin/ManageProjects';
import PreviousFypManagement from './pages/admin/PreviousFypManagement';

// Root Redirector based on user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f1eb] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#382115] text-white flex items-center justify-center font-extrabold text-xl shadow-lg mb-4 animate-bounce">
          FYP
        </div>
        <p className="text-sm font-bold text-[#382115]">Loading University FYP Portal...</p>
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'supervisor') return <Navigate to="/supervisor" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <Routes>
      {/* Root entry point */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="proposal" element={<ProposalSubmission />} />
        <Route path="project-status" element={<ProjectStatusPage />} />
        <Route path="previous-fyps" element={<PreviousFypsSearch />} />
        <Route path="documents" element={<DocumentUpload />} />
      </Route>

      {/* Supervisor Portal */}
      <Route
        path="/supervisor"
        element={
          <ProtectedRoute allowedRoles={['supervisor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SupervisorDashboard />} />
        <Route path="students" element={<AssignedStudents />} />
        <Route path="proposals" element={<ProposalReviews />} />
        <Route path="progress" element={<ProgressTracking />} />
        <Route path="grading" element={<MilestoneGrading />} />
      </Route>

      {/* Administrator Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="supervisors" element={<ManageSupervisors />} />
        <Route path="users" element={<Navigate to="/admin/students" replace />} />
        <Route path="allocation" element={<SupervisorAllocation />} />
        <Route path="projects" element={<ManageProjects />} />
        <Route path="previous-fyps" element={<PreviousFypManagement />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
