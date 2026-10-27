import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';

const ManageStudents = () => {
  const { toast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Supervisors for assignment dropdown in modal
  const [supervisors, setSupervisors] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'Computer Science',
    batch: '2023',
    phone: '',
    assignedSupervisor: '',
  });

  // Delete confirmation modal state
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch supervisors for dropdown
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const res = await api.get('/admin/users?role=supervisor&limit=50');
        if (res.data?.success) {
          setSupervisors(res.data.users || []);
        }
      } catch (err) {
        console.warn('Could not fetch supervisors:', err.message);
      }
    };
    fetchSupervisors();
  }, []);

  // 2. Fetch Students
  const fetchStudents = useCallback(async (targetPage = 1, searchQuery = search, status = statusFilter) => {
    try {
      setLoading(true);
      const params = {
        role: 'student',
        page: targetPage,
        limit: 10,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (status) params.status = status;

      const res = await api.get('/admin/users', { params });
      if (res.data?.success) {
        let list = res.data.users || [];

        // Apply client-side sorting if needed
        list.sort((a, b) => {
          let valA = a[sortField] || '';
          let valB = b[sortField] || '';
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        setStudents(list);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        setPage(res.data.currentPage || targetPage);
      }
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortField, sortOrder, toast]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const handleSearchChange = (val) => {
    setSearch(val);
    fetchStudents(1, val, statusFilter);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 3. Open Create / Edit Modal
  const openModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name || '',
        email: student.email || '',
        password: '',
        studentId: student.studentId || '',
        department: student.department || 'Computer Science',
        batch: student.batch || '2023',
        phone: student.phone || '',
        assignedSupervisor: student.assignedSupervisor?._id || student.assignedSupervisor || '',
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        studentId: '',
        department: 'Computer Science',
        batch: '2023',
        phone: '',
        assignedSupervisor: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  // 4. Submit Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }

    if (!editingStudent && (!formData.password || formData.password.length < 6)) {
      toast.error('Password must be at least 6 characters for new accounts.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: 'student',
        department: formData.department,
        studentId: formData.studentId.trim(),
        batch: formData.batch.trim(),
        phone: formData.phone.trim(),
        assignedSupervisor: formData.assignedSupervisor || null,
      };
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (editingStudent) {
        await api.put(`/admin/users/${editingStudent._id}`, payload);
        toast.success(`Student '${formData.name}' updated successfully.`);
      } else {
        await api.post('/admin/users', payload);
        toast.success(`Student '${formData.name}' registered successfully.`);
      }

      closeModal();
      fetchStudents(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student details.');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Toggle Status
  const handleToggleStatus = async (student) => {
    try {
      const res = await api.patch(`/admin/users/${student._id}/toggle-status`);
      if (res.data?.success) {
        toast.success(`Student status updated to ${res.data.isActive ? 'Active' : 'Deactivated'}.`);
        fetchStudents(page);
      }
    } catch (err) {
      toast.error('Failed to toggle status.');
    }
  };

  // 6. Delete Student
  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/users/${deletingStudent._id}`);
      toast.success(`Student '${deletingStudent.name}' deleted successfully.`);
      setDeletingStudent(null);
      fetchStudents(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  // Table Column Definitions
  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f7efe6] border border-[#e2d2c1] flex items-center justify-center text-[#8c4e24] font-bold text-sm shrink-0">
            {row.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="font-bold text-[#382115]">{row.name}</div>
            <div className="text-xs text-[#8c7a6b] font-mono">{row.studentId || 'No ID'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email & Contact',
      accessor: 'email',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-[#5d4638]">{row.email}</div>
          <div className="text-[11px] text-[#8c7a6b]">{row.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      header: 'Department / Batch',
      accessor: 'department',
      sortable: true,
      render: (row) => (
        <div className="text-xs text-[#5d4638]">
          <div>{row.department}</div>
          <div className="text-[11px] text-[#8c7a6b]">Batch: {row.batch || '2023'}</div>
        </div>
      ),
    },
    {
      header: 'Supervisor',
      accessor: 'assignedSupervisor',
      render: (row) => (
        <div>
          {row.assignedSupervisor?.name ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#faf6f0] border border-[#ece1d5] text-[#382115]">
              {row.assignedSupervisor.name}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
              Unassigned
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            row.isActive !== false
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
          }`}
          title="Click to toggle status"
        >
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openModal(row)}
            className="p-2 rounded-xl hover:bg-[#faf6f0] text-[#8c7a6b] hover:text-[#382115] transition"
            title="Edit Student"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingStudent(row)}
            className="p-2 rounded-xl hover:bg-rose-50 text-[#8c7a6b] hover:text-rose-600 transition"
            title="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
            <Users className="w-7 h-7 text-[#b5743d]" />
            Manage Students
          </h1>
          <p className="text-[#7a6455] text-sm mt-1">
            Register, update, allocate supervisors, and manage active status for all enrolled FYP candidates.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] shadow-sm transition"
        >
          <UserPlus className="w-4 h-4 text-[#C98A53]" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by student name, ID, or email..."
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(p) => fetchStudents(p)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        headerActions={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchStudents(1, search, e.target.value);
            }}
            className="px-3 py-2 bg-[#faf6f0] border border-[#ece1d5] rounded-xl text-xs font-semibold text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        }
      />

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#ece1d5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  {editingStudent ? 'Edit Account' : 'New Registration'}
                </span>
                <h3 className="font-extrabold text-[#382115] text-xl mt-0.5">
                  {editingStudent ? `Edit ${editingStudent.name}` : 'Register Student Candidate'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Ali Ahmed"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Student ID / Roll No. *
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="e.g., CS-2023-21"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    {editingStudent ? 'Password (Leave blank to keep)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingStudent ? '••••••••' : 'Min 6 characters'}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required={!editingStudent}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Computer System Engineering">Computer System Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="2023"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92-312..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Allocated Faculty Supervisor
                </label>
                <select
                  value={formData.assignedSupervisor}
                  onChange={(e) => setFormData({ ...formData, assignedSupervisor: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                >
                  <option value="">-- None / Unassigned --</option>
                  {supervisors.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.designation || 'Faculty'} - {s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-[#ece1d5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
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
                  <span>{editingStudent ? 'Save Changes' : 'Create Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#382115] text-lg">
              Delete Student Account?
            </h3>
            <p className="text-xs text-[#7a6455]">
              Are you sure you want to delete <strong>{deletingStudent.name}</strong> ({deletingStudent.email})? This action cannot be undone.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageStudents;
