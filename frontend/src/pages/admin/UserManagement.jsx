import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  UserCog,
  Users,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science',
    studentId: '',
    employeeId: '',
    designation: '',
    phone: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      if (res.data?.success) {
        setMessage(`Status updated to ${res.data.user.isActive ? 'Active' : 'Inactive'}`);
        fetchUsers();
      }
    } catch (err) {
      setMessage('Failed to toggle status.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data?.success) {
        setMessage(`User ${userName} deleted successfully.`);
        fetchUsers();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', newUser);
      if (res.data?.success) {
        setMessage('User created successfully!');
        setModalOpen(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'student',
          department: 'Computer Science',
          studentId: '',
          employeeId: '',
          designation: '',
          phone: '',
        });
        fetchUsers();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Creation failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-sky-400" />
            User Account Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage student and supervisor university accounts and authorization.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200">
          {message}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              roleFilter === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              roleFilter === 'student' ? 'bg-sky-500 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('supervisor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              roleFilter === 'supervisor' ? 'bg-sky-500 text-white' : 'bg-slate-950 text-slate-400'
            }`}
          >
            Supervisors
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name or email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Name / Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : u.role === 'supervisor'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.department}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {u.studentId || u.employeeId || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                          u.isActive
                            ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                        }`}
                      >
                        {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">No users found.</div>
        )}
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="student">Student</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
