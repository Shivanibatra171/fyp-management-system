import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Briefcase,
  FileText,
  FolderKanban,
  Database,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  UserCheck,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentsCount: 0,
    supervisorsCount: 0,
    proposalsCount: 0,
    pendingProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0,
    projectsCount: 0,
    activeProjects: 0,
    completedProjects: 0,
    previousFypsCount: 0,
  });

  const [recentProposals, setRecentProposals] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, proposalsRes] = await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/admin/proposals?limit=5'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
          const s = statsRes.value.data.stats;
          setStats({
            studentsCount: s.users?.students || 0,
            supervisorsCount: s.users?.supervisors || 0,
            proposalsCount: s.proposals?.total || 0,
            pendingProposals: s.proposals?.pending || 0,
            approvedProposals: s.proposals?.approved || 0,
            rejectedProposals: s.proposals?.rejected || 0,
            projectsCount: s.projects?.total || 0,
            activeProjects: s.projects?.active || 0,
            completedProjects: s.projects?.completed || 0,
            previousFypsCount: s.previousFyps?.total || 0,
          });
        }

        if (proposalsRes.status === 'fulfilled' && proposalsRes.value.data?.success) {
          setRecentProposals(proposalsRes.value.data.proposals || []);
        }
      } catch (err) {
        toast.error('Failed to load admin analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalProposalsCount = Math.max(stats.proposalsCount, 1);
  const approvedPct = Math.round((stats.approvedProposals / totalProposalsCount) * 100);
  const pendingPct = Math.round((stats.pendingProposals / totalProposalsCount) * 100);
  const rejectedPct = Math.round((stats.rejectedProposals / totalProposalsCount) * 100);

  // Supervisor workload breakdown
  const supervisorWorkload = [
    { name: 'Dr. Khursheed', count: 4, max: 6 },
    { name: 'Dr. Tariq', count: 3, max: 6 },
    { name: 'Dr. Sana', count: 2, max: 6 },
    { name: 'Dr. Asif', count: 1, max: 6 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Welcome & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#b5743d]" />
            FYP System Analytics & Overview
          </h1>
          <p className="text-[#7a6455] text-sm mt-1">
            Real-time university-wide proposal stats, student candidate counts, and supervisor allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/allocation"
            className="px-4 py-2 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider transition shadow-sm"
          >
            Assign Supervisors
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Students */}
        <Link to="/admin/students" className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
              TOTAL STUDENTS
            </span>
            <Users className="w-4 h-4 text-[#8c7a6b] group-hover:text-[#b5743d] transition" />
          </div>
          <div className="text-2xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : stats.studentsCount}
          </div>
          <div className="text-[11px] text-[#8c7a6b] mt-1">Registered Candidates</div>
        </Link>

        {/* Card 2: Proposals */}
        <Link to="/admin/projects" className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
              PROPOSALS
            </span>
            <FileText className="w-4 h-4 text-[#8c7a6b] group-hover:text-[#b5743d] transition" />
          </div>
          <div className="text-2xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : stats.proposalsCount}
          </div>
          <div className="text-[11px] text-[#8c7a6b] mt-1">{stats.pendingProposals} Pending Review</div>
        </Link>

        {/* Card 3: Active Projects */}
        <Link to="/admin/projects" className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
              ACTIVE PROJECTS
            </span>
            <FolderKanban className="w-4 h-4 text-[#8c7a6b] group-hover:text-[#b5743d] transition" />
          </div>
          <div className="text-2xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : stats.activeProjects}
          </div>
          <div className="text-[11px] text-[#8c7a6b] mt-1">{stats.completedProjects} Completed</div>
        </Link>

        {/* Card 4: Supervisors */}
        <Link to="/admin/supervisors" className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
              SUPERVISORS
            </span>
            <Briefcase className="w-4 h-4 text-[#8c7a6b] group-hover:text-[#b5743d] transition" />
          </div>
          <div className="text-2xl sm:text-4xl font-extrabold text-[#382115]">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#b5743d]" /> : stats.supervisorsCount}
          </div>
          <div className="text-[11px] text-[#8c7a6b] mt-1">Faculty Supervisors</div>
        </Link>

      </div>

      {/* Middle Row: Visual Analytics & Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Proposal Pipeline Status (Matching Mockup Charts) */}
        <div className="lg:col-span-6 bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ece1d5] pb-3">
            <div>
              <h2 className="font-extrabold text-[#382115] text-lg">
                Proposal Lifecycle Distribution
              </h2>
              <p className="text-xs text-[#7a6455] mt-0.5">
                Current evaluation stage breakdown across all FYP proposals
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#b5743d]">
              Total: {stats.proposalsCount}
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Approved Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#382115]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  Approved Proposals
                </span>
                <span className="font-mono text-emerald-800">
                  {stats.approvedProposals} ({approvedPct}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#faf6f0] border border-[#ece1d5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(approvedPct, 4)}%` }}
                />
              </div>
            </div>

            {/* Pending Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#382115]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b5743d] inline-block" />
                  Pending Faculty Review
                </span>
                <span className="font-mono text-[#8c4e24]">
                  {stats.pendingProposals} ({pendingPct}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#faf6f0] border border-[#ece1d5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b5743d] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pendingPct, 4)}%` }}
                />
              </div>
            </div>

            {/* Rejected Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#382115]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Rejected / Revisions Needed
                </span>
                <span className="font-mono text-rose-800">
                  {stats.rejectedProposals} ({rejectedPct}%)
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#faf6f0] border border-[#ece1d5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(rejectedPct, 4)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5] text-xs text-[#5d4638] flex items-center justify-between">
            <span>Historical Archive FYP Records:</span>
            <strong className="text-sm font-black text-[#382115]">{stats.previousFypsCount} Projects</strong>
          </div>
        </div>

        {/* Right: Supervisor Workload meters (Matching Mockup) */}
        <div className="lg:col-span-6 bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ece1d5] pb-3">
            <div>
              <h2 className="font-extrabold text-[#382115] text-lg">
                Faculty Supervision Quota
              </h2>
              <p className="text-xs text-[#7a6455] mt-0.5">
                Current student project distribution against university capacity limit (6/faculty)
              </p>
            </div>
            <Link
              to="/admin/allocation"
              className="text-xs font-bold text-[#b5743d] hover:text-[#8c4e24] flex items-center gap-1 transition"
            >
              <span>Reallocate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 pt-1">
            {supervisorWorkload.map((sup, idx) => {
              const pct = Math.round((sup.count / sup.max) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#382115]">{sup.name}</span>
                    <span className="font-mono font-bold text-[#8c4e24]">
                      {sup.count} / {sup.max} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#faf6f0] border border-[#ece1d5] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 85 ? 'bg-amber-600' : 'bg-[#382115]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/admin/supervisors"
              className="text-xs font-bold text-[#8c4e24] hover:underline flex items-center gap-1"
            >
              <span>Manage all faculty profiles & capacities &rarr;</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Proposals Quick Roster Table */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#ece1d5] pb-3">
          <div>
            <h2 className="font-extrabold text-[#382115] text-lg">
              Recent Proposal Submissions
            </h2>
            <p className="text-xs text-[#7a6455] mt-0.5">
              Latest FYP topic proposals submitted by student candidates
            </p>
          </div>
          <Link
            to="/admin/projects"
            className="text-xs font-bold text-[#b5743d] hover:text-[#8c4e24] flex items-center gap-1 transition"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#ece1d5] text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider bg-[#faf6f0]/50">
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Submitted By</th>
                <th className="py-3 px-3">Domain</th>
                <th className="py-3 px-3">AI Similarity</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece1d5]">
              {recentProposals.length > 0 ? (
                recentProposals.map((prop) => (
                  <tr key={prop._id} className="hover:bg-[#faf6f0] transition">
                    <td className="py-3.5 px-3 font-bold text-[#382115] max-w-xs truncate">
                      {prop.title}
                    </td>
                    <td className="py-3.5 px-3 text-[#5d4638]">
                      {prop.submittedBy?.name || 'Student'}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#7a6455]">
                      {prop.domain}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        (prop.similarityScore || 0) >= 70
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {prop.similarityScore || 0}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#faf6f0] text-[#382115] border border-[#ece1d5]">
                        {prop.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs text-[#8c7a6b]">
                    No proposal submissions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
