import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  statusesList?: string[];
  id?: string;
}

export function StatusFilter({
  selectedStatus,
  onStatusChange,
  statusesList = [
    "All Statuses",
    "Processed",
    "Failed",
    "Pending",
    "Rejected",
    "Initiated",
  ],
  id = "status-filter-wrapper",
}: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-sans" ref={containerRef} id={id}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center capitalize gap-1.5 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer"
        id="status-filter-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>
          {selectedStatus === "All Statuses"
            ? "Status"
            : selectedStatus.toLocaleLowerCase()?.replace(/_/g, " ")}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#475467] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-48 bg-white border border-[#EAECF0] rounded-xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-in fade-in-50 duration-100"
          id="status-filter-listbox"
          role="listbox"
        >
          {statusesList.map((status) => (
            <li key={status}>
              <button
                type="button"
                onClick={() => {
                  onStatusChange(status);
                  setIsOpen(false);
                }}
                className={`w-full capitalize text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? "bg-[#F2F4F7] text-[#101828] font-semibold"
                    : "text-[#344054] hover:bg-[#F9FAFB]"
                }`}
                role="option"
                aria-selected={selectedStatus === status}
              >
                {status?.toLocaleLowerCase()?.replace(/_/g, " ")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
