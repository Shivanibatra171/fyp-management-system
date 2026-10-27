import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/DataTable';
import {
  Database,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  X,
  ShieldAlert,
  Calendar,
  Search,
} from 'lucide-react';

const PreviousFypManagement = () => {
  const { toast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('year');
  const [sortOrder, setSortOrder] = useState('desc');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    domain: 'Artificial Intelligence',
    year: '2024',
    supervisorName: '',
    studentNames: '',
    technologies: '',
    grade: 'A',
  });

  // Delete modal state
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // CSV Import Modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // 1. Fetch Previous FYP Records
  const fetchRecords = useCallback(async (
    targetPage = 1,
    searchQuery = search,
    domain = domainFilter,
    year = yearFilter
  ) => {
    try {
      setLoading(true);
      const params = {
        page: targetPage,
        limit: 10,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (domain) params.domain = domain;
      if (year) params.year = year;

      const res = await api.get('/admin/previous-fyps', { params });
      if (res.data?.success) {
        let list = res.data.records || res.data.data || [];

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

        setRecords(list);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        setPage(res.data.currentPage || targetPage);
      }
    } catch (err) {
      toast.error('Failed to load past project archives.');
    } finally {
      setLoading(false);
    }
  }, [search, domainFilter, yearFilter, sortField, sortOrder, toast]);

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  const handleSearchChange = (val) => {
    setSearch(val);
    fetchRecords(1, val, domainFilter, yearFilter);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 2. Open Add / Edit Modal
  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        title: record.title || '',
        abstract: record.abstract || '',
        domain: record.domain || 'Artificial Intelligence',
        year: String(record.year || '2024'),
        supervisorName: record.supervisorName || '',
        studentNames: Array.isArray(record.studentNames)
          ? record.studentNames.join(', ')
          : record.studentNames || '',
        technologies: Array.isArray(record.technologies)
          ? record.technologies.join(', ')
          : record.technologies || '',
        grade: record.grade || 'A',
      });
    } else {
      setEditingRecord(null);
      setFormData({
        title: '',
        abstract: '',
        domain: 'Artificial Intelligence',
        year: '2024',
        supervisorName: '',
        studentNames: '',
        technologies: '',
        grade: 'A',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  // 3. Save Record (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.abstract.trim() || !formData.supervisorName.trim()) {
      toast.error('Title, abstract, and supervisor name are required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        domain: formData.domain.trim(),
        year: parseInt(formData.year, 10),
        supervisorName: formData.supervisorName.trim(),
        studentNames: formData.studentNames
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean),
        technologies: formData.technologies
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter(Boolean),
        grade: formData.grade,
      };

      if (editingRecord) {
        await api.put(`/admin/previous-fyps/${editingRecord._id}`, payload);
        toast.success(`Archive record '${formData.title}' updated successfully.`);
      } else {
        await api.post('/admin/previous-fyps', payload);
        toast.success(`Archive record '${formData.title}' created successfully.`);
      }

      closeModal();
      fetchRecords(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save historical FYP.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Record
  const handleDelete = async () => {
    if (!deletingRecord) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/previous-fyps/${deletingRecord._id}`);
      toast.success(`Archive record '${deletingRecord.title}' deleted.`);
      setDeletingRecord(null);
      fetchRecords(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeleting(false);
    }
  };

  // 5. CSV Bulk Import
  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.warning('Please select a CSV file to upload.');
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      const form = new FormData();
      // Must be 'file' matching uploadCsv.single('file')
      form.append('file', csvFile);

      const res = await api.post('/admin/previous-fyps/import-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        toast.success(`Imported ${res.data.importedCount} projects successfully!`);
        setImportResult({
          imported: res.data.importedCount,
          skipped: res.data.skippedCount,
          total: res.data.totalProcessed,
        });
        setCsvFile(null);
        fetchRecords(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV bulk import failed.');
    } finally {
      setImporting(false);
    }
  };

  // Columns definition
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
      header: 'Year',
      accessor: 'year',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono font-bold text-[#382115] flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#8c7a6b]" />
          {row.year}
        </span>
      ),
    },
    {
      header: 'Supervisor',
      accessor: 'supervisorName',
      sortable: true,
      render: (row) => (
        <div className="text-xs font-semibold text-[#5d4638]">
          {row.supervisorName}
        </div>
      ),
    },
    {
      header: 'Authors / Students',
      accessor: 'studentNames',
      render: (row) => (
        <div className="text-xs text-[#7a6455] max-w-xs truncate">
          {Array.isArray(row.studentNames) ? row.studentNames.join(', ') : row.studentNames || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-[#faf6f0] border border-[#ece1d5] text-[#8c4e24]">
          {row.grade || 'A'}
        </span>
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
            title="Edit Past Project"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingRecord(row)}
            className="p-2 rounded-xl hover:bg-rose-50 text-[#8c7a6b] hover:text-rose-600 transition"
            title="Delete Past Project"
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
            <Database className="w-7 h-7 text-[#b5743d]" />
            Previous FYP Archives & Corpus
          </h1>
          <p className="text-[#7a6455] text-sm mt-1">
            Manage the historical project repository utilized by the AI Semantic Similarity microservice to detect duplications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsCsvModalOpen(true);
              setImportResult(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#ece1d5] hover:bg-[#faf6f0] text-[#382115] font-bold text-xs uppercase tracking-wider transition shadow-xs"
          >
            <Upload className="w-4 h-4 text-[#b5743d]" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-[#C98A53]" />
            <span>Add Past FYP</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search archives by title, abstract, or supervisor..."
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(p) => fetchRecords(p)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        headerActions={
          <div className="flex gap-2">
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                fetchRecords(1, search, domainFilter, e.target.value);
              }}
              className="px-3 py-2 bg-[#faf6f0] border border-[#ece1d5] rounded-xl text-xs font-semibold text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
            >
              <option value="">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>

            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                fetchRecords(1, search, e.target.value, yearFilter);
              }}
              className="px-3 py-2 bg-[#faf6f0] border border-[#ece1d5] rounded-xl text-xs font-semibold text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
            >
              <option value="">All Domains</option>
              <option value="Artificial Intelligence">AI & Deep Learning</option>
              <option value="Computer Vision">Computer Vision</option>
              <option value="Web">Web & Cloud</option>
              <option value="IoT">IoT & Hardware</option>
            </select>
          </div>
        }
      />

      {/* Add / Edit Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#ece1d5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  {editingRecord ? 'Edit Archive Record' : 'New Archive Entry'}
                </span>
                <h3 className="font-extrabold text-[#382115] text-xl mt-0.5">
                  {editingRecord ? `Edit Past Project` : 'Add Previous FYP to Corpus'}
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
              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Automated Skin Cancer Classification using Deep Learning"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Abstract / Summary (Used for AI Vector Embeddings) *
                </label>
                <textarea
                  rows="4"
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Comprehensive technical abstract explaining methodology and results..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="Artificial Intelligence"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Final Grade
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="A"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Supervisor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    placeholder="Dr. Khursheed Ahmed"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                    Student Authors (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.studentNames}
                    onChange={(e) => setFormData({ ...formData, studentNames: e.target.value })}
                    placeholder="Ali Khan, Bilal Ahmed"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c7a6b] uppercase tracking-wider mb-1.5">
                  Technologies (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="Python, PyTorch, React, OpenCV"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece1d5] bg-[#faf6f0] text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]"
                />
              </div>

              <div className="pt-3 border-t border-[#ece1d5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingRecord ? 'Save Changes' : 'Add to Corpus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#ece1d5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                  Bulk Batch Import
                </span>
                <h3 className="font-extrabold text-[#382115] text-xl mt-0.5">
                  Import Past FYPs from CSV
                </h3>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCsvImport} className="space-y-4">
              <div className="border-2 border-dashed border-[#ece1d5] rounded-2xl p-6 text-center bg-[#faf6f0] hover:bg-[#f7efe6] transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  required
                />
                <div className="space-y-2 pointer-events-none">
                  <FileSpreadsheet className="w-10 h-10 text-[#b5743d] mx-auto" />
                  {csvFile ? (
                    <div>
                      <div className="font-bold text-sm text-[#382115]">{csvFile.name}</div>
                      <div className="text-xs text-[#8c7a6b]">
                        {(csvFile.size / 1024).toFixed(1)} KB • Ready to parse
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-sm text-[#382115]">
                        Click or drag a CSV file here
                      </div>
                      <div className="text-xs text-[#8c7a6b] mt-0.5">
                        Headers: Title, Abstract, Year, Domain, Supervisor, Technologies
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {importResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    CSV Import Complete!
                  </div>
                  <div>Successfully inserted: <strong>{importResult.imported}</strong> projects</div>
                  {importResult.skipped > 0 && (
                    <div className="text-amber-800">Skipped/Malformed: {importResult.skipped}</div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !csvFile}
                  className="px-6 py-2 rounded-xl bg-[#382115] text-[#f7efe6] font-bold text-xs uppercase tracking-wider hover:bg-[#2b1810] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{importing ? 'Parsing CSV...' : 'Start Import'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-[#382115] text-lg">
              Delete Archive Record?
            </h3>
            <p className="text-xs text-[#7a6455]">
              Are you sure you want to remove <strong>"{deletingRecord.title}"</strong> from the past FYP corpus?
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setDeletingRecord(null)}
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

export default PreviousFypManagement;
