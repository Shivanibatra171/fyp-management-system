import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  FileCheck,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assignedStudentsCount: 0,
    pendingReviewsCount: 0,
    avgProgress: 65,
    studentsList: [],
    proposalsList: [],
    projectsList: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [studentsRes, proposalsRes, projectsRes] = await Promise.allSettled([
          api.get('/supervisor/students'),
          api.get('/supervisor/proposals'),
          api.get('/supervisor/projects'),
        ]);

        const students = studentsRes.status === 'fulfilled' ? studentsRes.value.data?.students || [] : [];
        const proposals = proposalsRes.status === 'fulfilled' ? proposalsRes.value.data?.proposals || [] : [];
        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data?.projects || [] : [];

        const pendingProposals = proposals.filter((p) => p.status === 'pending');

        // Calculate progress average
        const progressValues = projects.map((p) => {
          if (p.status === 'completed') return 100;
          if (p.currentMilestone === 'final_defense') return 80;
          if (p.currentMilestone === 'mid_evaluation') return 50;
          return 25;
        });
        const avg = progressValues.length > 0
          ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
          : 60;

        setStats({
          assignedStudentsCount: students.length,
          pendingReviewsCount: pendingProposals.length,
          avgProgress: avg,
          studentsList: students,
          proposalsList: proposals,
          projectsList: projects,
        });
      } catch (err) {
        toast.error('Could not load supervisor dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#382115] text-[#f7efe6]">
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#b5743d] text-white">
            Pending Review
          </span>
        );
      case 'changes_requested':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#825c43] text-white">
            Changes Req.
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-700 text-white">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top 3 Metric Cards matching Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Assigned Students */}
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            ASSIGNED STUDENTS
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : stats.assignedStudentsCount}
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            PENDING REVIEWS
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : stats.pendingReviewsCount}
          </div>
        </div>

        {/* Card 3: Avg. Progress */}
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            AVG. PROGRESS
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : `${stats.avgProgress}%`}
          </div>
        </div>

      </div>

      {/* Main Table: Student, Project Title, Progress, Status */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ece1d5]">
          <div>
            <h2 className="font-extrabold text-[#382115] text-lg sm:text-xl">
              Supervised Project Roster
            </h2>
            <p className="text-xs text-[#7a6455] mt-0.5">
              Active candidates and pending proposals assigned to your supervision
            </p>
          </div>
          <Link
            to="/supervisor/proposals"
            className="text-xs font-bold text-[#b5743d] hover:text-[#8c4e24] flex items-center gap-1 transition"
          >
            <span>Review Pending Proposals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#b5743d]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ece1d5] text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Project Title</th>
                  <th className="py-3 px-3">Milestone Progress</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece1d5] text-sm">
                {stats.studentsList.length > 0 ? (
                  stats.studentsList.map((stu) => {
                    const projectTitle = stu.projectInfo?.title || 'FYP Proposal in Review';
                    const status = stu.projectInfo?.status || 'pending';
                    const progress = status === 'completed' ? 100 : (status === 'in-progress' ? 65 : 30);

                    return (
                      <tr key={stu._id} className="hover:bg-[#faf6f0] transition">
                        <td className="py-4 px-3 font-bold text-[#382115]">
                          {stu.name}
                          <div className="text-[11px] font-normal text-[#8c7a6b]">
                            {stu.studentId || stu.email}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-[#5d4638] font-medium max-w-xs truncate">
                          {projectTitle}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-24 sm:w-36 bg-[#faf6f0] border border-[#ece1d5] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#b5743d] h-full rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#382115]">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-right">
                          {getStatusBadge(status)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-[#8c7a6b]">
                      No assigned students found in your roster.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/supervisor/proposals"
          className="p-5 rounded-3xl bg-white border border-[#ece1d5] hover:border-[#b5743d] shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#382115]">Review Proposals</div>
            <div className="text-xs text-[#7a6455]">Inspect AI similarity & approve</div>
          </div>
          <FileCheck className="w-6 h-6 text-[#b5743d] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/supervisor/progress"
          className="p-5 rounded-3xl bg-white border border-[#ece1d5] hover:border-[#b5743d] shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#382115]">Progress Tracking</div>
            <div className="text-xs text-[#7a6455]">Review weekly student logs</div>
          </div>
          <TrendingUp className="w-6 h-6 text-[#b5743d] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          to="/supervisor/grading"
          className="p-5 rounded-3xl bg-white border border-[#ece1d5] hover:border-[#b5743d] shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="font-bold text-sm text-[#382115]">Milestone Marks</div>
            <div className="text-xs text-[#7a6455]">Award defense scores & grades</div>
          </div>
          <Award className="w-6 h-6 text-[#b5743d] group-hover:translate-x-1 transition" />
        </Link>
      </div>

    </div>
  );
};

export default SupervisorDashboard;
