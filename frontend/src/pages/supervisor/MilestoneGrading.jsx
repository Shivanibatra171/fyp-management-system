import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderKanban,
  FileText,
  User,
  History,
} from 'lucide-react';

const MilestoneGrading = () => {
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [milestoneKey, setMilestoneKey] = useState('proposal_defense');
  const [marksAwarded, setMarksAwarded] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Existing marks for selected project
  const [projectMarks, setProjectMarks] = useState([]);
  const [loadingMarks, setLoadingMarks] = useState(false);

  // 1. Fetch supervised projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get('/supervisor/projects');
        if (res.data?.success && res.data.projects?.length > 0) {
          setProjects(res.data.projects);
          setSelectedProjectId(res.data.projects[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load supervised projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 2. Fetch marks whenever selected project changes
  const fetchMarksForProject = async (projId) => {
    if (!projId) return;
    try {
      setLoadingMarks(true);
      const res = await api.get(`/supervisor/projects/${projId}/marks`);
      if (res.data?.success) {
        setProjectMarks(res.data.marks || []);
      }
    } catch (err) {
      console.warn('Could not load marks history:', err.message);
    } finally {
      setLoadingMarks(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchMarksForProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleGradingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || marksAwarded === '') {
      toast.error('Please select a project and enter marks awarded.');
      return;
    }

    const marksNum = parseFloat(marksAwarded);
    const maxNum = parseFloat(maxMarks);

    if (isNaN(marksNum) || marksNum < 0 || marksNum > maxNum) {
      toast.error(`Marks must be a positive number between 0 and ${maxNum}.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/supervisor/marks', {
        projectId: selectedProjectId,
        milestoneKey,
        marksAwarded: marksNum,
        maxMarks: maxNum,
        remarks: remarks.trim(),
      });

      if (res.data?.success) {
        const finalGrade = res.data.projectStatus?.finalGrade;
        toast.success(
          finalGrade
            ? `Marks awarded! Final project grade evaluated: ${finalGrade}`
            : `Marks for ${milestoneKey.replace('_', ' ')} saved successfully!`
        );
        setMarksAwarded('');
        setRemarks('');
        fetchMarksForProject(selectedProjectId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit milestone marks.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <Award className="w-7 h-7 text-[#b5743d]" />
          Milestone Evaluation & Grading
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Evaluate project milestones, score defenses, record formal remarks, and automatically compute official letter grades.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b5743d]" />
          <p className="text-xs font-semibold text-[#8c7a6b]">Loading active projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-3">
          <FolderKanban className="w-12 h-12 text-[#8c7a6b]/50 mx-auto" />
          <h3 className="font-extrabold text-[#382115] text-lg">No Active Projects to Grade</h3>
          <p className="text-xs text-[#7a6455] max-w-sm mx-auto">
            Once student proposals are approved, active project workspaces will appear here for milestone grading.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Award Marks */}
          <div className="lg:col-span-7 bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#382115] border-b border-[#ece1d5] pb-3">
              Score Submission Form
            </h2>

            <form onSubmit={handleGradingSubmit} className="space-y-5">
              
              {/* Select Project */}
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
                  Select Project & Student Team *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition font-medium"
                >
                  {projects.map((proj) => {
                    const studentNames = (proj.students || []).map((s) => s.name).join(', ');
                    return (
                      <option key={proj._id} value={proj._id}>
                        {proj.title} ({studentNames || 'Student'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Milestone Selection */}
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
                  Milestone Category *
                </label>
                <select
                  value={milestoneKey}
                  onChange={(e) => setMilestoneKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition font-medium"
                >
                  <option value="proposal_defense">Proposal Defense (Initial Phase)</option>
                  <option value="srs">Software Requirements Specification (SRS)</option>
                  <option value="mid_evaluation">Mid-Term Evaluation (50% Milestone)</option>
                  <option value="final_defense">Final Project Defense (80% Milestone)</option>
                  <option value="final_thesis">Final Thesis & Documentation Submission</option>
                </select>
              </div>

              {/* Marks Awarded & Max Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
                    Marks Awarded *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxMarks}
                    step="0.5"
                    value={marksAwarded}
                    onChange={(e) => setMarksAwarded(e.target.value)}
                    placeholder="e.g., 88"
                    className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
                    Total / Max Marks
                  </label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition font-medium"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-2">
                  Evaluation Feedback & Remarks
                </label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g., Strong technical implementation of deep learning pipeline; excellent defense presentation."
                  className="w-full px-4 py-3 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d] transition"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Evaluation...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-[#C98A53]" />
                      <span>Publish Milestone Marks</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Card: Project Status & Evaluation History */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Project Quick Overview Card */}
            {selectedProject && (
              <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  Selected Candidate
                </div>
                <h3 className="font-extrabold text-[#382115] text-base">
                  {selectedProject.title}
                </h3>
                <div className="text-xs text-[#5d4638] space-y-1">
                  <div><strong>Domain:</strong> {selectedProject.domain}</div>
                  <div><strong>Status:</strong> <span className="uppercase text-[#8c4e24] font-bold">{selectedProject.status}</span></div>
                  <div><strong>Milestone:</strong> <span className="uppercase">{selectedProject.currentMilestone}</span></div>
                  {selectedProject.finalGrade && (
                    <div className="text-sm font-black text-emerald-800 pt-1">
                      Final Grade: {selectedProject.finalGrade} ({selectedProject.finalMarks} pts)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Published Marks History for this Project */}
            <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-[#382115] text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-[#b5743d]" />
                <span>Recorded Marks for this Project</span>
              </h3>

              {loadingMarks ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#b5743d]" />
                </div>
              ) : projectMarks.length > 0 ? (
                <div className="divide-y divide-[#ece1d5]">
                  {projectMarks.map((m) => (
                    <div key={m._id} className="py-3 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-[#382115] capitalize">
                          {m.milestoneKey.replace('_', ' ')}
                        </div>
                        {m.remarks && (
                          <div className="text-[11px] text-[#7a6455] italic mt-0.5">
                            "{m.remarks}"
                          </div>
                        )}
                        <div className="text-[10px] text-[#8c7a6b] mt-0.5">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-sm text-[#8c4e24]">
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
                <div className="text-center py-6 text-xs text-[#8c7a6b] bg-[#faf6f0] rounded-2xl border border-dashed border-[#ece1d5]">
                  No milestones graded yet for this project.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MilestoneGrading;
