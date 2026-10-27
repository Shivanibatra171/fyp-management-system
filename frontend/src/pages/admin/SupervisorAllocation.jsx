import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Users,
  FolderKanban,
  FileText,
  Search,
} from 'lucide-react';

const SupervisorAllocation = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'proposals'
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);

  // Students list
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedSupervisorForStudent, setSelectedSupervisorForStudent] = useState({});

  // Proposals list
  const [proposals, setProposals] = useState([]);
  const [proposalSearch, setProposalSearch] = useState('');
  const [selectedSupervisorForProposal, setSelectedSupervisorForProposal] = useState({});

  const [assigningId, setAssigningId] = useState(null);

  // 1. Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const res = await api.get('/admin/users?role=supervisor&limit=50');
      if (res.data?.success) {
        setSupervisors(res.data.users || []);
      }
    } catch (err) {
      console.warn('Failed to load supervisors:', err.message);
    }
  };

  // 2. Fetch Students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users?role=student&limit=50');
      if (res.data?.success) {
        setStudents(res.data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Proposals
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/proposals?limit=50');
      if (res.data?.success) {
        setProposals(res.data.proposals || []);
      }
    } catch (err) {
      toast.error('Failed to load proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
    fetchStudents();
    fetchProposals();
  }, []);

  // Assign Supervisor to Student
  const handleAssignStudent = async (studentId) => {
    const supervisorId = selectedSupervisorForStudent[studentId];
    if (!supervisorId) {
      toast.warning('Please select a supervisor from the dropdown.');
      return;
    }

    try {
      setAssigningId(studentId);
      // Correct endpoint: PUT /api/admin/assign-supervisor/student
      const res = await api.put('/admin/assign-supervisor/student', {
        studentId,
        supervisorId,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Supervisor assigned successfully!');
        fetchStudents();
        fetchProposals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign supervisor.');
    } finally {
      setAssigningId(null);
    }
  };

  // Assign Supervisor to Proposal
  const handleAssignProposal = async (proposalId) => {
    const supervisorId = selectedSupervisorForProposal[proposalId];
    if (!supervisorId) {
      toast.warning('Please select a supervisor from the dropdown.');
      return;
    }

    try {
      setAssigningId(proposalId);
      // Correct endpoint: PUT /api/admin/assign-supervisor/proposal
      const res = await api.put('/admin/assign-supervisor/proposal', {
        proposalId,
        supervisorId,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Supervisor assigned to proposal!');
        fetchProposals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign supervisor.');
    } finally {
      setAssigningId(null);
    }
  };

  // Filtered lists
  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q)
    );
  });

  const filteredProposals = proposals.filter((p) => {
    if (!proposalSearch.trim()) return true;
    const q = proposalSearch.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.submittedBy?.name?.toLowerCase().includes(q) ||
      p.domain?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <UserCheck className="w-7 h-7 text-[#b5743d]" />
          Supervisor Allocation Engine
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Pair enrolled candidates and FYP project proposals with faculty supervisors to balance workloads.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ece1d5] gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === 'students'
              ? 'text-[#382115] border-b-2 border-[#b5743d]'
              : 'text-[#8c7a6b] hover:text-[#382115]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Allocate by Student ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === 'proposals'
              ? 'text-[#382115] border-b-2 border-[#b5743d]'
              : 'text-[#8c7a6b] hover:text-[#382115]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Allocate by Proposal ({proposals.length})</span>
        </button>
      </div>

      {/* Tab 1: Allocate by Student */}
      {activeTab === 'students' && (
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name, ID, or email..."
                className="w-full bg-[#faf6f0] border border-[#ece1d5] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-[#382115] placeholder-[#8c7a6b] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
              />
            </div>
            <div className="text-xs text-[#8c7a6b]">
              Showing <strong>{filteredStudents.length}</strong> students
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#ece1d5] text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider bg-[#faf6f0]/60">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Department / Batch</th>
                  <th className="py-3 px-3">Currently Assigned</th>
                  <th className="py-3 px-3">Select New Supervisor</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece1d5]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-[#8c7a6b]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#b5743d] mx-auto mb-2" />
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((stu) => {
                    const currentSup = stu.assignedSupervisor?.name;
                    const selectedSup = selectedSupervisorForStudent[stu._id] || '';

                    return (
                      <tr key={stu._id} className="hover:bg-[#faf6f0] transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-[#382115]">{stu.name}</div>
                          <div className="text-xs text-[#8c7a6b]">{stu.studentId} • {stu.email}</div>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-[#5d4638]">
                          {stu.department} ({stu.batch || '2023'})
                        </td>
                        <td className="py-3.5 px-3">
                          {currentSup ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {currentSup}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              Unallocated
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={selectedSup}
                            onChange={(e) =>
                              setSelectedSupervisorForStudent({
                                ...selectedSupervisorForStudent,
                                [stu._id]: e.target.value,
                              })
                            }
                            className="w-full max-w-xs px-3 py-1.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-xs text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                          >
                            <option value="">-- Choose Faculty Supervisor --</option>
                            {supervisors.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} ({s.designation || 'Faculty'})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleAssignStudent(stu._id)}
                            disabled={assigningId === stu._id || !selectedSup}
                            className="px-4 py-1.5 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider transition disabled:opacity-40"
                          >
                            {assigningId === stu._id ? 'Assigning...' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs text-[#8c7a6b]">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Allocate by Proposal */}
      {activeTab === 'proposals' && (
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={proposalSearch}
                onChange={(e) => setProposalSearch(e.target.value)}
                placeholder="Search proposals by title, student, or domain..."
                className="w-full bg-[#faf6f0] border border-[#ece1d5] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-[#382115] placeholder-[#8c7a6b] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
              />
            </div>
            <div className="text-xs text-[#8c7a6b]">
              Showing <strong>{filteredProposals.length}</strong> proposals
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#ece1d5] text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider bg-[#faf6f0]/60">
                  <th className="py-3 px-3">Proposal Title</th>
                  <th className="py-3 px-3">Candidate / Team</th>
                  <th className="py-3 px-3">Domain</th>
                  <th className="py-3 px-3">Current Supervisor</th>
                  <th className="py-3 px-3">Reallocate Supervisor</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece1d5]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-[#8c7a6b]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#b5743d] mx-auto mb-2" />
                      Loading proposals...
                    </td>
                  </tr>
                ) : filteredProposals.length > 0 ? (
                  filteredProposals.map((prop) => {
                    const currentSup = prop.supervisor?.name;
                    const selectedSup = selectedSupervisorForProposal[prop._id] || '';

                    return (
                      <tr key={prop._id} className="hover:bg-[#faf6f0] transition">
                        <td className="py-3.5 px-3 max-w-xs truncate font-bold text-[#382115]">
                          {prop.title}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-[#5d4638]">
                          {prop.submittedBy?.name || 'Student'}
                        </td>
                        <td className="py-3.5 px-3 text-xs text-[#7a6455]">
                          {prop.domain}
                        </td>
                        <td className="py-3.5 px-3">
                          {currentSup ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {currentSup}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={selectedSup}
                            onChange={(e) =>
                              setSelectedSupervisorForProposal({
                                ...selectedSupervisorForProposal,
                                [prop._id]: e.target.value,
                              })
                            }
                            className="w-full max-w-xs px-3 py-1.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-xs text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                          >
                            <option value="">-- Choose Faculty Supervisor --</option>
                            {supervisors.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} ({s.designation || 'Faculty'})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleAssignProposal(prop._id)}
                            disabled={assigningId === prop._id || !selectedSup}
                            className="px-4 py-1.5 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider transition disabled:opacity-40"
                          >
                            {assigningId === prop._id ? 'Assigning...' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-[#8c7a6b]">
                      No proposals found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupervisorAllocation;
