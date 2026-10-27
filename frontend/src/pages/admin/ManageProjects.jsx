import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import {
  FolderKanban,
  Search,
  Filter,
  Eye,
  UserCheck,
  CheckCircle2,
  Clock,
  Award,
  X,
  Loader2,
} from 'lucide-react';

const ManageProjects = () => {
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selected project for details modal
  const [selectedProject, setSelectedProject] = useState(null);

  // Reassign supervisor modal state
  const [reassignModalProject, setReassignModalProject] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [newSupervisorId, setNewSupervisorId] = useState('');
  const [reassigning, setReassigning] = useState(false);

  // 1. Fetch supervisors for reassign dropdown
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await api.get('/admin/users?role=supervisor&limit=50');
        if (res.data?.success) {
          setSupervisors(res.data.users || []);
        }
      } catch (err) {
        console.warn('Could not load supervisors:', err.message);
      }
    };
    fetchSupervisors();
  }, []);

  // 2. Fetch Projects
  const fetchProjects = useCallback(async (
    targetPage = 1,
    searchQuery = search,
    status = statusFilter,
    domain = domainFilter
  ) => {
    try {
      setLoading(true);
      const params = {
        page: targetPage,
        limit: 10,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (status) params.status = status;
      if (domain) params.domain = domain;

      const res = await api.get('/admin/projects', { params });
      if (res.data?.success) {
        let list = res.data.projects || [];

        // Client-side sorting
        list.sort((a, b) => {
          let valA = a[sortField] || '';
          let valB = b[sortField] || '';
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        setProjects(list);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        setPage(res.data.currentPage || targetPage);
      }
    } catch (err) {
      toast.error('Failed to load project workspaces.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, domainFilter, sortField, sortOrder, toast]);

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const handleSearchChange = (val) => {
    setSearch(val);
    fetchProjects(1, val, statusFilter, domainFilter);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle reassigning supervisor to project
  const handleReassignSupervisor = async (e) => {
    e.preventDefault();
    if (!reassignModalProject || !newSupervisorId) {
      toast.warning('Please pick a faculty supervisor.');
      return;
    }

    try {
      setReassigning(true);
      const res = await api.put('/admin/assign-supervisor/project', {
        projectId: reassignModalProject._id,
        supervisorId: newSupervisorId,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Supervisor reassigned successfully!');
        setReassignModalProject(null);
        setNewSupervisorId('');
        fetchProjects(page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign supervisor.');
    } finally {
      setReassigning(false);
    }
  };

  // Table Columns
  const columns = [
    {
      header: 'Project Title',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-bold text-[#382115] truncate" title={row.title}>
            {row.title}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c4e24] bg-[#faf6f0] px-2 py-0.5 rounded border border-[#ece1d5]">
            {row.domain || 'General CS'}
          </span>
        </div>
      ),
    },
    {
      header: 'Student Team',
      accessor: 'students',
      render: (row) => (
        <div className="text-xs text-[#5d4638]">
          {row.students && row.students.length > 0 ? (
            row.students.map((s, idx) => (
              <div key={s._id || idx} className="truncate">
                <span className="font-bold text-[#382115]">{s.name}</span>{' '}
                <span className="text-[11px] text-[#8c7a6b]">({s.studentId || s.email})</span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 italic">No students linked</span>
          )}
        </div>
      ),
    },
    {
      header: 'Supervisor',
      accessor: 'supervisor',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.supervisor?.name ? (
            <span className="text-xs font-semibold text-[#382115]">
              {row.supervisor.name}
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Unassigned
            </span>
          )}
          <button
            onClick={() => {
              setReassignModalProject(row);
              setNewSupervisorId(row.supervisor?._id || '');
            }}
            className="text-[11px] font-bold text-[#b5743d] hover:text-[#8c4e24] underline ml-1"
            title="Reassign supervisor"
          >
            Change
          </button>
        </div>
      ),
    },
    {
      header: 'Current Milestone',
      accessor: 'currentMilestone',
      render: (row) => (
        <span className="text-xs font-bold uppercase tracking-wider text-[#5d4638] bg-[#faf6f0] px-2.5 py-1 rounded-lg border border-[#ece1d5]">
          {(row.currentMilestone || 'srs').replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Status & Grade',
      accessor: 'status',
      render: (row) => (
        <div className="space-y-1">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              row.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {row.status}
          </span>
          {row.finalGrade && (
            <div className="text-[11px] font-black text-emerald-800">
              Grade: {row.finalGrade} ({row.finalMarks} pts)
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => setSelectedProject(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf6f0] hover:bg-[#f7efe6] border border-[#ece1d5] text-xs font-bold text-[#382115] transition"
        >
          <Eye className="w-3.5 h-3.5 text-[#b5743d]" />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <FolderKanban className="w-7 h-7 text-[#b5743d]" />
          Manage Final Year Projects
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Monitor all active and completed student projects, track current milestones, and manage supervisor allocations.
        </p>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search projects by title, domain, or candidate..."
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(p) => fetchProjects(p)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        headerActions={
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchProjects(1, search, e.target.value, domainFilter);
              }}
              className="px-3 py-2 bg-[#faf6f0] border border-[#ece1d5] rounded-xl text-xs font-semibold text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
            >
              <option value="">All Statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                fetchProjects(1, search, statusFilter, e.target.value);
              }}
              className="px-3 py-2 bg-[#faf6f0] border border-[#ece1d5] rounded-xl text-xs font-semibold text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
            >
              <option value="">All Domains</option>
              <option value="Artificial Intelligence">AI & Deep Learning</option>
              <option value="Computer Vision">Computer Vision</option>
              <option value="Web">Web & Cloud</option>
              <option value="IoT">IoT & Hardware</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
        }
      />

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#ece1d5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  Project Overview
                </span>
                <h3 className="font-extrabold text-[#382115] text-lg sm:text-xl mt-0.5">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b] mb-1">
                  Abstract & Objectives
                </h4>
                <p className="text-sm text-[#382115] leading-relaxed bg-[#faf6f0] p-4 rounded-2xl border border-[#ece1d5]">
                  {selectedProject.abstract}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-[#ece1d5]">
                  <div className="text-[10px] font-bold text-[#8c7a6b] uppercase">Supervisor</div>
                  <div className="font-bold text-[#382115] mt-0.5">
                    {selectedProject.supervisor?.name || 'Unassigned'}
                  </div>
                  <div className="text-[11px] text-[#7a6455]">{selectedProject.supervisor?.email}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#faf6f0] border border-[#ece1d5]">
                  <div className="text-[10px] font-bold text-[#8c7a6b] uppercase">Status & Milestone</div>
                  <div className="font-bold text-[#382115] mt-0.5 uppercase">
                    {selectedProject.status} • {selectedProject.currentMilestone}
                  </div>
                  {selectedProject.finalGrade && (
                    <div className="text-[11px] font-black text-emerald-700">
                      Final Evaluation: {selectedProject.finalGrade} ({selectedProject.finalMarks} pts)
                    </div>
                  )}
                </div>
              </div>

              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b] mb-1.5">
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#faf6f0] border border-[#ece1d5] text-xs font-medium text-[#7a6455]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#ece1d5] flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Supervisor Modal */}
      {reassignModalProject && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#ece1d5] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  Reallocate Supervisor
                </span>
                <h3 className="font-extrabold text-[#382115] text-base mt-0.5 truncate max-w-xs">
                  {reassignModalProject.title}
                </h3>
              </div>
              <button
                onClick={() => setReassignModalProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSupervisor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Select New Faculty Supervisor *
                </label>
                <select
                  value={newSupervisorId}
                  onChange={(e) => setNewSupervisorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  required
                >
                  <option value="">-- Choose Supervisor --</option>
                  {supervisors.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.designation || 'Faculty'} - {s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReassignModalProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning || !newSupervisorId}
                  className="px-6 py-2 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {reassigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageProjects;
