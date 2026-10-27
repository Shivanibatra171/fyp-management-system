import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Search,
  UserCheck,
  Info,
  ShieldAlert,
  Layers,
  History,
} from 'lucide-react';

const ProposalSubmission = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    domain: 'Artificial Intelligence',
    technologies: '',
    groupMembers: '',
    supervisor: '',
  });

  const [supervisors, setSupervisors] = useState([]);
  const [existingProposal, setExistingProposal] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // AI Similarity state (Pre-check)
  const [aiChecking, setAiChecking] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Check if student already has an active proposal & fetch supervisor list
  useEffect(() => {
    const initPage = async () => {
      try {
        setCheckingExisting(true);
        // Check current project/proposal status
        const [projectRes, supRes] = await Promise.allSettled([
          api.get('/student/my-project'),
          api.get('/student/supervisors'),
        ]);

        if (projectRes.status === 'fulfilled' && projectRes.value.data?.proposal) {
          setExistingProposal(projectRes.value.data.proposal);
        }

        if (supRes.status === 'fulfilled' && supRes.value.data?.supervisors) {
          setSupervisors(supRes.value.data.supervisors);
        }
      } catch (err) {
        console.warn('Initialization error:', err.message);
      } finally {
        setCheckingExisting(false);
      }
    };

    initPage();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // 2. Pre-check AI similarity before final submit
  const handleCheckSimilarity = async () => {
    setError('');
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      setError('Please enter a descriptive proposal title (at least 5 characters) to test AI similarity.');
      toast.warning('Please enter a descriptive proposal title.');
      return;
    }

    if (!formData.abstract.trim() || formData.abstract.trim().length < 20) {
      setError('Please provide a substantive abstract (at least 20 characters) for accurate semantic comparison.');
      toast.warning('Please write a detailed abstract before running the AI check.');
      return;
    }

    try {
      setAiChecking(true);
      toast.info('Analyzing proposal with AI semantic engine...');
      const res = await api.post('/student/proposals/check-similarity', {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
      });

      if (res.data?.success) {
        setAiReport(res.data.data);
        if (res.data.data.hasWarning) {
          toast.warning(`High similarity detected: ${res.data.data.maxSimilarity}% match with prior FYP archives.`);
        } else {
          toast.success(`AI Check Complete: Low similarity score (${res.data.data.maxSimilarity}%). Proposal is original!`);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'AI similarity check failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setAiChecking(false);
    }
  };

  // 3. Final Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.abstract.trim()) {
      setError('Please provide both proposal title and detailed abstract.');
      toast.error('Title and abstract are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/student/proposals', {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        domain: formData.domain.trim(),
        technologies: formData.technologies
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        groupMembers: formData.groupMembers
          ? formData.groupMembers
              .split(/[,;|]/)
              .map((m) => ({ name: m.trim(), studentId: '', email: '' }))
              .filter((m) => m.name.length > 0)
          : [],
        supervisor: formData.supervisor || undefined,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Proposal submitted successfully!');
        setExistingProposal(res.data.proposal);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit proposal.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#b5743d]" />
        <p className="text-sm font-semibold text-[#8c7a6b]">Verifying proposal status...</p>
      </div>
    );
  }

  // If student already has an active or submitted proposal
  if (existingProposal && ['pending', 'approved'].includes(existingProposal.status)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <CheckCircle2 className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#382115]">
                Proposal Already Active
              </h1>
              <p className="text-sm text-[#7a6455] mt-0.5">
                You have already submitted an FYP proposal that is currently{' '}
                <span className="font-bold uppercase text-[#8c4e24]">
                  {existingProposal.status}
                </span>.
              </p>
            </div>
          </div>

          <div className="p-6 bg-[#f7efe6] rounded-2xl border border-[#e2d2c1] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b]">
                Active Proposal Title
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                existingProposal.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                Status: {existingProposal.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#382115]">
              {existingProposal.title}
            </h2>
            <p className="text-sm text-[#5d4638] leading-relaxed">
              {existingProposal.abstract}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#7a6455]">
              <div><strong className="text-[#382115]">Domain:</strong> {existingProposal.domain}</div>
              <div><strong className="text-[#382115]">Supervisor:</strong> {existingProposal.supervisor?.name || 'Dr. Khursheed'}</div>
              <div><strong className="text-[#382115]">AI Similarity:</strong> {existingProposal.similarityScore || 0}%</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/student/project-status"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#382115] text-[#f7efe6] font-semibold text-sm hover:bg-[#2b1810] shadow-md transition"
            >
              <span>View Full Project Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student/documents"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#ece1d5] text-[#5d4638] font-semibold text-sm hover:bg-[#f7efe6] transition"
            >
              <span>Upload Milestone Deliverables</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <FileText className="w-7 h-7 text-[#b5743d]" />
          Submit FYP Proposal
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Draft your Final Year Project proposal. You can run an AI semantic similarity check to ensure originality before final submission.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <div className="font-bold">Error Notification</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
            Project Proposal Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Autonomous Drone Delivery Navigation with Deep Reinforcement Learning"
            className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-[#382115] text-sm focus:outline-none focus:ring-2 focus:ring-[#b5743d] focus:bg-white transition"
            required
          />
        </div>

        {/* Domain & Supervisor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
              Domain / Specialization <span className="text-rose-500">*</span>
            </label>
            <select
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-[#382115] text-sm focus:outline-none focus:ring-2 focus:ring-[#b5743d] focus:bg-white transition"
            >
              <option value="Artificial Intelligence">Artificial Intelligence & Deep Learning</option>
              <option value="Web & Cloud Computing">Web & Cloud Computing</option>
              <option value="Cybersecurity">Cybersecurity & Network Defense</option>
              <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
              <option value="Mobile Application">Mobile Application Engineering</option>
              <option value="Blockchain & FinTech">Blockchain & FinTech</option>
              <option value="Computer Vision">Computer Vision & Medical Imaging</option>
              <option value="Bioinformatics">Bioinformatics & Computational Biology</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
              Select Desired Supervisor
            </label>
            <select
              name="supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-[#382115] text-sm focus:outline-none focus:ring-2 focus:ring-[#b5743d] focus:bg-white transition"
            >
              <option value="">-- Faculty Supervisor (Auto / Assigned) --</option>
              {supervisors.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.designation || 'Faculty'} - {s.department || 'CS'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Abstract */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider">
              Project Abstract / Summary <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-[#8c7a6b]">
              Minimum 50 words recommended
            </span>
          </div>
          <textarea
            name="abstract"
            rows="5"
            value={formData.abstract}
            onChange={handleChange}
            placeholder="Describe the problem statement, objectives, proposed methodology, technical architecture, and expected outcomes..."
            className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-[#382115] text-sm focus:outline-none focus:ring-2 focus:ring-[#b5743d] focus:bg-white transition"
            required
          />
        </div>

        {/* Technologies & Group Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
              Technologies / Tools (Comma-separated)
            </label>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="e.g., PyTorch, React, Node.js, ROS, OpenCV"
              className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-[#382115] text-sm focus:outline-none focus:ring-2 focus:ring-[#b5743d] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
              Team / Group Members (Comma-separated)
            </label>
            <input
              type="text"
              name="groupMembers"
              value={formData.groupMembers}
              onChange={handleChange}
              placeholder="e.g., Ali Ahmed, Bilal Khan"
              className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-[#382115] text-sm focus:outline-none focus:ring-2 focus:ring-[#b5743d] focus:bg-white transition"
            />
          </div>
        </div>

        {/* AI PRE-CHECK CALLOUT BAR */}
        <div className="p-5 rounded-2xl bg-[#382115] text-[#f7efe6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-[#f7efe6]">
              <Cpu className="w-4 h-4 text-[#C98A53]" />
              <span>Step 1: Check AI Semantic Similarity First</span>
            </div>
            <p className="text-xs text-[#d1c2b5] max-w-xl">
              Compare your title and abstract against our historical database of past FYPs to ensure uniqueness before formal submission.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCheckSimilarity}
            disabled={aiChecking || submitting}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[#C98A53] hover:bg-[#b5743d] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            {aiChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Test AI Similarity</span>
              </>
            )}
          </button>
        </div>

        {/* AI SIMILARITY RESULTS DISPLAY (Shown before final submit) */}
        {aiReport && (
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 space-y-5 ${
              aiReport.hasWarning
                ? 'bg-rose-50/80 border-rose-300'
                : 'bg-emerald-50/70 border-emerald-300'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {aiReport.hasWarning ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h3 className="font-extrabold text-[#382115] text-base">
                    AI Semantic Analysis Results
                  </h3>
                  <p className="text-xs text-[#7a6455]">
                    Evaluated across {aiReport.totalCompared ?? 0} archived FYPs using Sentence-Transformers (all-MiniLM-L6-v2)
                  </p>
                </div>
              </div>

              {/* Similarity Badge */}
              <div
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  aiReport.hasWarning
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                Max Match: {aiReport.maxSimilarity}%
              </div>
            </div>

            {/* Warning Message if >70% */}
            {aiReport.hasWarning && (
              <div className="p-3.5 rounded-xl bg-white/90 border border-rose-200 text-rose-900 text-xs leading-relaxed font-medium">
                <strong>High Overlap Detected:</strong> Your proposal exceeds the 70% threshold. You may still submit, but your supervisor will see this warning flag. We recommend modifying your problem statement or technical scope.
              </div>
            )}

            {/* Top Matching Projects Table */}
            {aiReport.topMatches && aiReport.topMatches.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
                  Top Matching Archived Projects & Percentage:
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {aiReport.topMatches.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="bg-white/90 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-[#382115]">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-[#7a6455] flex flex-wrap gap-3">
                          <span>Domain: <strong>{m.domain || 'CS'}</strong></span>
                          <span>Year: <strong>{m.year || 2024}</strong></span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.similarityPercentage >= 70
                                ? 'bg-rose-500'
                                : m.similarityPercentage >= 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(m.similarityPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-[#382115] w-10 text-right">
                          {m.similarityPercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Submission Button */}
        <div className="pt-4 border-t border-[#ece1d5] flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Proposal...</span>
              </>
            ) : (
              <>
                <span>Submit Final Proposal to Supervisor</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default ProposalSubmission;
