import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Loader2,
  Inbox,
} from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  sortField,
  sortOrder = 'asc',
  onSort,
  headerActions,
  emptyMessage = 'No records found matching your criteria.',
}) => {
  return (
    <div className="bg-white border border-[#ece1d5] rounded-3xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      {(onSearchChange || headerActions) && (
        <div className="p-5 border-b border-[#ece1d5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-[#faf6f0] border border-[#ece1d5] focus:border-[#b5743d] rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-[#382115] placeholder-[#8c7a6b] focus:outline-none focus:ring-2 focus:ring-[#b5743d]/20 transition"
              />
            </div>
          )}

          {headerActions && (
            <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Main Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ece1d5] bg-[#faf6f0]/70 text-[11px] font-bold text-[#8c7a6b] uppercase tracking-wider">
              {columns.map((col, idx) => {
                const isSortable = col.sortable && onSort;
                const isSorted = sortField === col.accessor;

                return (
                  <th
                    key={col.accessor || idx}
                    className={`py-3.5 px-4 ${col.className || ''} ${
                      isSortable ? 'cursor-pointer select-none hover:text-[#382115]' : ''
                    }`}
                    onClick={() => isSortable && onSort(col.accessor)}
                  >
                    <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-[#8c7a6b]">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#b5743d]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#b5743d]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece1d5] text-sm text-[#382115]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-[#8c7a6b]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#b5743d] mx-auto mb-2" />
                  <span className="text-xs font-semibold">Loading data...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-[#8c7a6b]">
                  <Inbox className="w-10 h-10 text-[#8c7a6b]/40 mx-auto mb-2" />
                  <span className="text-xs font-medium">{emptyMessage}</span>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx} className="hover:bg-[#faf6f0]/60 transition">
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.accessor || colIdx}
                      className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : ''} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[#ece1d5] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8c7a6b]">
          <div>
            Showing <strong className="text-[#382115]">{data.length}</strong> of{' '}
            <strong className="text-[#382115]">{totalCount}</strong> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-[#ece1d5] bg-[#faf6f0] hover:bg-[#f7efe6] text-[#382115] disabled:opacity-40 transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-[#382115]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-[#ece1d5] bg-[#faf6f0] hover:bg-[#f7efe6] text-[#382115] disabled:opacity-40 transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
