import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { CustomDateRangePicker } from "./CustomDateRangePicker";

export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  isDateRangeSelected?: boolean;
  onDateRangeSelectedChange?: (selected: boolean) => void;
  id?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
  isDateRangeSelected,
  onDateRangeSelectedChange,
  id = "date-range-filter-wrapper",
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");

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

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If there's less than 400px of space below, and more space above than below, open upward
      if (spaceBelow < 400 && spaceAbove > spaceBelow) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }
    }
  }, [isOpen]);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const placementClass =
    placement === "top" ? "bottom-0 mb-2" : "top-full mt-2";

  return (
    <div className="relative " ref={containerRef} id={id}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border px-3.5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer ${
          isDateRangeSelected
            ? "bg-[#EEF2F6] border-[#3B82F6] text-[#2563EB]"
            : "bg-white hover:bg-[#F9FAFB] border-[#D0D5DD] text-[#344054]"
        }`}
        id="date-filter-trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Calendar
          className={`w-4 h-4 ${isDateRangeSelected ? "text-[#2563EB]" : "text-[#475467]"}`}
        />
        <span>
          {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 z-[200] animate-in fade-in-50 duration-100 ${placementClass}`}
          id="date-picker-popover"
        >
          <CustomDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onApply={(start, end) => {
              onDateChange(start, end);
              if (onDateRangeSelectedChange) {
                onDateRangeSelectedChange(true);
              }
              setIsOpen(false);
            }}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
