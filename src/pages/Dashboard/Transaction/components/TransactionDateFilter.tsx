import React, { useEffect, useRef, useState } from "react";
import { DateRange } from "react-date-range";

import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";
import { IoIosArrowDown } from "react-icons/io";
import { getStartAndEndOfMonth } from "../../../../utils/getStartAndEndOfMonth";

export const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function TransactionDateFilter({
  setType,
  type,
  refetch,
  selectedRange,
  setSelectedRange,
  setIsDateRangeIsSelected,
}: any) {
  const [openDateRange, setOpenDateRange] = useState(false);

  const { startDate, endDate } = getStartAndEndOfMonth();
  const divRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: any) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setOpenDateRange(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const handlePresetFilter = (type: any) => {
    let startDate, endDate;
    setIsDateRangeIsSelected(true);
    switch (type) {
      case "today":
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());

        setType("Today");
        break;
      case "last7days":
        startDate = subDays(new Date(), 7);
        endDate = new Date();

        setType("Last 7 days");
        break;
      case "thisMonth":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        setType("This Month");

        break;
      case "lastMonth":
        startDate = startOfMonth(subDays(new Date(), 30));
        endDate = endOfMonth(subDays(new Date(), 30));
        setType("Last Month");
        break;
      default:
        startDate = new Date();
        endDate = new Date();
        break;
    }

    setSelectedRange({
      startDate,
      endDate,
      key: "selection",
    });
  };

  const clearSelection = async () => {
    setIsDateRangeIsSelected(false);
    setSelectedRange({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: "selection",
    });
    refetch({
      start_date: startDate,
      end_date: endDate,
    });

    setType("");
  };

  return (
    <div className="relative w-full " ref={divRef}>
      <button
        onClick={() => {
          setOpenDateRange(!openDateRange);
        }}
        className="focus:outline-none border border-edviron_black  hover:border-gray-300 transition-all duration-150 rounded-md py-2 w-full text-xs text-left flex items-center "
      >
        <span className="mr-auto pl-2">
          Date {type === "Today" && <span>(Today)</span>}
        </span>
        <IoIosArrowDown className=" text-xs w-8 text-[#1E1B59]" />
      </button>
      {openDateRange && (
        <div className="absolute text-sm bg-white xl:min-w-[26rem] min-w-[20rem] px-8 pt-2 pb-4 rounded-md shadow-lg z-10 flex flex-col">
          <p className="p-2 text-sm text-center">Custom Range</p>
          <div className="flex flex-col xl:flex-col gap-x-4">
            <div className="text-[10px] shrink-0 grid grid-cols-2">
              <button
                className="p-1.5 cursor-pointer rounded-md text-left"
                onClick={() => handlePresetFilter("today")}
              >
                Today
              </button>
              <button
                className="p-1.5 cursor-pointer rounded-md text-left"
                onClick={() => handlePresetFilter("last7days")}
              >
                Last 7 Days
              </button>
              <button
                className="p-1.5 cursor-pointer rounded-md text-left"
                onClick={() => handlePresetFilter("thisMonth")}
              >
                This Month
              </button>
              <button
                className="p-1.5 cursor-pointer rounded-md text-left"
                onClick={() => handlePresetFilter("lastMonth")}
              >
                Last Month
              </button>
            </div>

            <DateRange
              ranges={[selectedRange]}
              onChange={(item: any) => {
                setSelectedRange(item.selection);
                setIsDateRangeIsSelected(true);
              }}
              maxDate={new Date()}
              showDateDisplay={false}
            />
          </div>
          <div className="flex justify-end items-center">
            <button
              className="border px-3 py-1.5 rounded-lg mr-2 text-[#6687FFCC]"
              onClick={clearSelection}
            >
              Clear
            </button>
            <button
              // disabled={
              //   selectedRange.startDate.getDate() === new Date().getDate()
              // }
              className="bg-[#1E1B59] text-white border px-3 py-1.5 rounded-lg mr-2"
              onClick={async () => {
                refetch();
                setType("Custom Date");
                setOpenDateRange(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionDateFilter;
