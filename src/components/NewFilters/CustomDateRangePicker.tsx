import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface CustomDateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onApply: (start: string, end: string) => void;
  onCancel: () => void;
}

export function CustomDateRangePicker({
  startDate,
  endDate,
  onApply,
  onCancel,
}: CustomDateRangePickerProps) {
  // Parse initial dates or fall back to July 2026 (current context)
  const parseDate = (str: string) => {
    if (!str) return new Date(2026, 6, 3); // Default July 3, 2026
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);

  // For navigating the displayed month/year in calendar
  const initialDate = parseDate(startDate || endDate);
  const [displayMonth, setDisplayMonth] = useState<number>(
    initialDate.getMonth(),
  ); // 0-11
  const [displayYear, setDisplayYear] = useState<number>(
    initialDate.getFullYear(),
  );

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Month and Year selections for dropdowns
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const yearsList = Array.from({ length: 15 }, (_, i) => 2020 + i);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMonthDropdownOpen(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(e.target as Node)
      ) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // Quick preset actions
  const selectToday = () => {
    const today = new Date(); // Context date: July 3, 2026
    const str = formatDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    setTempStart(str);
    setTempEnd(str);
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
  };

  const selectLast7Days = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const startStr = formatDateString(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const endStr = formatDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    setTempStart(startStr);
    setTempEnd(endStr);
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
  };

  const selectThisMonth = () => {
    const today = new Date();
    const firstDay = formatDateString(today.getFullYear(), today.getMonth(), 1);
    const lastDayStr = formatDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    setTempStart(firstDay);
    setTempEnd(lastDayStr);
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
  };

  const selectLastMonth = () => {
    const today = new Date();
    let y = today.getFullYear();
    let m = today.getMonth() - 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    const firstDay = formatDateString(y, m, 1);
    const lastDay = new Date(y, m + 1, 0).getDate();
    const lastDayStr = formatDateString(y, m, lastDay);
    setTempStart(firstDay);
    setTempEnd(lastDayStr);
    setDisplayMonth(m);
    setDisplayYear(y);
  };

  // Calendar calculations
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarGrid = () => {
    const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const currentMonthDays = getDaysInMonth(displayYear, displayMonth);

    // Prev month days
    let prevMonth = displayMonth - 1;
    let prevYear = displayYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const grid = [];

    // Prepend previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      grid.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr: formatDateString(prevYear, prevMonth, d),
      });
    }

    // Current month's days
    for (let i = 1; i <= currentMonthDays; i++) {
      grid.push({
        day: i,
        month: displayMonth,
        year: displayYear,
        isCurrentMonth: true,
        dateStr: formatDateString(displayYear, displayMonth, i),
      });
    }

    // Append next month's leading days to complete 42 elements (6 rows of 7)
    let nextMonth = displayMonth + 1;
    let nextYear = displayYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr: formatDateString(nextYear, nextMonth, i),
      });
    }

    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((prev) => prev - 1);
    } else {
      setDisplayMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((prev) => prev + 1);
    } else {
      setDisplayMonth((prev) => prev + 1);
    }
  };

  // Day selection click
  const handleDateClick = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd("");
    } else {
      // Second click
      if (dateStr < tempStart) {
        // If selected second date is before start date, make it the new start date
        setTempStart(dateStr);
        setTempEnd("");
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  // Check selection status of a date
  const getDateStatus = (dateStr: string) => {
    const isStart = tempStart === dateStr;
    const isEnd = tempEnd === dateStr;

    let isInRange = false;
    if (tempStart && tempEnd) {
      isInRange = dateStr > tempStart && dateStr < tempEnd;
    } else if (tempStart && hoveredDate) {
      isInRange = dateStr > tempStart && dateStr <= hoveredDate;
    }

    return { isStart, isEnd, isInRange };
  };

  const handleClear = () => {
    setTempStart("");
    setTempEnd("");
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tempStart && tempEnd) {
      onApply(tempStart, tempEnd);
    } else if (tempStart) {
      onApply(tempStart, tempStart);
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const currentDate = now.getDate();

  const todayStr = formatDateString(currentYear, currentMonth, currentDate);

  return (
    <div
      className="flex flex-col bg-white p-5 rounded-2xl border border-[#EAECF0] w-[350px] sm:w-[380px] max-h-[85vh] sm:max-h-[550px] overflow-y-auto shadow-xl text-[#344054] select-none"
      id="custom-range-picker-container"
    >
      {/* Tab/Heading */}
      <div className="flex justify-center mb-4">
        <span className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold rounded-full tracking-wide">
          Custom Range
        </span>
      </div>

      {/* Preset Quick Selects Grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 mb-3 px-1 border-b border-[#F2F4F7] pb-4">
        <button
          onClick={selectToday}
          className="text-left text-xs font-medium text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
        >
          Today
        </button>
        <button
          onClick={selectLast7Days}
          className="text-left text-xs font-medium text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
        >
          Last 7 Days
        </button>
        <button
          onClick={selectThisMonth}
          className="text-left text-xs font-medium text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
        >
          This Month
        </button>
        <button
          onClick={selectLastMonth}
          className="text-left text-xs font-medium text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
        >
          Last Month
        </button>
      </div>

      {/* Month Navigation Row */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-[#F9FAFB] text-[#475467] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 font-semibold text-sm text-[#1D2939]">
          {/* Month Dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-1 hover:bg-[#F9FAFB] px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              <span>{monthsList[displayMonth]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
            </button>
            {isMonthDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border border-[#EAECF0] rounded-xl shadow-lg py-1 z-30 max-h-48 overflow-y-auto w-32">
                {monthsList.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => {
                      setDisplayMonth(idx);
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#F9FAFB] ${
                      displayMonth === idx
                        ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                        : "text-[#344054]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="flex items-center gap-1 hover:bg-[#F9FAFB] px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              <span>{displayYear}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
            </button>
            {isYearDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border border-[#EAECF0] rounded-xl shadow-lg py-1 z-30 max-h-48 overflow-y-auto w-24">
                {yearsList.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setDisplayYear(y);
                      setIsYearDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#F9FAFB] ${
                      displayYear === y
                        ? "bg-[#EFF6FF] text-[#2563EB] font-bold"
                        : "text-[#344054]"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1 rounded-lg hover:bg-[#F9FAFB] text-[#475467] transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#98A2B3] mb-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-center gap-y-1 mb-3">
        {calendarGrid.map(({ day, isCurrentMonth, dateStr }, index) => {
          const { isStart, isEnd, isInRange } = getDateStatus(dateStr);
          const isSelected = isStart || isEnd;
          const isFuture = dateStr > todayStr;
          return (
            <div
              key={`${dateStr}-${index}`}
              className="relative py-0.5"
              onMouseEnter={() =>
                tempStart && !tempEnd && setHoveredDate(dateStr)
              }
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* Highlight Background for Range */}
              {isInRange && (
                <div className="absolute inset-y-0 left-0 right-0 bg-[#EFF6FF]" />
              )}
              {isStart && tempEnd && (
                <div className="absolute inset-y-0 left-1/2 right-0 bg-[#EFF6FF]" />
              )}
              {isEnd && tempStart && (
                <div className="absolute inset-y-0 left-0 right-1/2 bg-[#EFF6FF]" />
              )}

              {/* Day Circle Button */}
              <button
                disabled={isFuture}
                onClick={() => !isFuture && handleDateClick(dateStr)}
                className={`relative w-8 h-8 mx-auto rounded-full flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  isFuture
                    ? "text-[#CBD5E1] cursor-not-allowed opacity-35 hover:bg-transparent pointer-events-none"
                    : isSelected
                      ? "bg-[#3B82F6] text-white shadow-sm cursor-pointer"
                      : isCurrentMonth
                        ? "text-[#344054] hover:bg-[#F2F4F7] cursor-pointer"
                        : "text-[#D0D5DD] hover:bg-[#F9FAFB] cursor-pointer"
                }`}
              >
                <span>{day}</span>
                {/* Specific design detail from screenshot: selected has an underline */}
                {isSelected && (
                  <span className="w-2.5 h-[1.5px] bg-white mt-0.5 rounded-full" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-2 pt-4 border-t border-[#F2F4F7]">
        <button
          onClick={handleClear}
          className="px-5 py-2 text-sm font-semibold text-[#6A7282] hover:bg-[#EFF6FF] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          //disabled={!tempStart}
          className="px-5 py-2 bg-[#6687FF]  text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
