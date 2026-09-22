import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  Eye,
  Download,
  MoreVertical,
  ArrowUpDown,
  Info,
  Check,
  AlertCircle,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import "./newTable.css";

function HeaderTooltip({ text }: { text: string }) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const show = () => {
    const rect = iconRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
    setOpen(true);
  };

  return (
    <>
      <span
        ref={iconRef}
        className="relative shrink-0 cursor-help"
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <Info className="w-3.5 h-3.5 text-[#98A2B3] hover:text-[#6687FF] transition-colors" />
      </span>
      {open &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[10050] w-80 -translate-x-1/2 -translate-y-full rounded-xl border border-[#EAECF0] bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-[#344054] shadow-xl"
            style={{ top: pos.top, left: pos.left }}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}

export interface RefundData {
  _id: string;

  schoolName: string;
  refundId: string;
  order_id: string;
  custom_id: string;
  edvironId: string;
  refundAmount: number;
  status: "Failed" | "Processed" | "Pending" | "Rejected" | "Initiated";
  orderAmount: number;
  createdAt: string; // Date string format YYYY-MM-DD
  gateway: "Razorpay" | "PayU" | "Cashfree" | "Stripe";
  account: "Primary HDFC" | "Secondary ICICI" | "Sponsor Account";
  SerialNumber: number;
}

export interface ColumnDefinition<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  render?: (item: T, index?: number, globalIndex?: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  maxWidth?: string;
  headerTooltip?: string;
}

export interface TableActionItem<T> {
  label: string;
  onClick: (item: T) => void;
  className?: string;
  variant?: "default" | "danger" | "info";
  hasSeparator?: boolean;
}

export interface ActionColumn<T> {
  header?: React.ReactNode;
  width?: string;
  headerClassName?: string;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  copyItemKeys?: string[]; // Keys of the item to be copied to clipboard
  isLoading?: boolean;
  virtualized?: boolean;
  isRowPerPage?: React.ReactNode;
  rowHeight?: number;
  viewportHeight?: number;
  onRowClick?: (item: T) => void;
  sortState?: SortState;
  onSort?: (key: string) => void;
  // Extra interactive actions
  onView?: (item: T) => void;
  onDownload?: (item: T) => void;
  onMore?: (item: T, event: React.MouseEvent) => void;
  actionItems?: TableActionItem<T>[] | ((item: T) => TableActionItem<T>[]);
  serialNumber?: boolean; // Whether to show serial number column
  // Dynamic header options
  heading?: string;
  exportBtn?: boolean;
  pagination?: boolean;
  rowsPerPage?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  actionColumn?: ActionColumn<T>;
  stickyActionColumn?: boolean;
}

export interface RowsPerPageProps {
  /**
   * The current selected limit or number of rows per page
   */
  currentLimit: number;
  /**
   * Callback fired when a new limit is selected
   */
  setLimit: (limit: number) => void;
  /**
   * Optional custom options for the dropdown list
   * @default [5, 10, 20, 50, 100]
   */
  options?: number[];
  /**
   * Optional label shown before the dropdown
   * @default 'Rows per page'
   */
  label?: string;
  /**
   * Optional unique ID for DOM target reference
   */
  id?: string;
  /**
   * Optional placement for the dropdown menu ('top' or 'bottom')
   * @default 'top'
   */
  dropdownPlacement?: "top" | "bottom";
  /**
   * Additional tailwind classes to apply to the container wrapper
   */
  className?: string;
}

export function RowsPerPage({
  currentLimit,
  setLimit,
  options = [10, 20, 50, 100],
  label = "Rows per page",
  id = "rows-per-page",
  dropdownPlacement = "top",
  className = "",
}: RowsPerPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (num: number) => {
    setLimit(num);
    setIsOpen(false);
  };

  const dropdownPositionClass =
    dropdownPlacement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5";

  return (
    <div
      ref={containerRef}
      className={`flex items-center z-50 gap-2 relative select-none ${className}`}
      id={`${id}-container`}
    >
      {label && (
        <span
          className="text-sm font-semibold text-[#475467]"
          id={`${id}-label`}
        >
          {label}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-1.5 rounded-lg text-sm font-bold text-[#101828] shadow-sm transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6]"
          id={`${id}-trigger`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{currentLimit}</span>
          <ChevronDown
            className={`w-4 h-4 text-[#475467] transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul
            className={`absolute right-0 w-24 bg-white border border-[#EAECF0] rounded-xl shadow-xl py-1 z-50 ${dropdownPositionClass}`}
            id={`${id}-menu`}
            role="listbox"
          >
            {options.map((num) => (
              <li key={num} role="option" aria-selected={currentLimit === num}>
                <button
                  type="button"
                  onClick={() => handleSelect(num)}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors font-semibold flex items-center justify-between cursor-pointer ${
                    currentLimit === num
                      ? "bg-[#EEF2F6] text-[#3B82F6]"
                      : "text-[#344054] hover:bg-[#F9FAFB]"
                  }`}
                  id={`${id}-option-${num}`}
                >
                  <span>{num}</span>
                  {currentLimit === num && (
                    <Check className="w-3 h-3 text-[#3B82F6]" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function NewTable<T extends { _id: string }>({
  data,
  columns,
  isLoading = false,
  virtualized = false,
  rowHeight = 64,
  viewportHeight = 450,
  onRowClick,
  sortState,
  onSort,
  onView,
  onDownload,
  onMore,
  actionItems,
  heading,
  exportBtn = false,
  pagination = false,
  rowsPerPage = false,
  header,
  footer,
  serialNumber = false,
  copyItemKeys,
  isRowPerPage,
  emptyState,
  actionColumn,
  stickyActionColumn = false,
}: TableProps<T>) {
  const stickyActionHeaderClass = stickyActionColumn ? "nt-sticky-action" : "";
  const stickyActionCellClass = stickyActionColumn ? "nt-sticky-action" : "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [urlFilters, setUrlFilters] = useTransactionFilters();

  // Row Action Menu state
  const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);

  // Built-in Sorting State
  const [localSortState, setLocalSortState] = useState<SortState>({
    column: sortState?.column ?? null,
    direction: sortState?.direction ?? "asc",
  });

  // Keep in sync with parent prop if provided
  useEffect(() => {
    if (sortState) {
      setLocalSortState(sortState);
    }
  }, [sortState]);

  const handleSortClick = (columnKey: string) => {
    let nextDirection: SortDirection = "asc";
    if (localSortState.column === columnKey) {
      nextDirection = localSortState.direction === "asc" ? "desc" : "asc";
    }
    const nextSortState: SortState = {
      column: columnKey,
      direction: nextDirection,
    };
    setLocalSortState(nextSortState);
    if (onSort) {
      onSort(columnKey);
    }
  };

  // Perform built-in sorting based on localSortState on the rendered data
  const processedData = React.useMemo(() => {
    if (!localSortState.column) return data;

    const { column, direction } = localSortState;
    const dir = direction === "asc" ? 1 : -1;

    return [...data].sort((a: any, b: any) => {
      const valA = a[column];
      const valB = b[column];

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * dir;
      }

      const strA = valA === undefined || valA === null ? "" : String(valA);
      const strB = valB === undefined || valB === null ? "" : String(valB);

      return (
        strA.localeCompare(strB, undefined, {
          numeric: true,
          sensitivity: "base",
        }) * dir
      );
    });
  }, [data, localSortState]);

  // Inbuilt Pagination state
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);
  const [isRowsMenuOpen, setIsRowsMenuOpen] = useState(false);
  const rowsMenuRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(processedData?.length / internalRowsPerPage);

  useEffect(() => {
    setInternalCurrentPage(1);
  }, [processedData?.length]);

  useEffect(() => {
    if (internalCurrentPage > totalPages && totalPages > 0) {
      setInternalCurrentPage(totalPages);
    }
  }, [totalPages, internalCurrentPage]);

  // Column Visibility state
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() =>
    columns?.map((c) => c.key),
  );
  const [tempVisibleColumnIds, setTempVisibleColumnIds] = useState<string[]>(
    () => columns.map((c, idx) => `${c.key}_${idx}`),
  );

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    columns.map((c, idx) => `${c.key}_${idx}`),
  );
  const [tempVisibleColumnKeys, setTempVisibleColumnKeys] = useState<string[]>(
    () => columns?.map((c) => c.key),
  );
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Keep column keys synced if columns prop changes
  const previousColumnsLengthRef = useRef(columns.length);
  useEffect(() => {
    if (columns.length !== previousColumnsLengthRef.current) {
      const allIds = columns.map((c, idx) => `${c.key}_${idx}`);
      setVisibleColumnIds(allIds);
      setTempVisibleColumnIds(allIds);
      previousColumnsLengthRef.current = columns.length;
    }
  }, [columns]);

  // Handle click outside for column filter dropdown and rows menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(target)
      ) {
        setIsFilterDropdownOpen(false);
      }
      if (rowsMenuRef.current && !rowsMenuRef.current.contains(target)) {
        setIsRowsMenuOpen(false);
      }

      // Close active row actions menu if clicked outside
      const activeMenu = document.querySelector(
        '[id^="action-menu-container-"]',
      );
      if (activeMenu && !activeMenu.contains(target)) {
        setOpenMenuRowId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!isFilterDropdownOpen) {
      setTempVisibleColumnIds([...visibleColumnIds]);
    }
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const toggleColumnVisibilityTemp = (columnId: string) => {
    setTempVisibleColumnIds((prev) => {
      if (prev.includes(columnId)) {
        if (prev.length <= 1) return prev; // Keep at least one column visible
        return prev.filter((id) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };
  const selectAllColumnsTemp = () => {
    setTempVisibleColumnIds(columns?.map((c, idx) => `${c.key}_${idx}`));
  };

  const handleSaveColumns = () => {
    setVisibleColumnIds([...tempVisibleColumnIds]);
    setIsFilterDropdownOpen(false);
  };

  const handleCancelColumns = () => {
    setIsFilterDropdownOpen(false);
  };

  const activeColumns = useMemo(() => {
    return columns
      .map((col, idx) => ({
        ...col,
        originalIdx: idx,
        uniqueId: `${col.key}_${idx}`,
      }))
      .filter((item) => visibleColumnIds.includes(item.uniqueId));
  }, [columns, visibleColumnIds]);

  const handleExport = () => {
    if (processedData?.length === 0) return;

    const headers = activeColumns?.map((col) => col.header).join(",");
    const rows = processedData?.map((item) => {
      return activeColumns
        ?.map((col) => {
          const val = (item as any)[col.key];
          if (val === null || val === undefined) return "";
          const stringVal =
            typeof val === "object" ? JSON.stringify(val) : String(val);
          if (
            stringVal.includes(",") ||
            stringVal.includes('"') ||
            stringVal.includes("\n")
          ) {
            return `"${stringVal.replace(/"/g, '""')}"`;
          }
          return stringVal;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${heading ? heading.toLowerCase().replace(/\s+/g, "_") : "table"}_export_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateScrollAffordance = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 8);
  }, []);

  // Handle scroll for virtualization
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    updateScrollAffordance();
  };

  useEffect(() => {
    if (!stickyActionColumn) return;
    updateScrollAffordance();
    const el = containerRef.current;
    if (!el) return;

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateScrollAffordance();
      });
      resizeObserver.observe(el);
    }

    window.addEventListener("resize", updateScrollAffordance);
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", updateScrollAffordance);
    };
  }, [stickyActionColumn, updateScrollAffordance, processedData, isLoading]);

  // Clipboard copy handler
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Virtualization & Pagination calculations
  const isVirtualizedEnabled = virtualized && !pagination;
  const totalItems = isVirtualizedEnabled
    ? processedData?.length
    : pagination
      ? Math.min(processedData?.length, internalRowsPerPage)
      : processedData?.length;
  const buffer = 4;

  let visibleData = processedData;
  let startIndex = 0;
  let endIndex = processedData?.length - 1;
  let topSpacerHeight = 0;
  let bottomSpacerHeight = 0;

  if (pagination) {
    const pStart = (internalCurrentPage - 1) * internalRowsPerPage;
    visibleData = processedData.slice(pStart, pStart + internalRowsPerPage);
  } else if (isVirtualizedEnabled) {
    const calculatedStartIndex = Math.floor(scrollTop / rowHeight);
    const visibleCount = Math.ceil(viewportHeight / rowHeight);

    startIndex = Math.max(0, calculatedStartIndex - buffer);
    endIndex = Math.min(
      totalItems - 1,
      calculatedStartIndex + visibleCount + buffer,
    );

    visibleData = processedData.slice(startIndex, endIndex + 1);
    topSpacerHeight = startIndex * rowHeight;
    bottomSpacerHeight = Math.max(0, (totalItems - endIndex - 1) * rowHeight);
  }

  const isTableEmpty = !isLoading && (processedData?.length ?? 0) === 0;
  const hasActionColumn = Boolean(
    actionColumn || onView || onDownload || onMore || actionItems,
  );
  const showActionColumn = hasActionColumn && !isTableEmpty;
  const emptyColSpan = (activeColumns?.length ?? 0) + (serialNumber ? 1 : 0);

  const getPageNumbers = () => {
    const pagesList: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pagesList.push(i);
      }
    } else {
      // Dynamic sliding window:
      // Always include page 1
      pagesList.push(1);

      let start = internalCurrentPage - 1;
      let end = internalCurrentPage + 1;

      if (internalCurrentPage <= 4) {
        start = 2;
        end = 5;
      } else if (internalCurrentPage >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      // Add left ellipsis if there is a gap between 1 and start
      if (start > 2) {
        pagesList.push("...");
      }

      // Add range
      for (let i = start; i <= end; i++) {
        pagesList.push(i);
      }

      // Add right ellipsis if there is a gap between end and totalPages
      if (end < totalPages - 1) {
        pagesList.push("...");
      }

      // Always include the last page
      pagesList.push(totalPages);
    }

    return pagesList;
  };

  const pages = getPageNumbers();

  return (
    <div className="w-full ">
      {/* Clipboard Toast Notification */}
      <AnimatePresence>
        {copiedId && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#101828] text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium border border-[#344054]"
            id="copy-toast"
          >
            <Check className="w-4 h-4 text-[#12B76A]" />
            <span>Copied ID to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional Table Heading, Optional Export, and Column Visibility controls */}
      {(heading || exportBtn || true) && (
        <div
          className="flex flex-row sm:items-center justify-between gap-4 mb-4"
          id="table-controls-bar"
        >
          <div>
            {heading && (
              <h2
                className="text-lg font-bold text-[#101828]"
                id="table-props-heading"
              >
                {heading}
              </h2>
            )}
          </div>
          <div
            className="flex  z-50  items-center gap-3 self-end sm:self-auto"
            id="table-actions-controls"
          >
            {exportBtn && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3.5 py-2 border border-[#D0D5DD] rounded-lg text-sm font-semibold text-[#344054] bg-white hover:bg-[#F9FAFB] hover:text-[#101828] transition-colors shadow-sm cursor-pointer"
                id="inner-export-button"
              >
                <Download className="w-4 h-4 text-[#475467]" />
                <span>Export CSV</span>
              </button>
            )}

            <div
              className="relative"
              ref={filterDropdownRef}
              id="column-visibility-container"
            >
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3.5 py-2 border border-[#D0D5DD] rounded-lg text-sm font-semibold text-[#344054] bg-white hover:bg-[#F9FAFB] hover:text-[#101828] transition-colors shadow-sm cursor-pointer"
                id="column-filter-trigger"
              >
                <Filter className="w-4 h-4 text-[#475467]" />
                <span>Columns</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#475467] transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isFilterDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-[#EAECF0] rounded-xl shadow-lg z-30 p-2"
                    id="column-filter-dropdown"
                  >
                    <div className="px-3 py-1.5 border-b border-[#EAECF0] mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#344054]">
                        Show / Hide Columns
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5">
                      {/* Select All Checkbox */}
                      <label className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition-colors text-sm text-[#101828] font-semibold border-b border-[#EAECF0] mb-1.5 pb-1.5">
                        <input
                          type="checkbox"
                          checked={
                            tempVisibleColumnIds.length === columns.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempVisibleColumnIds(
                                columns.map((c, idx) => `${c.key}_${idx}`),
                              );
                            } else {
                              // Keeping at least the first column selected to avoid a completely empty layout during toggle
                              setTempVisibleColumnIds([`${columns[0].key}_0`]);
                            }
                          }}
                          className="w-4 h-4 rounded border-[#D0D5DD] text-[#3B82F6] focus:ring-[#3B82F6] transition-colors cursor-pointer"
                        />
                        <span>Select All</span>
                      </label>

                      {columns.map((col, colIdx) => {
                        const colId = `${col.key}_${colIdx}`;
                        const isVisible = tempVisibleColumnIds.includes(colId);
                        return (
                          <label
                            key={colId}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition-colors text-sm text-[#344054] font-medium"
                          >
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => toggleColumnVisibilityTemp(colId)}
                              disabled={
                                isVisible && tempVisibleColumnIds.length === 1
                              }
                              className="w-4 h-4 rounded border-[#D0D5DD] text-[#3B82F6] focus:ring-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span>{col.header}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="border-t border-[#EAECF0] mt-2 pt-2 flex items-center justify-between gap-2 px-1">
                      <button
                        onClick={handleCancelColumns}
                        className="flex-1 py-1.5 text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg transition-colors cursor-pointer text-center"
                        id="column-filter-cancel"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveColumns}
                        className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors cursor-pointer text-center"
                        id="column-filter-save"
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div>{isRowPerPage && isRowPerPage}</div>
          </div>
        </div>
      )}

      <div className="border border-[#EAECF0] rounded-xl bg-white shadow-sm">
        {header && (
          <div className="p-4 relative z-50" id="table-custom-header-wrapper">
            {header}
          </div>
        )}

        <div className="relative z-0">
          {stickyActionColumn && !isTableEmpty && (
            <div
              className={`absolute top-0 bottom-[8px] right-[88px] w-4 pointer-events-none z-20 bg-gradient-to-l from-black/[0.07] via-black/[0.02] to-transparent transition-opacity duration-200 ${
                canScrollRight ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            />
          )}
          <div
            ref={containerRef}
            onScroll={
              isVirtualizedEnabled || stickyActionColumn
                ? handleScroll
                : undefined
            }
            className="w-full overflow-x-auto overflow-y-auto"
            style={
              isVirtualizedEnabled
                ? { maxHeight: `${viewportHeight}px` }
                : { minHeight: `${viewportHeight}px` }
            }
            id="table-container"
          >
            <table
              className={`w-full text-left min-w-[900px] table-auto ${
                stickyActionColumn && showActionColumn
                  ? "nt-sticky-actions"
                  : "border-collapse"
              } ${
                stickyActionColumn && showActionColumn && canScrollRight
                  ? "nt-can-scroll-right"
                  : ""
              }`}
              id="refunds-data-table"
            >
              <thead
                className="bg-[#F9FAFB] sticky top-0 z-[1] border-b border-[#EAECF0]"
                id="table-header"
              >
                <tr key={new Date().getTime() * 1000} id="table-header-row">
                  {serialNumber && (
                    <th
                      style={{ width: "80px" }}
                      className={`py-3.5 px-6 text-xs font-semibold text-[#475467] select-none `}
                    >
                      Sr.No
                    </th>
                  )}
                  {activeColumns?.map((col) => {
                    const isSorted = localSortState.column === col.key;
                    const headerText =
                      typeof col.header === "string"
                        ? col.header
                        : String(col.header || "");
                    const shouldWrapHeader = headerText.length > 20;

                    return (
                      <th
                        key={col.uniqueId}
                        id={`header-${col.uniqueId}`}
                        className={`py-3.5 px-6 text-xs font-semibold text-[#475467] select-none ${
                          col.headerTooltip
                            ? "overflow-visible"
                            : shouldWrapHeader
                              ? "whitespace-normal break-words leading-snug"
                              : "whitespace-nowrap truncate overflow-hidden"
                        } ${col.sortable ? "cursor-pointer hover:bg-[#F2F4F7]" : ""} ${
                          col.headerClassName || ""
                        }`}
                        style={{
                          width: col.width,
                          maxWidth: col.maxWidth || col.width || "300px",
                        }}
                        onClick={() => col.sortable && handleSortClick(col.key)}
                      >
                        <div
                          className={`flex items-center gap-1.5 min-w-0 ${
                            col.headerTooltip
                              ? "overflow-visible"
                              : shouldWrapHeader
                                ? "whitespace-normal break-words leading-snug"
                                : "overflow-hidden text-ellipsis whitespace-nowrap"
                          }`}
                        >
                          <span
                            className={
                              shouldWrapHeader
                                ? "whitespace-normal break-words"
                                : "truncate"
                            }
                          >
                            {col.header}
                          </span>
                          {col.sortable && (
                            <ArrowUpDown
                              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                isSorted ? "text-[#3B82F6]" : "text-[#98A2B3]"
                              }`}
                            />
                          )}
                          {col.headerTooltip && (
                            <HeaderTooltip text={col.headerTooltip} />
                          )}
                          {/* {col.key === "status" && (
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-3.5 h-3.5 text-[#98A2B3] hover:text-[#475467] transition-colors" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-[#101828] text-white text-xxs font-normal rounded p-2 shadow-lg z-20 pointer-events-none leading-relaxed">
                            Current status of the transaction refund processing.
                          </span>
                        </span>
                      )} */}
                        </div>
                      </th>
                    );
                  })}
                  {showActionColumn && actionColumn ? (
                    <th
                      style={
                        actionColumn.width
                          ? { width: actionColumn.width }
                          : undefined
                      }
                      className={`py-3.5 !px-3 select-none bg-[#F9FAFB] ${
                        actionColumn.headerClassName ?? "text-center w-[88px]"
                      } ${stickyActionHeaderClass}`}
                      id="header-action-column"
                    >
                      <div className="flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#475467]">
                          {actionColumn.header ?? "Action"}
                        </span>
                      </div>
                    </th>
                  ) : showActionColumn ? (
                    <th
                      className={`py-3.5 !px-3 text-center w-[88px] bg-[#F9FAFB] ${stickyActionHeaderClass}`}
                      id="header-actions"
                    ></th>
                  ) : null}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EAECF0]" id="table-body">
                {/* Top Spacer for Virtualization */}
                {isVirtualizedEnabled && topSpacerHeight > 0 && (
                  <tr
                    style={{ height: `${topSpacerHeight}px` }}
                    aria-hidden="true"
                    id="virtual-spacer-top"
                  >
                    <td
                      colSpan={activeColumns?.length + 1}
                      className="p-0 border-0"
                    ></td>
                  </tr>
                )}

                {isLoading ? (
                  Array.from({ length: 6 })?.map((_, rowIndex) => (
                    <tr
                      key={`skeleton-row-${rowIndex}`}
                      style={{ height: `${rowHeight}px` }}
                      className="animate-pulse border-b border-[#EAECF0]"
                    >
                      {activeColumns?.map((col) => {
                        const isStatus = col.key === "status";
                        const isAmount =
                          col.key === "refundAmount" ||
                          col.key === "orderAmount";
                        return (
                          <td
                            key={`skeleton-cell-${rowIndex}-${col.uniqueId}`}
                            className="px-6 py-4"
                          >
                            {isStatus ? (
                              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                            ) : isAmount ? (
                              <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
                            ) : (
                              <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                            )}
                          </td>
                        );
                      })}
                      {(actionColumn ||
                        onView ||
                        onDownload ||
                        onMore ||
                        actionItems) && (
                        <td
                          className={`!px-3 py-4 text-center bg-white ${stickyActionCellClass}`}
                        >
                          <div className="flex justify-center gap-2">
                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : visibleData?.length === 0 ? (
                  <tr id="empty-state-row">
                    <td
                      colSpan={emptyColSpan}
                      className="py-16 text-center text-[#475467] bg-white"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 bg-white">
                        <AlertCircle className="w-10 h-10 text-[#98A2B3]" />
                        {emptyState || (
                          <>
                            <p className="font-semibold text-base">
                              No {heading?.toLowerCase() || "records"} found
                            </p>
                            <p className="text-sm text-[#667085] max-w-sm">
                              We couldn't find any{" "}
                              {heading?.toLowerCase() || "records"} matching
                              your filters. Try adjusting your search query or
                              filters.
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleData?.map((item, index) => {
                    const globalIndex = isVirtualizedEnabled
                      ? startIndex + index
                      : index;
                    const isNearBottom =
                      (visibleData.length > 2 &&
                        index >= visibleData.length - 2) ||
                      (visibleData.length <= 2 && index > 0);
                    const isMenuOpen = openMenuRowId === item._id;

                    return (
                      <tr
                        key={item._id}
                        id={`row-${item._id + index}`}
                        onClick={() => onRowClick && onRowClick(item)}
                        style={{ height: `${rowHeight}px` }}
                        className={`group hover:bg-[#F9FAFB] transition-colors border-b border-[#EAECF0] ${
                          onRowClick ? "cursor-pointer" : ""
                        } ${isMenuOpen ? "relative z-30" : "relative"}`}
                      >
                        {serialNumber && (
                          <td className="font-medium text-xs text-left text-[#344054] px-6 border-b border-[#EAECF0]">
                            {(Number(urlFilters.page) - 1) *
                              Number(urlFilters.limit) +
                              index +
                              1}
                          </td>
                        )}

                        {activeColumns?.map((col) => {
                          const rawValue = (item as any)[col.key];
                          const isCopyable =
                            rawValue !== undefined &&
                            rawValue !== null &&
                            rawValue !== "" &&
                            copyItemKeys?.includes(col.key);

                          let renderedContent: React.ReactNode = "-";
                          try {
                            if (col.render) {
                              renderedContent = col.render(item);
                              if (
                                renderedContent === undefined ||
                                renderedContent === null ||
                                renderedContent === ""
                              ) {
                                renderedContent = "-";
                              }
                            } else if (isCopyable) {
                              renderedContent = (
                                <div className="flex items-center gap-1.5 max-w-max">
                                  <span className="font-medium text-[#344054]">
                                    {String(rawValue)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(
                                        String(rawValue),
                                        `${item._id}-${col.uniqueId}`,
                                      );
                                    }}
                                    className="p-1 hover:bg-[#F2F4F7] rounded text-[#98A2B3] hover:text-[#475467] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Copy to clipboard"
                                    key={col.uniqueId}
                                    id={`cell-${item._id}-${col.uniqueId}`}
                                  >
                                    {copiedId ===
                                    `${item._id}-${col.uniqueId}` ? (
                                      <Check className="w-3.5 h-3.5 text-[#12B76A]" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              );
                            } else {
                              renderedContent =
                                rawValue !== undefined &&
                                rawValue !== null &&
                                rawValue !== ""
                                  ? String(rawValue)
                                  : "-";
                            }
                          } catch (err) {
                            console.warn(
                              `Error rendering column ${col.key} for item:`,
                              item,
                              err,
                            );
                            renderedContent = "-";
                          }

                          return (
                            <td
                              key={col.uniqueId}
                              className={`px-6 py-4 text-sm text-[#344054] truncate border-b border-[#EAECF0] ${col.className || ""}`}
                              id={`cell-${item._id}-${col.uniqueId}`}
                            >
                              {renderedContent}
                            </td>
                          );
                        })}

                        {/* Action column */}
                        {actionColumn ? (
                          <td
                            className={`!px-3 py-4 border-b border-[#EAECF0] bg-white ${actionColumn.className ?? "text-center"} ${stickyActionCellClass}`}
                            onClick={(e) => e.stopPropagation()}
                            id={`action-cell-${item._id}`}
                          >
                            {actionColumn.render(item, index)}
                          </td>
                        ) : onView || onDownload || onMore || actionItems ? (
                          <td
                            className={`!px-3 py-4 text-center border-b border-[#EAECF0] bg-white ${stickyActionCellClass}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {onView && (
                                <button
                                  type="button"
                                  onClick={() => onView(item)}
                                  className="nt-action-eye p-1.5 text-[#344054] hover:bg-[#F2F4F7] hover:text-[#101828] rounded-lg transition-colors"
                                  title="View Details"
                                  id={`action-view-${item._id}`}
                                  aria-label="View details"
                                >
                                  <Eye
                                    className="w-4 h-4 shrink-0"
                                    strokeWidth={2}
                                  />
                                </button>
                              )}
                              {onDownload && (
                                <button
                                  type="button"
                                  onClick={() => onDownload(item)}
                                  className="p-1.5 text-[#344054] hover:bg-[#F2F4F7] hover:text-[#101828] rounded-lg transition-colors"
                                  title="Download Receipt"
                                  id={`action-download-${item._id}`}
                                >
                                  <Download
                                    className="w-4 h-4 shrink-0"
                                    strokeWidth={2}
                                  />
                                </button>
                              )}
                              {(onMore || actionItems) && (
                                <div
                                  className="relative inline-block text-left"
                                  id={`action-menu-container-${item._id}`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (actionItems) {
                                        setOpenMenuRowId(
                                          openMenuRowId === item._id
                                            ? null
                                            : item._id,
                                        );
                                      } else if (onMore) {
                                        onMore(item, e);
                                      }
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      openMenuRowId === item._id
                                        ? "bg-[#EEF2F6] text-[#3B82F6]"
                                        : "hover:bg-[#F2F4F7] text-[#344054] hover:text-[#101828]"
                                    }`}
                                    title="More actions"
                                    id={`action-more-${item._id}`}
                                  >
                                    <MoreVertical
                                      className="w-4 h-4 shrink-0"
                                      strokeWidth={2}
                                    />
                                  </button>

                                  <AnimatePresence>
                                    {actionItems &&
                                      openMenuRowId === item._id && (
                                        <motion.div
                                          initial={{
                                            opacity: 0,
                                            scale: 0.95,
                                            y: isNearBottom ? 5 : -5,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            scale: 1,
                                            y: 0,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            scale: 0.95,
                                            y: isNearBottom ? 5 : -5,
                                          }}
                                          transition={{
                                            duration: 0.12,
                                            ease: "easeOut",
                                          }}
                                          className={`absolute right-0 bg-white border border-[#EAECF0] rounded-xl shadow-xl py-1 z-50 min-w-[160px] text-center overflow-hidden ${
                                            isNearBottom
                                              ? "bottom-full mb-1.5 origin-bottom-right"
                                              : "top-full mt-1.5 origin-top-right"
                                          }`}
                                          id={`action-menu-${item._id}`}
                                        >
                                          {(typeof actionItems === "function"
                                            ? actionItems(item)
                                            : actionItems
                                          )?.map((act, actIdx) => {
                                            let btnClass =
                                              "text-[#344054] hover:bg-[#F9FAFB] hover:text-[#101828]";
                                            if (act.variant === "danger") {
                                              btnClass =
                                                "text-[#F04438] hover:bg-[#FEF3F2]";
                                            } else if (act.variant === "info") {
                                              btnClass =
                                                "text-[#3B82F6] bg-[#F8F9FC] hover:bg-[#EFF6FF]";
                                            }

                                            return (
                                              <button
                                                key={`${act.label}-${actIdx}`}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  act.onClick(item);
                                                  setOpenMenuRowId(null);
                                                }}
                                                className={`w-full text-center px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer ${btnClass} ${
                                                  act.hasSeparator
                                                    ? "border-t border-[#EAECF0] mt-1 pt-2.5"
                                                    : ""
                                                } ${act.className || ""}`}
                                              >
                                                {act.label}
                                              </button>
                                            );
                                          })}
                                        </motion.div>
                                      )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                )}

                {/* Bottom Spacer for Virtualization */}
                {isVirtualizedEnabled && bottomSpacerHeight > 0 && (
                  <tr
                    style={{ height: `${bottomSpacerHeight}px` }}
                    aria-hidden="true"
                    id="virtual-spacer-bottom"
                  >
                    <td
                      colSpan={activeColumns?.length + 1}
                      className="p-0 border-0"
                    ></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {footer && processedData?.length > 0 ? (
        <div
          className="px-4 py-3 mt-1 bg-transparent"
          id="table-custom-footer-wrapper"
        >
          {footer}
        </div>
      ) : null}

      {/* Built-in Pagination Bar */}
      {pagination && processedData?.length > 0 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-[#EAECF0]"
          id="table-pagination-bar"
        >
          {/* Rows Per Page controller inside table if rowsPerPage is true */}
          {rowsPerPage ? (
            <div
              className="flex items-center gap-2 relative"
              id="table-rows-per-page-container"
              ref={rowsMenuRef}
            >
              <span className="text-sm font-semibold text-[#475467]">
                Rows per page
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRowsMenuOpen(!isRowsMenuOpen)}
                  className="flex items-center gap-1 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-1.5 rounded-lg text-sm font-bold text-[#101828] shadow-sm transition-all cursor-pointer"
                  id="table-rows-per-page-trigger"
                >
                  <span>{internalRowsPerPage}</span>
                  <ChevronDown className="w-4 h-4 text-[#475467]" />
                </button>

                {isRowsMenuOpen && (
                  <ul
                    className="absolute bottom-full left-0 mb-1.5 w-24 bg-white border border-[#EAECF0] rounded-xl shadow-xl py-1 z-20"
                    id="table-rows-per-page-menu"
                  >
                    {[5, 10, 20, 50, 100]?.map((num) => (
                      <li key={num}>
                        <button
                          type="button"
                          onClick={() => {
                            setInternalRowsPerPage(num);
                            setInternalCurrentPage(1);
                            setIsRowsMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs transition-colors font-semibold flex items-center justify-between ${
                            internalRowsPerPage === num
                              ? "bg-[#EEF2F6] text-[#3B82F6]"
                              : "text-[#344054] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <span>{num}</span>
                          {internalRowsPerPage === num && (
                            <Check className="w-3 h-3 text-[#3B82F6]" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Pagination numbers and buttons */}
          <div
            className="flex items-center gap-6 md:gap-8 select-none"
            id="table-custom-pagination"
          >
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() =>
                internalCurrentPage > 1 &&
                setInternalCurrentPage(internalCurrentPage - 1)
              }
              disabled={internalCurrentPage === 1}
              className="flex items-center gap-2 px-1 py-2 text-sm font-medium text-[#475467] hover:text-[#101828] disabled:opacity-30 disabled:pointer-events-none transition-colors group cursor-pointer"
              id="table-pagination-prev"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="w-4 h-4 text-[#475467] group-hover:text-[#101828] transition-colors stroke-[2]" />
              <span>Previous</span>
            </button>

            {/* Page Numbers */}
            <div
              className="flex items-center gap-1.5 md:gap-3"
              id="table-pagination-numbers"
            >
              {pages?.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-sm text-[#98A2B3] font-medium"
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isSelected = pageNum === internalCurrentPage;

                return (
                  <button
                    key={`page-${pageNum}`}
                    type="button"
                    onClick={() => setInternalCurrentPage(pageNum)}
                    aria-current={isSelected ? "page" : undefined}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "border border-[#3B82F6] text-[#3B82F6] hover:bg-[#EFF6FF]"
                        : "text-[#475467] hover:bg-[#F2F4F7] hover:text-[#101828]"
                    }`}
                    id={`table-pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() =>
                internalCurrentPage < totalPages &&
                setInternalCurrentPage(internalCurrentPage + 1)
              }
              disabled={internalCurrentPage === totalPages}
              className="flex items-center gap-2 px-1 py-2 text-sm font-medium text-[#475467] hover:text-[#101828] disabled:opacity-30 disabled:pointer-events-none transition-colors group cursor-pointer"
              id="table-pagination-next"
              aria-label="Go to next page"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-[#475467] group-hover:text-[#101828] transition-colors stroke-[2]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
