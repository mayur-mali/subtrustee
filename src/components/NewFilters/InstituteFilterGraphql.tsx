import { useQuery } from "@apollo/client";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GET_INSTITUTES } from "../../Qurries";
import { ChevronDown, Search, X } from "lucide-react";
import { ToolbarPopover } from "../../pages/Dashboard/Settlement/components/ToolbarPopover";

export interface InstituteOption {
  label: string;
  value: string;
  id: string;
}

export interface InstituteFilterProps {
  selectedInstitute?: string;
  onInstituteChange?: (val: string, schoolId?: string | null) => void;
  selectedSchool?: string;
  setSelectSchool?: (val: string | null) => void;
  setSchoolId?: (id: string | null) => void;
  value?: string;
  onChange?: (val: string) => void;
  institutesList?: string[];
  id?: string;
  triggerClassName?: string;
}

// Global default option
const DEFAULT_OPTION: InstituteOption = {
  label: "All Institutes",
  value: "All Institutes",
  id: "",
};
function InstituteFilterGraphql(props: InstituteFilterProps) {
  const { id = "institute-filter-wrapper" } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef(0);

  // Reset page/limit and clear search when opening or closing
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
    setLimit(10);
  }, [isOpen]);

  // Debounce search term to prevent excessive GraphQL query requests
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Subtrustee-scoped schools (not trustee getSchoolQuery)
  const { data, loading } = useQuery(GET_INSTITUTES, {
    variables: {
      page: 1,
      limit,
      searchQuery:
        debouncedSearchTerm.trim() !== "" ? debouncedSearchTerm.trim() : null,
    },
    fetchPolicy: "network-only",
  });

  // Extract total items count from GraphQL query
  const totalCount = data?.getSubTrusteeSchools?.totalItems ?? 0;

  // Process schools retrieved from live server
  const fetchedSchools = useMemo(() => {
    if (!data?.getSubTrusteeSchools?.schools) return [];
    return data.getSubTrusteeSchools.schools.map((school: any) => ({
      label: school.school_name,
      value: school.school_name,
      id: school.school_id,
    }));
  }, [data]);

  // Assemble full dropdown options
  const options = useMemo(() => {
    return [DEFAULT_OPTION, ...fetchedSchools];
  }, [fetchedSchools]);
  useLayoutEffect(() => {
    if (!listRef.current) return;

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = scrollPositionRef.current;
      }
    });
  }, [options.length]);

  // Handle lazy loading when user scrolls to bottom of dropdown
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const target = e.currentTarget;
    if (
      !loading &&
      fetchedSchools.length < totalCount &&
      target.scrollHeight - target.scrollTop <= target.clientHeight + 12
    ) {
      scrollPositionRef.current = target.scrollTop;

      setLimit((prev) => Math.min(prev + 10, totalCount));
    }
  };

  // Determine current active selection
  const selectedVal =
    props.selectedInstitute ??
    props.selectedSchool ??
    props.value ??
    DEFAULT_OPTION.value;

  const activeOption = useMemo(() => {
    return (
      options.find(
        (opt) => opt.value === selectedVal || opt.id === selectedVal,
      ) ?? DEFAULT_OPTION
    );
  }, [options, selectedVal]);

  const handleSelect = (option: InstituteOption) => {
    const isAll = option.value === DEFAULT_OPTION.value;
    const targetId = isAll ? null : option.id;

    if (props.setSchoolId) props.setSchoolId(targetId);
    if (props.onInstituteChange)
      props.onInstituteChange(option.value, targetId);
    if (props.onChange) props.onChange(option.value);
    if (props.setSelectSchool)
      props.setSelectSchool(isAll ? null : option.value);

    setIsOpen(false);
  };

  const displayLabel =
    activeOption.value === DEFAULT_OPTION.value
      ? "Institutes"
      : activeOption.label;

  return (
    <div className="relative font-sans" ref={containerRef} id={id}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          props.triggerClassName ||
          "flex items-center gap-1.5 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer whitespace-nowrap"
        }
        id="institute-filter-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{displayLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#475467] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <ToolbarPopover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={containerRef}
        align="right"
        id="institute-filter-popover"
      >
        <div
          className="w-52 bg-white border border-[#EAECF0] rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in-50 duration-100 font-sans"
          id="institute-filter-dropdown"
        >
          {/* Internal search box mimicking standard input query styles */}
          <div className="p-2 border-b border-[#EAECF0] flex items-center gap-1.5 bg-white">
            <Search className="w-3.5 h-3.5 text-[#667085] shrink-0" />
            <input
              type="text"
              placeholder="Search institute..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm text-[#344054] outline-none border-none focus:ring-0 bg-transparent py-0.5"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  scrollPositionRef.current = 0;
                }}
                className="text-[#98A2B3] hover:text-[#667085] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <ul
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-48 overflow-y-auto py-1"
            id="institute-filter-listbox"
            role="listbox"
          >
            {options.map((opt) => (
              <li key={opt.id || opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                    activeOption.value === opt.value
                      ? "bg-[#F2F4F7] text-[#101828] font-semibold"
                      : "text-[#344054] hover:bg-[#F9FAFB]"
                  }`}
                  role="option"
                  aria-selected={activeOption.value === opt.value}
                >
                  {opt.label}
                </button>
              </li>
            ))}

            {loading && (
              <li className="px-4 py-2 min-h-[150px] flex flex-col justify-center text-xs text-[#667085] text-center bg-[#F9FAFB]">
                Loading matches...
              </li>
            )}

            {/* Pagination hints on list bottoms */}
            {fetchedSchools.length < totalCount && !loading && (
              <li className="py-2 text-center text-[10px] text-gray-400 border-t border-[#F2F4F7]">
                Scroll down to load more...
              </li>
            )}
            {fetchedSchools.length > 0 &&
              fetchedSchools.length >= totalCount && (
                <li className="py-2 text-center text-[10px] text-gray-400 border-t border-[#F2F4F7]">
                  All matches loaded
                </li>
              )}
          </ul>
        </div>
      </ToolbarPopover>
    </div>
  );
}

export default InstituteFilterGraphql;
