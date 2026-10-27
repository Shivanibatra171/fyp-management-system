import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Loader2,
  Calendar,
  User,
  FolderKanban,
  Send,
  X,
  AlertTriangle,
} from 'lucide-react';

const ProgressTracking = () => {
  const { toast } = useToast();

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [supervisorNote, setSupervisorNote] = useState('');
  const [reviewStatus, setReviewStatus] = useState('reviewed');
  const [submitting, setSubmitting] = useState(false);

  const fetchProgressUpdates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/supervisor/progress-updates');
      if (res.data?.success) {
        setUpdates(res.data.progressUpdates || []);
      }
    } catch (err) {
      toast.error('Failed to load student progress updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressUpdates();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUpdate) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/supervisor/progress-updates/${selectedUpdate._id}/review`, {
        supervisorNote: supervisorNote.trim(),
        status: reviewStatus,
      });

      if (res.data?.success) {
        toast.success('Weekly progress update reviewed successfully!');
        setSelectedUpdate(null);
        setSupervisorNote('');
        fetchProgressUpdates();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-[#b5743d]" />
          Student Progress Tracking
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Monitor weekly development milestones, review completed tasks, address student blockers, and provide faculty guidance.
        </p>
      </div>

      {/* Progress Updates List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b5743d]" />
          <p className="text-xs font-semibold text-[#8c7a6b]">Loading progress logs...</p>
        </div>
      ) : updates.length > 0 ? (
        <div className="space-y-5">
          {updates.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#ece1d5] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#faf6f0] text-[#8c4e24] border border-[#ece1d5]">
                      Week {item.weekNumber}
                    </span>
                    <span className="text-xs text-[#8c7a6b]">
                      Project: <strong className="text-[#382115]">{item.project?.title || 'FYP Project'}</strong>
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#382115] text-lg">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#7a6455]">
                    Submitted by: <strong>{item.student?.name}</strong> ({item.student?.studentId || item.student?.email}) • {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      item.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c7a6b] mb-1">
                  Accomplishments / Description
                </div>
                <p className="text-sm text-[#5d4638] leading-relaxed bg-[#faf6f0] p-4 rounded-2xl border border-[#ece1d5]">
                  {item.description}
                </p>
              </div>

              {/* Tasks Completed & Blockers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {item.tasksCompleted && item.tasksCompleted.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-[#ece1d5] space-y-1.5">
                    <div className="font-bold text-[10px] uppercase tracking-wider text-[#8c7a6b]">
                      Key Tasks Completed
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[#382115]">
                      {item.tasksCompleted.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.blockers && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
                    <div className="font-bold text-[10px] uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Blockers & Challenges
                    </div>
                    <div className="text-xs">{item.blockers}</div>
                  </div>
                )}
              </div>

              {/* Supervisor Note if already provided */}
              {item.supervisorNote && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Faculty Feedback
                  </div>
                  <div>"{item.supervisorNote}"</div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 border-t border-[#ece1d5] flex justify-end">
                <button
                  onClick={() => {
                    setSelectedUpdate(item);
                    setSupervisorNote(item.supervisorNote || '');
                    setReviewStatus('reviewed');
                  }}
                  className="px-5 py-2 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider transition shadow-sm"
                >
                  {item.status === 'reviewed' ? 'Update Feedback' : 'Review & Add Feedback'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-3">
          <TrendingUp className="w-12 h-12 text-[#8c7a6b]/50 mx-auto" />
          <h3 className="font-extrabold text-[#382115] text-lg">No Weekly Logs Submitted Yet</h3>
          <p className="text-xs text-[#7a6455] max-w-sm mx-auto">
            When your assigned students log their weekly milestone achievements, they will show up here for your review.
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b border-[#ece1d5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  Weekly Progress Review
                </span>
                <h3 className="font-extrabold text-[#382115] text-lg mt-0.5">
                  Week {selectedUpdate.weekNumber}: {selectedUpdate.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUpdate(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Review Status *
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                >
                  <option value="reviewed">Reviewed & Satisfactory</option>
                  <option value="submitted">Needs Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Supervisor Guidance Note *
                </label>
                <textarea
                  rows="4"
                  value={supervisorNote}
                  onChange={(e) => setSupervisorNote(e.target.value)}
                  placeholder="Provide recommendations, approval of completed tasks, or next steps..."
                  className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#ece1d5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUpdate(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProgressTracking;
