import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Award,
  MessageSquare,
  FileText,
  UploadCloud,
  Send,
  Loader2,
  AlertCircle,
  UserCheck,
  Download,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const ProjectStatusPage = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    proposal: null,
    project: null,
    documents: [],
    feedback: [],
    marks: [],
    progressUpdates: [],
    studentProfile: null,
  });

  // New weekly progress form state
  const [weeklyForm, setWeeklyForm] = useState({
    title: '',
    weekNumber: '',
    description: '',
    tasksCompleted: '',
    nextWeekPlan: '',
    blockers: '',
  });
  const [submittingProgress, setSubmittingProgress] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/my-project');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load project status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const handleWeeklySubmit = async (e) => {
    e.preventDefault();
    if (!weeklyForm.title || !weeklyForm.weekNumber || !weeklyForm.description) {
      toast.error('Please fill in title, week number, and description.');
      return;
    }

    try {
      setSubmittingProgress(true);
      const res = await api.post('/student/progress-updates', {
        title: weeklyForm.title.trim(),
        weekNumber: parseInt(weeklyForm.weekNumber, 10),
        description: weeklyForm.description.trim(),
        tasksCompleted: weeklyForm.tasksCompleted,
        nextWeekPlan: weeklyForm.nextWeekPlan,
        blockers: weeklyForm.blockers,
        projectId: data.project?._id,
      });

      if (res.data?.success) {
        toast.success('Weekly progress update submitted to supervisor!');
        setShowProgressModal(false);
        setWeeklyForm({
          title: '',
          weekNumber: '',
          description: '',
          tasksCompleted: '',
          nextWeekPlan: '',
          blockers: '',
        });
        fetchProjectDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit progress update.');
    } finally {
      setSubmittingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#b5743d]" />
        <p className="text-sm font-semibold text-[#8c7a6b]">Loading Project Status & Milestones...</p>
      </div>
    );
  }

  const { proposal, project, documents, feedback, marks, progressUpdates } = data;

  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto bg-white border border-[#ece1d5] rounded-3xl p-10 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#f7efe6] flex items-center justify-center text-[#8c4e24]">
          <FolderKanban className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#382115]">No Active Project Found</h2>
        <p className="text-sm text-[#7a6455] max-w-md mx-auto">
          You haven't submitted an FYP proposal yet. Once you submit a proposal and it is approved, your full milestone tracking and marks will appear here.
        </p>
        <div className="pt-2">
          <Link
            to="/student/proposal"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#382115] text-[#f7efe6] font-semibold text-sm hover:bg-[#2b1810] shadow-md transition"
          >
            <span>Submit Proposal Now</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overall milestone completion
  const milestonesList = [
    { key: 'proposal', label: 'Proposal Defense', status: proposal.status === 'approved' ? 'completed' : 'in-progress' },
    { key: 'srs', label: 'SRS & Architecture', status: project ? 'completed' : 'pending' },
    { key: 'mid_evaluation', label: 'Mid-Term Evaluation', status: project?.currentMilestone === 'final_defense' || project?.currentMilestone === 'completed' ? 'completed' : (project ? 'in-progress' : 'pending') },
    { key: 'final_defense', label: 'Final Defense', status: project?.status === 'completed' ? 'completed' : 'pending' },
    { key: 'final_thesis', label: 'Thesis Submission', status: project?.status === 'completed' ? 'completed' : 'pending' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-[#b5743d]" />
            My Project Status & Milestones
          </h1>
          <p className="text-[#7a6455] text-sm mt-1">
            Track current progress, supervisor evaluations, marks breakdown, and submitted deliverables.
          </p>
        </div>

        <button
          onClick={() => setShowProgressModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] shadow-sm transition"
        >
          <Send className="w-4 h-4 text-[#C98A53]" />
          <span>Log Weekly Progress</span>
        </button>
      </div>

      {/* Main Project Card */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece1d5] pb-5">
          <div>
            <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
              {project ? 'Active Final Year Project' : 'Under Review Proposal'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#382115] mt-1">
              {project?.title || proposal.title}
            </h2>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
            (project?.status === 'completed')
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : (proposal.status === 'approved')
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {project?.status || proposal.status}
          </span>
        </div>

        <p className="text-sm text-[#5d4638] leading-relaxed">
          {project?.abstract || proposal.abstract}
        </p>

        {/* Quick Details Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5]">
            <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">Domain</div>
            <div className="text-sm font-bold text-[#382115] mt-1 truncate">
              {project?.domain || proposal.domain}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5]">
            <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">Supervisor</div>
            <div className="text-sm font-bold text-[#382115] mt-1 truncate">
              {project?.supervisor?.name || proposal.supervisor?.name || 'Dr. Khursheed'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5]">
            <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">AI Similarity Score</div>
            <div className="text-sm font-bold text-[#382115] mt-1">
              {proposal.similarityScore || 0}% Match
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5]">
            <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">Final Grade</div>
            <div className="text-sm font-black text-[#8c4e24] mt-1">
              {project?.finalGrade ? `${project.finalGrade} (${project.finalMarks} pts)` : 'Pending Completion'}
            </div>
          </div>
        </div>

      </div>

      {/* Milestone Progress Lifecycle */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-[#382115] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#b5743d]" />
          <span>Project Milestone Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {milestonesList.map((m, idx) => (
            <div
              key={m.key}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                m.status === 'completed'
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : m.status === 'in-progress'
                  ? 'bg-[#f7efe6] border-[#e2d2c1] ring-2 ring-[#b5743d]/30'
                  : 'bg-[#faf8f5] border-[#ece1d5] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#8c7a6b]">Phase 0{idx + 1}</span>
                {m.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-[#8c7a6b]" />
                )}
              </div>
              <div className="font-bold text-xs text-[#382115] leading-tight mb-2">
                {m.label}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                m.status === 'completed'
                  ? 'text-emerald-700'
                  : m.status === 'in-progress'
                  ? 'text-[#8c4e24]'
                  : 'text-slate-400'
              }`}>
                {m.status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Marks & Feedback Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Marks Breakdown */}
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#382115] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#b5743d]" />
            <span>Milestone Marks & Grades</span>
          </h3>

          {marks && marks.length > 0 ? (
            <div className="divide-y divide-[#ece1d5]">
              {marks.map((m) => (
                <div key={m._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#382115] capitalize">
                      {m.milestoneKey.replace('_', ' ')}
                    </div>
                    {m.remarks && (
                      <div className="text-xs text-[#7a6455] italic mt-0.5">
                        "{m.remarks}"
                      </div>
                    )}
                    <div className="text-[11px] text-[#8c7a6b]">
                      Graded by: {m.gradedBy?.name || 'Supervisor'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#8c4e24]">
                      {m.marksAwarded} / {m.maxMarks}
                    </span>
                    <div className="text-[10px] font-bold text-emerald-700">
                      {Math.round((m.marksAwarded / m.maxMarks) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#8c7a6b] bg-[#faf6f0] rounded-2xl border border-dashed border-[#ece1d5]">
              No marks published yet. Evaluations will appear here after supervisor defenses.
            </div>
          )}
        </div>

        {/* Right: Supervisor Feedback */}
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#382115] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#b5743d]" />
            <span>Supervisor Reviews & Feedback</span>
          </h3>

          {feedback && feedback.length > 0 ? (
            <div className="space-y-3">
              {feedback.map((f) => (
                <div key={f._id} className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#382115]">
                      {f.author?.name || 'Dr. Khursheed'}
                    </span>
                    <span className="text-[#8c7a6b] text-[10px]">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#5d4638] leading-relaxed">
                    {f.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#8c7a6b] bg-[#faf6f0] rounded-2xl border border-dashed border-[#ece1d5]">
              No feedback notes recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#382115] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#b5743d]" />
            <span>Uploaded Milestone Documents</span>
          </h3>
          <Link
            to="/student/documents"
            className="text-xs font-bold text-[#b5743d] hover:text-[#8c4e24] transition"
          >
            + Upload New Deliverable
          </Link>
        </div>

        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="p-4 rounded-2xl bg-[#faf6f0] border border-[#ece1d5] flex items-start justify-between gap-3"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="font-bold text-xs text-[#382115] truncate">
                    {doc.title || doc.originalFileName}
                  </div>
                  <div className="text-[10px] text-[#8c7a6b] uppercase tracking-wider">
                    {doc.milestoneKey.replace('_', ' ')} • {(doc.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
                <a
                  href={`/api/student/documents/${doc._id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white border border-[#ece1d5] hover:bg-[#f7efe6] text-[#382115] transition shrink-0"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#8c7a6b] bg-[#faf6f0] rounded-2xl border border-dashed border-[#ece1d5]">
            No deliverables uploaded yet. Upload your SRS or Chapter drafts.
          </div>
        )}
      </div>

      {/* Log Weekly Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#ece1d5] pb-4">
              <h3 className="font-extrabold text-[#382115] text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-[#b5743d]" />
                Log Weekly Progress
              </h3>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-slate-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWeeklySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  value={weeklyForm.title}
                  onChange={(e) => setWeeklyForm({ ...weeklyForm, title: e.target.value })}
                  placeholder="e.g., Week 7: Completed Dataset Preprocessing & Model Architecture"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1">
                    Week Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={weeklyForm.weekNumber}
                    onChange={(e) => setWeeklyForm({ ...weeklyForm, weekNumber: e.target.value })}
                    placeholder="e.g., 7"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1">
                    Target Milestone
                  </label>
                  <input
                    type="text"
                    disabled
                    value={project?.currentMilestone || 'srs'}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-slate-100 text-sm text-slate-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1">
                  Description / Accomplishments *
                </label>
                <textarea
                  rows="3"
                  value={weeklyForm.description}
                  onChange={(e) => setWeeklyForm({ ...weeklyForm, description: e.target.value })}
                  placeholder="Detailed breakdown of tasks completed this week..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1">
                  Blockers / Challenges (Optional)
                </label>
                <input
                  type="text"
                  value={weeklyForm.blockers}
                  onChange={(e) => setWeeklyForm({ ...weeklyForm, blockers: e.target.value })}
                  placeholder="e.g., Waiting on GPU cluster quota approval"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProgress}
                  className="px-6 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingProgress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectStatusPage;
