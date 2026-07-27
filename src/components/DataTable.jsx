import { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Columns,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { EmptyState } from "./EmptyState.jsx";

export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = "Search records...",
  title,
  bulkActions = [],
  onRowClick,
  keyField = "id",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {})
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState({});

  // 1. Filter by Search & Custom Column Filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Global Search
      if (searchTerm) {
        const matchesGlobal = columns.some((col) => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!matchesGlobal) return false;
      }

      // Column Filters
      for (const [colKey, filterVal] of Object.entries(activeFilters)) {
        if (filterVal && row[colKey] !== filterVal) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters, columns]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 3. Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Sorting Handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return { key: null, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Select All Handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentIds = new Set(paginatedData.map((row) => row[keyField]));
      setSelectedRowIds(currentIds);
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const activeCols = columns.filter((col) => visibleColumns[col.key]);
    const headers = activeCols.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");
    const rows = sortedData.map((row) =>
      activeCols
        .map((col) => {
          const val = row[col.key];
          return `"${val != null ? String(val).replace(/"/g, '""') : ""}"`;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(title || "export").toLowerCase().replace(/\s+/g, "_")}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card-panel" style={{ width: "100%", overflow: "hidden" }}>
      {/* Top Action Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--card-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
          {title && <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>}
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            />
            <input
              type="text"
              className="input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: 34, height: 36 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Column Selector */}
          <div style={{ position: "relative" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowColumnPicker((prev) => !prev)}
            >
              <Columns size={14} />
              Columns
            </button>

            {showColumnPicker && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 6,
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--card-shadow-hover)",
                  padding: 12,
                  zIndex: 50,
                  width: 180,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>TOGGLE COLUMNS</div>
                {columns.map((col) => (
                  <label
                    key={col.key}
                    style={{
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!visibleColumns[col.key]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))
                      }
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* CSV Export */}
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedRowIds.size > 0 && (
        <div
          style={{
            padding: "10px 20px",
            background: "var(--status-info-bg)",
            borderBottom: "1px solid var(--status-info-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--status-info-text)" }}>
            {selectedRowIds.size} row{selectedRowIds.size > 1 ? "s" : ""} selected
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                className="btn btn-sm btn-secondary"
                onClick={() => action.onClick(Array.from(selectedRowIds))}
              >
                {action.label}
              </button>
            ))}
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedRowIds(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div style={{ overflowX: "auto" }}>
        {paginatedData.length === 0 ? (
          <EmptyState
            title="No records found"
            description="No items match your current search or filter criteria."
          />
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 13.5,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--bg)",
                  borderBottom: "1px solid var(--card-border)",
                  color: "var(--muted)",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                <th style={{ padding: "12px 16px", width: 40 }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row) => selectedRowIds.has(row[keyField]))
                    }
                  />
                </th>

                {columns
                  .filter((col) => visibleColumns[col.key])
                  .map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "12px 16px",
                        cursor: col.sortable !== false ? "pointer" : "default",
                        userSelect: "none",
                      }}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <span style={{ opacity: sortConfig.key === col.key ? 1 : 0.4 }}>
                            {sortConfig.key === col.key ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp size={13} />
                              ) : (
                                <ArrowDown size={13} />
                              )
                            ) : (
                              <ArrowUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rIdx) => {
                const isSelected = selectedRowIds.has(row[keyField]);
                return (
                  <tr
                    key={row[keyField] || rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      borderBottom: "1px solid var(--card-border)",
                      background: isSelected ? "var(--status-info-bg)" : "transparent",
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(row[keyField], e)}
                      />
                    </td>
                    {columns
                      .filter((col) => visibleColumns[col.key])
                      .map((col) => (
                        <td key={col.key} style={{ padding: "14px 16px", color: "var(--ink)" }}>
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--card-border)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="input"
            style={{ width: 80, padding: "4px 8px", height: "auto" }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            <ChevronLeft size={14} />
            Previous
          </button>
          <span style={{ fontWeight: 600, color: "var(--ink)", padding: "0 6px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
