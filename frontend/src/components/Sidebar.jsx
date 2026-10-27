import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  Search,
  UploadCloud,
  Users,
  Briefcase,
  FileCheck,
  Award,
  UserCog,
  UserCheck,
  Database,
  Cpu,
  TrendingUp,
  FolderKanban,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { to: '/student', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
          { to: '/student/proposal', label: 'Submit Proposal', icon: FilePlus },
          { to: '/student/project-status', label: 'My Project Status', icon: FolderKanban },
          { to: '/student/previous-fyps', label: 'Search Archives', icon: Search },
          { to: '/student/documents', label: 'Upload Deliverables', icon: UploadCloud },
        ];
      case 'supervisor':
        return [
          { to: '/supervisor', label: 'Overview Dashboard', icon: LayoutDashboard, end: true },
          { to: '/supervisor/students', label: 'Assigned Students', icon: Users },
          { to: '/supervisor/proposals', label: 'Proposal Reviews', icon: FileCheck },
          { to: '/supervisor/progress', label: 'Progress Tracking', icon: TrendingUp },
          { to: '/supervisor/grading', label: 'Marks & Evaluation', icon: Award },
        ];
      case 'admin':
        return [
          { to: '/admin', label: 'System Analytics', icon: LayoutDashboard, end: true },
          { to: '/admin/students', label: 'Manage Students', icon: Users },
          { to: '/admin/supervisors', label: 'Manage Supervisors', icon: Briefcase },
          { to: '/admin/allocation', label: 'Assign Supervisors', icon: UserCheck },
          { to: '/admin/projects', label: 'Manage Projects', icon: FolderKanban },
          { to: '/admin/previous-fyps', label: 'Past FYPs & CSV', icon: Database },
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinks();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-coffee-950/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-20 h-full lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-[#ece1d5] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#ece1d5] lg:hidden">
            <span className="font-bold text-[#382115]">Navigation</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-cream-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider px-3 mb-2.5">
            {user?.role ? `${user.role} workspace` : 'Menu'}
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#f7efe6] text-[#8c4e24] border-l-4 border-[#b5743d] shadow-sm'
                        : 'text-[#5d4638] hover:text-[#2b1810] hover:bg-[#faf6f0]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Engine Status Card matching Mockup theme */}
        <div className="p-4 m-3 rounded-2xl bg-[#382115] text-white shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-caramel-300 mb-1">
            <Cpu className="w-3.5 h-3.5 text-caramel-400" />
            <span>AI Similarity Detection</span>
          </div>
          <p className="text-[11px] text-cream-200 leading-relaxed">
            all-MiniLM-L6-v2 active on port 8000. Semantic check against historical FYPs.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
