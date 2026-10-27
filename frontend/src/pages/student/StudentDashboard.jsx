import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UploadCloud,
  Search,
  User,
  Cpu,
  ArrowRight,
  MessageSquare,
  Award,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    proposal: null,
    project: null,
    assignedSupervisor: null,
  });

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get('/student/my-project');
        if (res.data?.success) {
          setData({
            proposal: res.data.proposal,
            project: res.data.project,
            assignedSupervisor: res.data.assignedSupervisor,
          });
        }
      } catch (err) {
        console.warn('Could not fetch student workspace:', err.message);
      }
    };

    fetchWorkspace();
  }, []);

  const supervisorName =
    data.assignedSupervisor?.name ||
    data.proposal?.supervisor?.name ||
    'Dr. Khursheed';

  const proposalStatus = data.proposal?.status
    ? data.proposal.status.charAt(0).toUpperCase() + data.proposal.status.slice(1)
    : 'Approved';

  const progressPercentage = data.project?.progress || 65;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top 3 Metric Cards matching Mockup Image 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Proposal Status */}
        <div className="bg-white border border-[#ece1d5] rounded-2xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            PROPOSAL STATUS
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#382115]">
            {proposalStatus}
          </div>
        </div>

        {/* Card 2: Project Progress */}
        <div className="bg-white border border-[#ece1d5] rounded-2xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            PROJECT PROGRESS
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#382115]">
            {progressPercentage}%
          </div>
        </div>

        {/* Card 3: Supervisor */}
        <div className="bg-white border border-[#ece1d5] rounded-2xl p-6 shadow-sm">
          <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            SUPERVISOR
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#382115] truncate">
            {supervisorName}
          </div>
        </div>

      </div>

      {/* Middle Row: Progress Timeline (Left) & AI Similar-Project Check (Right - Dark Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Progress timeline (matches mockup) */}
        <div className="lg:col-span-7 bg-white border border-[#ece1d5] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <h2 className="font-bold text-[#382115] text-lg">
            Progress timeline
          </h2>

          <div className="space-y-4">
            {/* Proposal */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#5d4638]">
                <span>Proposal</span>
                <span className="font-mono text-[#8c4e24]">100%</span>
              </div>
              <div className="w-full h-3.5 bg-[#f0e6dc] rounded-full overflow-hidden">
                <div className="h-full bg-[#b5743d] rounded-full w-full" />
              </div>
            </div>

            {/* Mid review */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#5d4638]">
                <span>Mid review</span>
                <span className="font-mono text-[#8c4e24]">75%</span>
              </div>
              <div className="w-full h-3.5 bg-[#f0e6dc] rounded-full overflow-hidden">
                <div className="h-full bg-[#b5743d] rounded-full w-3/4" />
              </div>
            </div>

            {/* Report draft */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#5d4638]">
                <span>Report draft</span>
                <span className="font-mono text-[#8c4e24]">50%</span>
              </div>
              <div className="w-full h-3.5 bg-[#f0e6dc] rounded-full overflow-hidden">
                <div className="h-full bg-[#b5743d] rounded-full w-1/2" />
              </div>
            </div>

            {/* Final submit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#5d4638]">
                <span>Final submit</span>
                <span className="font-mono text-[#8c4e24]">15%</span>
              </div>
              <div className="w-full h-3.5 bg-[#f0e6dc] rounded-full overflow-hidden">
                <div className="h-full bg-[#b5743d] rounded-full w-[15%]" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/student/project-status"
              className="px-4 py-2 rounded-xl bg-[#382115] hover:bg-[#26140b] text-white text-xs font-bold transition shadow-sm"
            >
              My Project Status & Milestones
            </Link>
            <Link
              to="/student/proposal"
              className="px-4 py-2 rounded-xl bg-[#f7efe6] hover:bg-[#ece1d5] text-[#8c4e24] border border-[#dfd1c3] text-xs font-bold transition"
            >
              Submit New Proposal
            </Link>
            <Link
              to="/student/documents"
              className="px-4 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f7efe6] text-[#5d4638] border border-[#ece1d5] text-xs font-bold transition"
            >
              Upload Deliverables
            </Link>
          </div>
        </div>

        {/* Right: AI Similar-project check (DARK COFFEE CARD matching Mockup) */}
        <div className="lg:col-span-5 bg-[#382115] text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <Cpu className="w-4 h-4 text-caramel-400" />
                AI similar-project check
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-coffee-800 text-caramel-300 px-2.5 py-1 rounded-full border border-coffee-700">
                all-MiniLM-L6-v2
              </span>
            </div>

            <div className="space-y-4">
              {/* Similar Project 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-cream-100 font-medium truncate pr-2">
                    Smart FYP Portal (2021)
                  </span>
                  <span className="font-mono font-bold text-caramel-300">72%</span>
                </div>
                <div className="w-full h-2.5 bg-coffee-800 rounded-full overflow-hidden">
                  <div className="h-full bg-caramel-400 rounded-full w-[72%]" />
                </div>
              </div>

              {/* Similar Project 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-cream-100 font-medium truncate pr-2">
                    Project Tracker App (2022)
                  </span>
                  <span className="font-mono font-bold text-caramel-300">48%</span>
                </div>
                <div className="w-full h-2.5 bg-coffee-800 rounded-full overflow-hidden">
                  <div className="h-full bg-caramel-400 rounded-full w-[48%]" />
                </div>
              </div>

              {/* Similar Project 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-cream-100 font-medium truncate pr-2">
                    Thesis Archive System (2020)
                  </span>
                  <span className="font-mono font-bold text-caramel-300">31%</span>
                </div>
                <div className="w-full h-2.5 bg-coffee-800 rounded-full overflow-hidden">
                  <div className="h-full bg-caramel-400 rounded-full w-[31%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-coffee-700/80 flex items-center justify-between text-[11px] text-cream-200">
            <span>Threshold limit: <strong>70%</strong></span>
            <Link
              to="/student/previous-fyps"
              className="text-caramel-300 hover:text-white font-semibold underline underline-offset-2"
            >
              Search all past FYPs &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Card: Supervisor feedback (matches mockup) */}
      <div className="bg-white border border-[#ece1d5] rounded-2xl p-6 sm:p-7 shadow-sm space-y-3.5">
        <h2 className="font-bold text-[#382115] text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8c4e24]" />
          Supervisor feedback
        </h2>

        <div className="space-y-2.5 text-sm text-[#4a3628]">
          <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#ece1d5] leading-relaxed">
            <strong className="text-[#382115]">Dr. Khursheed:</strong> Good objectives - add a clear testing plan and validation metrics.
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#ece1d5] leading-relaxed">
            <strong className="text-[#382115]">Coordinator:</strong> Proposal approved, upload the report draft by Week 8 defense date.
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
