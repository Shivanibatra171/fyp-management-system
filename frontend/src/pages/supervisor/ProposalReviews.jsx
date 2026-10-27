import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Filter,
  X,
} from 'lucide-react';

const ProposalReviews = () => {
  const { toast } = useToast();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Review modal state
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reviewAction, setReviewAction] = useState('approved');
  const [submitting, setSubmitting] = useState(false);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/supervisor/proposals');
      if (res.data?.success) {
        setProposals(res.data.proposals || []);
      }
    } catch (err) {
      toast.error('Failed to fetch proposals for review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposal) return;

    try {
      setSubmitting(true);
      // Crucial: Must be PUT /api/supervisor/proposals/:id/review
      const res = await api.put(`/supervisor/proposals/${selectedProposal._id}/review`, {
        status: reviewAction,
        remarks: remarks.trim(),
      });

      if (res.data?.success) {
        toast.success(`Proposal marked as ${reviewAction.replace('_', ' ')} successfully!`);
        setSelectedProposal(null);
        setRemarks('');
        fetchProposals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
            <FileCheck className="w-7 h-7 text-[#b5743d]" />
            Proposal Reviews & Decisions
          </h1>
          <p className="text-[#7a6455] text-sm mt-1">
            Evaluate student project proposals, inspect AI semantic similarity percentages, and record official approval remarks.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'changes_requested', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filterStatus === status
                  ? 'bg-[#382115] text-[#f7efe6] shadow-sm'
                  : 'bg-white border border-[#ece1d5] text-[#5d4638] hover:bg-[#faf6f0]'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b5743d]" />
          <p className="text-xs font-semibold text-[#8c7a6b]">Loading proposals...</p>
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="space-y-5">
          {filteredProposals.map((prop) => {
            const similarityScore = prop.similarityScore || 0;
            const hasWarning = prop.similarityWarning || similarityScore >= 70;

            return (
              <div
                key={prop._id}
                className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
              >
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#ece1d5] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#faf6f0] text-[#8c4e24] border border-[#ece1d5]">
                        {prop.domain || 'Computer Science'}
                      </span>
                      <span className="text-xs text-[#8c7a6b]">
                        Submitted by: <strong className="text-[#382115]">{prop.submittedBy?.name || 'Student'}</strong> ({prop.submittedBy?.studentId || prop.submittedBy?.email})
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[#382115] text-lg sm:text-xl">
                      {prop.title}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        prop.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : prop.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : prop.status === 'changes_requested'
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {prop.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Abstract */}
                <p className="text-sm text-[#5d4638] leading-relaxed">
                  {prop.abstract}
                </p>

                {/* AI Similarity Bar */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    hasWarning
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {hasWarning ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold">
                        AI Semantic Match Score: {similarityScore}%
                      </div>
                      <div className="text-[11px] opacity-80">
                        {hasWarning
                          ? 'High similarity warning: Potential overlap with prior FYP archives detected.'
                          : 'Original proposal: Low similarity with previous archive records.'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28 bg-white/70 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          hasWarning ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(similarityScore, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-black">{similarityScore}%</span>
                  </div>
                </div>

                {/* Technologies & Group Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5d4638]">
                  {prop.technologies && prop.technologies.length > 0 && (
                    <div>
                      <span className="font-bold text-[#8c7a6b] uppercase text-[10px] block mb-1">
                        Technologies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prop.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#faf6f0] border border-[#ece1d5] text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {prop.groupMembers && prop.groupMembers.length > 0 && (
                    <div>
                      <span className="font-bold text-[#8c7a6b] uppercase text-[10px] block mb-1">
                        Group Members
                      </span>
                      <div className="text-[11px] text-[#382115]">
                        {prop.groupMembers.map((m) => m.name || m).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Supervisor Remarks History (if any) */}
                {prop.supervisorRemarks && (
                  <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#ece1d5] text-xs text-[#5d4638] space-y-1">
                    <div className="font-bold text-[#382115]">Previous Supervisor Remarks:</div>
                    <div className="italic">"{prop.supervisorRemarks}"</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[#ece1d5] flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedProposal(prop);
                      setReviewAction('approved');
                      setRemarks(prop.supervisorRemarks || '');
                    }}
                    className="px-5 py-2 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider transition shadow-sm"
                  >
                    Evaluate & Decide
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-3">
          <FileCheck className="w-12 h-12 text-[#8c7a6b]/50 mx-auto" />
          <h3 className="font-extrabold text-[#382115] text-lg">No Proposals Found</h3>
          <p className="text-xs text-[#7a6455] max-w-sm mx-auto">
            There are currently no proposals matching the selected filter status.
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b border-[#ece1d5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  Proposal Evaluation Form
                </span>
                <h3 className="font-extrabold text-[#382115] text-lg mt-0.5">
                  {selectedProposal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
                  Official Decision *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                      reviewAction === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[#faf6f0] border-[#ece1d5] text-[#382115] hover:bg-[#f7efe6]'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('changes_requested')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                      reviewAction === 'changes_requested'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-[#faf6f0] border-[#ece1d5] text-[#382115] hover:bg-[#f7efe6]'
                    }`}
                  >
                    ✎ Need Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('rejected')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                      reviewAction === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-[#faf6f0] border-[#ece1d5] text-[#382115] hover:bg-[#f7efe6]'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Supervisor Remarks & Actionable Feedback *
                </label>
                <textarea
                  rows="4"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide technical feedback, requested improvements, or instructions for the student team..."
                  className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#ece1d5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
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
                  <span>Confirm Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProposalReviews;
