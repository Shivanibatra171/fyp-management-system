import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Database,
  Calendar,
  User,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
  X,
  Code,
} from 'lucide-react';

const PreviousFypsSearch = () => {
  const { toast } = useToast();

  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [domain, setDomain] = useState('');
  const [technology, setTechnology] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async (targetPage = 1) => {
    try {
      setLoading(true);
      const params = { page: targetPage, limit: 9 };
      if (query.trim()) params.search = query.trim();
      if (year) params.year = year;
      if (domain) params.domain = domain;
      if (technology.trim()) params.technology = technology.trim();

      const res = await api.get('/student/previous-fyps', { params });
      if (res.data?.success) {
        setProjects(res.data.records || res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        setPage(res.data.currentPage || targetPage);
      }
    } catch (err) {
      toast.error('Failed to load past project archives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(1);
  }, [year, domain]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const handleResetFilters = () => {
    setQuery('');
    setYear('');
    setDomain('');
    setTechnology('');
    setTimeout(() => fetchProjects(1), 50);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382115] flex items-center gap-3">
          <Database className="w-7 h-7 text-[#b5743d]" />
          Previous FYP Archives
        </h1>
        <p className="text-[#7a6455] text-sm mt-1">
          Explore past university projects across all academic years to discover prior work, reference literature, and ensure topic originality.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title or abstract keywords..."
              className="w-full bg-[#faf6f0] border border-[#ece1d5] focus:border-[#b5743d] rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-[#382115] placeholder-[#8c7a6b] focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-[#faf6f0] border border-[#ece1d5] focus:border-[#b5743d] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
            >
              <option value="">All Domains</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Computer Vision">Computer Vision</option>
              <option value="Cybersecurity">Cybersecurity & Networks</option>
              <option value="Web & Cloud">Web & Cloud Computing</option>
              <option value="IoT">IoT & Embedded Systems</option>
              <option value="Bioinformatics">Bioinformatics</option>
              <option value="Blockchain">Blockchain & FinTech</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-[#faf6f0] border border-[#ece1d5] focus:border-[#b5743d] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#382115] focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
            >
              <option value="">All Graduation Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          {/* Technology filter & Submit button */}
          <div className="flex gap-2">
            <input
              type="text"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              placeholder="e.g. PyTorch, React"
              className="w-full bg-[#faf6f0] border border-[#ece1d5] focus:border-[#b5743d] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#382115] placeholder-[#8c7a6b] focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#382115] hover:bg-[#2b1810] text-[#f7efe6] font-bold text-xs uppercase tracking-wider transition shrink-0 shadow-sm"
            >
              Search
            </button>
          </div>

        </form>

        <div className="flex items-center justify-between text-xs text-[#8c7a6b] pt-1 border-t border-[#ece1d5]">
          <div>
            Showing <strong className="text-[#382115]">{projects.length}</strong> of{' '}
            <strong className="text-[#382115]">{totalCount}</strong> archived FYP projects
          </div>
          {(query || year || domain || technology) && (
            <button
              onClick={handleResetFilters}
              className="text-[#b5743d] hover:text-[#8c4e24] font-semibold underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b5743d]" />
          <p className="text-xs font-semibold text-[#8c7a6b]">Searching archives...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-[#ece1d5] rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <Database className="w-10 h-10 mx-auto text-[#8c7a6b]/50" />
          <h3 className="font-extrabold text-[#382115] text-lg">No Matching Projects Found</h3>
          <p className="text-xs text-[#7a6455] max-w-sm mx-auto">
            Try adjusting your search terms, changing the domain filter, or searching for other technology stacks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white border border-[#ece1d5] rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#faf6f0] text-[#8c4e24] border border-[#ece1d5]">
                    {proj.domain || 'Computer Science'}
                  </span>
                  <span className="text-xs font-black text-[#8c7a6b] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {proj.year || '2024'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#382115] leading-snug group-hover:text-[#b5743d] transition line-clamp-2">
                  {proj.title}
                </h3>

                <p className="text-xs text-[#5d4638] leading-relaxed line-clamp-3">
                  {proj.abstract}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#ece1d5]">
                {/* Tech Tags */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#faf6f0] text-[10px] font-semibold text-[#7a6455]"
                      >
                        {t}
                      </span>
                    ))}
                    {proj.technologies.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] text-[#8c7a6b]">
                        +{proj.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[#7a6455] truncate max-w-[150px]">
                    <span className="text-[10px] text-[#8c7a6b] block">Supervisor</span>
                    <strong>{proj.supervisorName || 'Faculty Supervisor'}</strong>
                  </div>

                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#faf6f0] hover:bg-[#f7efe6] border border-[#ece1d5] text-[#382115] font-bold text-xs transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#b5743d]" />
                    <span>View Abstract</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => fetchProjects(page - 1)}
            disabled={page <= 1}
            className="p-2.5 rounded-xl bg-white border border-[#ece1d5] text-[#382115] hover:bg-[#faf6f0] disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#382115]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchProjects(page + 1)}
            disabled={page >= totalPages}
            className="p-2.5 rounded-xl bg-white border border-[#ece1d5] text-[#382115] hover:bg-[#faf6f0] disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-[#382115]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ece1d5] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#ece1d5] pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#faf6f0] text-[#8c4e24] border border-[#ece1d5]">
                  {selectedProject.domain} • Year {selectedProject.year}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#382115] mt-2">
                  {selectedProject.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b] mb-1">
                  Project Abstract
                </h4>
                <p className="text-sm text-[#382115] leading-relaxed bg-[#faf6f0] p-4 rounded-2xl border border-[#ece1d5]">
                  {selectedProject.abstract}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#faf6f0] border border-[#ece1d5]">
                  <div className="text-[10px] font-bold text-[#8c7a6b] uppercase">Supervisor</div>
                  <div className="font-bold text-[#382115] mt-0.5">{selectedProject.supervisorName}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#faf6f0] border border-[#ece1d5]">
                  <div className="text-[10px] font-bold text-[#8c7a6b] uppercase">Students / Authors</div>
                  <div className="font-bold text-[#382115] mt-0.5">
                    {Array.isArray(selectedProject.studentNames)
                      ? selectedProject.studentNames.join(', ')
                      : selectedProject.studentNames || 'N/A'}
                  </div>
                </div>
              </div>

              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b] mb-1.5">
                    Technologies & Libraries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#f7efe6] border border-[#e2d2c1] text-xs font-semibold text-[#8c4e24]"
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

    </div>
  );
};

export default PreviousFypsSearch;
