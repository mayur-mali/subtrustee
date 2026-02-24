import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import AllFilters from "./AllFilter/AllFilters";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { toast } from "react-toastify";

function Filters(props: any) {
  const [dropDownOpt, setDropDownOpt] = useState<any>({
    date: false,
    status: false,
    allFilters: false,
    backdrop: false,
  });

  const [pendingFilter, setPendingFilter] = useState<{
    startDate: string;
    endDate: string;
    selectDays: number;
    dateFilterType: string;
  } | null>(null);

  const toogleDropDownOpt = (dropdownName: string) => {
    const updatedDropdowns = Object.keys(dropDownOpt).reduce(
      (acc: any, name) => {
        acc[name] = name === dropdownName ? !dropDownOpt[name] : false;
        return acc;
      },
      {},
    );
    setDropDownOpt(updatedDropdowns);
  };

  //commect for push

  const handleTimeFilter = (type: string) => {
    if (type !== "Custom Date Range") {
      props.setDateRange([
        {
          startDate: new Date(),
          endDate: null,
          key: "selection",
        },
      ]);
    }
    props.setSelectedTime(type);
    toogleDropDownOpt("date");
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    let dateToFilter: Date;
    if (type === "Today") {
      dateToFilter = new Date();
      props.setDateFilter({
        type: type,
        startDate: dateFormatter.format(dateToFilter),
        endDate: dateFormatter.format(new Date()),
      });
    } else if (type === "This Month") {
      dateToFilter = new Date();
      dateToFilter.setDate(1);
      props.setDateFilter({
        type: type,
        startDate: dateFormatter.format(dateToFilter),
        endDate: dateFormatter.format(new Date()),
      });
    } else if (type === "Last 7 days") {
      dateToFilter = new Date();
      dateToFilter = new Date(dateToFilter.getTime() - 7 * 24 * 60 * 60 * 1000);
      props.setDateFilter({
        type: type,
        startDate: dateFormatter.format(dateToFilter),
        endDate: dateFormatter.format(new Date()),
      });
    } else if (type === "Last Month") {
      dateToFilter = new Date();
      const lastDate = new Date();
      lastDate.setDate(1);
      lastDate.setDate(0);
      dateToFilter.setMonth(dateToFilter.getMonth() - 1);
      dateToFilter.setDate(1);
      props.setDateFilter({
        type: type,
        startDate: dateFormatter.format(dateToFilter),
        endDate: dateFormatter.format(lastDate),
      });
    } else if (
      type === "Custom Date Range" &&
      props.dateRange[0].endDate &&
      props.dateRange[0].endDate !== props.dateRange[0].startDate
    ) {
      props.setDateFilter({
        type: type,
        startDate: dateFormatter.format(props.dateRange[0].startDate),
        endDate: dateFormatter.format(props.dateRange[0].endDate),
      });
    }
  };
  const clearFilter = (type: string) => {
    toogleDropDownOpt("status");
    if (type === "clear") {
      props.setCheckboxFilter((pre: any) => {
        return { size: 0, status: 0, mode: 0 };
      });
      return;
    }
    props.setSelectStatus((pre: any) => {
      return { ...pre, [type]: true };
    });
    type = type.toLowerCase();
    props.setCheckboxFilter((pre: any) => {
      // return { size: 1, status: 1, mode: 0, [type]: true };
      return {
        ...pre,
        [type]: true,
        size: pre.size + 1,
        status: pre.status + 1,
      };
    });
  };

  const handleClearTimeRange = () => {
    props.setSelectedTime("Date");
    props.setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(""),
        key: "selection",
      },
    ]);
    props.setDateFilter({
      type: "",
      startDate: "01/01/1970, 5:30:00 AM",
      endDate: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    });
  };
  const handleClearTimeRangeSettlement = () => {
    props.setDateRange([
      { startDate: new Date(), endDate: new Date(""), key: "selection" },
    ]);
    props.setDateFilterType("");
    props.setStartDate("");
    props.setEndDate("");
    props.setSelectDays(0);
    setPendingFilter(null);
  };
  const handleApplyClick = () => {
    if (pendingFilter) {
      props.setStartDate(pendingFilter.startDate);
      props.setEndDate(pendingFilter.endDate);
      props.setSelectDays(pendingFilter.selectDays);
      props.setDateFilterType(pendingFilter.dateFilterType);
      props.setDateDropDown(!props.dateDropDown);
      setPendingFilter(null);
      toogleDropDownOpt("date");
      return;
    }

    if (
      props.dateRange[0].startDate &&
      props.dateRange[0].endDate &&
      !isNaN(props.dateRange[0].endDate.getTime())
    ) {
      props.setDateFilterType("Custom Date Filter");
      const startDateObj = new Date(props.dateRange[0].startDate);
      startDateObj.setHours(0, 0, 0, 0);
      const endDateObj = new Date(props.dateRange[0].endDate);
      endDateObj.setHours(23, 59, 59, 999);
      props.setStartDate(startDateObj.toISOString());
      props.setEndDate(endDateObj.toISOString());
      const daysDifference = Math.ceil(
        (endDateObj.getTime() - startDateObj.getTime()) / (24 * 60 * 60 * 1000),
      );
      props.setSelectDays(daysDifference);
      props.setDateDropDown(!props.dateDropDown);
      toogleDropDownOpt("date");
    } else {
      toast.error("Both start and end dates are required");
    }
  };

  return (
    <div className="flex gap-x-2 xl:max-w-lg w-full">
      <div
        onClick={() =>
          setDropDownOpt({
            date: false,
            status: false,
            allFilters: false,
          })
        }
        className={`${
          dropDownOpt.backdrop
            ? "fixed top-0 left-0 w-full h-full min-h-screen "
            : "hidden"
        }`}
      ></div>
      <div className="relative bg-[#F6F8FA] w-full">
        <button
          onClick={() => {
            setDropDownOpt((pre: any) => {
              return {
                date: !dropDownOpt.date,
                status: false,
                mode: false,
                backdrop: !dropDownOpt.date,
              };
            });
          }}
          className="border border-edviron_black rounded-md py-2 w-full  
          
          text-xs text-left flex items-center"
        >
          <span className="mr-auto pl-2">{props.selectedTime}</span>
          <IoIosArrowDown className=" ml-auto w-8" />
        </button>
        {dropDownOpt.date && (
          <div className="absolute left-0 mt-2 text-sm bg-white  lg:min-w-[26rem] min-w-[20rem]  min-h-[27rem] px-2 pr-4 pb-2 rounded-md shadow-lg z-10 ">
            {props.transaction ? (
              <div className="w-full lg:col-span-3 col-span-8 py-4">
                <div className="grid grid-cols-2 ">
                  <button
                    onClick={() => {
                      const start = new Date();
                      start.setHours(0, 0, 0, 0);
                      const end = new Date();
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: 1,
                        dateFilterType: "Today",
                      });
                    }}
                    className={`py-2 px-4 mr-2 text-left rounded-md ${
                      props.selectedTime === "Today"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const start = new Date();
                      start.setDate(start.getDate() - 7);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date();
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: 7,
                        dateFilterType: "Last 7 days",
                      });
                    }}
                    className={`py-2 px-4 mr-2 text-left rounded-md ${
                      props.selectedTime === "Last 7 days"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1,
                      );
                      start.setHours(0, 0, 0, 0);
                      const end = new Date();
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: now.getDate(),
                        dateFilterType: "This Month",
                      });
                    }}
                    className={`py-2 px-4 mr-2 text-left rounded-md ${
                      props.selectedTime === "This Month"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1,
                      );
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0,
                      );
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: end.getDate(),
                        dateFilterType: "Last Month",
                      });
                    }}
                    className={`py-2 px-4 mr-2 text-left rounded-md ${
                      props.selectedTime === "Last Month"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                  >
                    Last Month
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full lg:col-span-3 col-span-8 py-4">
                <div className="grid grid-cols-2">
                  <button
                    className={`py-2 px-4 mr-2 cursor-pointer rounded-md ${
                      pendingFilter?.dateFilterType === "Today"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                    onClick={() => {
                      const start = new Date();
                      start.setHours(0, 0, 0, 0);
                      const end = new Date();
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: 1,
                        dateFilterType: "Today",
                      });
                      // also update dateRange so calendar reflects selection
                      props.setDateRange([
                        { startDate: start, endDate: end, key: "selection" },
                      ]);
                    }}
                  >
                    Today
                  </button>

                  <button
                    className={`py-2 px-4 mr-2 cursor-pointer rounded-md ${
                      pendingFilter?.dateFilterType === "Last 7 days"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                    onClick={() => {
                      const start = new Date();
                      start.setDate(start.getDate() - 7);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date();
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: 7,
                        dateFilterType: "Last 7 days",
                      });
                      props.setDateRange([
                        { startDate: start, endDate: end, key: "selection" },
                      ]);
                    }}
                  >
                    Last 7 days
                  </button>

                  <button
                    className={`py-2 px-4 mr-2 cursor-pointer rounded-md ${
                      pendingFilter?.dateFilterType === "This Month"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1,
                      );
                      start.setHours(0, 0, 0, 0);
                      const end = new Date();
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: now.getDate(),
                        dateFilterType: "This Month",
                      });
                      props.setDateRange([
                        { startDate: start, endDate: end, key: "selection" },
                      ]);
                    }}
                  >
                    This Month
                  </button>

                  <button
                    className={`py-2 px-4 mr-2 cursor-pointer rounded-md ${
                      pendingFilter?.dateFilterType === "Last Month"
                        ? "bg-[#6687FFCC] text-white"
                        : ""
                    }`}
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1,
                      );
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0,
                      );
                      end.setHours(23, 59, 59, 999);
                      setPendingFilter({
                        startDate: start.toISOString(),
                        endDate: end.toISOString(),
                        selectDays: end.getDate(),
                        dateFilterType: "Last Month",
                      });
                      props.setDateRange([
                        { startDate: start, endDate: end, key: "selection" },
                      ]);
                    }}
                  >
                    Last Month
                  </button>
                </div>
              </div>
            )}
            {props.transaction ? (
              <div className="text-center lg:col-span-5 col-span-8 flex flex-col w-full">
                <p className="p-2">Custom Range</p>

                <DateRange
                  rangeColors={["#6687FF"]}
                  editableDateInputs={false}
                  onChange={(item: any) => props.setDateRange([item.selection])}
                  ranges={props.dateRange}
                  maxDate={new Date()}
                />
                <div className="text-right">
                  <button
                    onClick={() => handleClearTimeRange()}
                    className="border px-4 py-2 rounded-md mr-2 text-[#6687FFCC] text-bold"
                  >
                    Clear
                  </button>
                  {pendingFilter && (
                    <div className="text-right mt-2">
                      <button
                        onClick={() => handleApplyClick()}
                        className="bg-[#6687FF] text-white px-4 py-2 rounded-md text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center lg:col-span-5 col-span-8 flex flex-col w-full">
                <p className="p-2">Custom Range</p>
                <DateRange
                  editableDateInputs={false}
                  rangeColors={["#6687FF"]}
                  onChange={(item: any) => {
                    // custom range selection clears any preset
                    setPendingFilter(null);
                    props.setDateRange([item.selection]);
                  }}
                  ranges={props.dateRange}
                  maxDate={new Date()}
                />
                <div className="text-right mt-2">
                  <button
                    onClick={() => handleClearTimeRangeSettlement()}
                    className="border px-4 py-2 rounded-lg mr-2 text-[#6687FFCC]"
                  >
                    Clear
                  </button>
                  <button
                    disabled={
                      !pendingFilter &&
                      isNaN(props.dateRange[0].endDate?.getTime())
                    }
                    onClick={() => handleApplyClick()}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      pendingFilter ||
                      !isNaN(props.dateRange[0].endDate?.getTime())
                        ? "bg-[#6687FF] text-white cursor-pointer"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative text-sm bg-[#F6F8FA]  w-full">
        <button
          onClick={() =>
            setDropDownOpt((pre: any) => {
              return {
                date: false,
                status: !dropDownOpt.status,
                allFilters: false,
                backdrop: !dropDownOpt.status,
              };
            })
          }
          className="border border-edviron_black text-xs rounded-md py-2 w-full lg:min-w-[11rem] min-w-fit text-left flex items-center"
        >
          <span className="mr-auto pl-2">Status</span>
          <IoIosArrowDown className=" ml-auto w-8" />
        </button>
        {dropDownOpt.status &&
          (props.transaction ? (
            <ul className="absolute bg-white min-w-[11rem] py-2 mt-2 rounded-md shadow-lg z-10">
              <li
                onClick={() => {
                  if (!props.selectStatus.Success) {
                    clearFilter("Success");
                    return;
                  }
                }}
                className={`py-2 pl-4 cursor-pointer mb-2 `}
              >
                Success
              </li>
              <li
                onClick={() => {
                  if (!props.selectStatus.Pending) {
                    clearFilter("Pending");
                  }
                  return;
                }}
                className={`py-2 pl-4 cursor-pointer mb-2 `}
              >
                Pending
              </li>
              <li
                onClick={() => {
                  if (!props.selectStatus.Failure) {
                    clearFilter("Failure");
                  }
                  if (!props.selectStatus.Failed) {
                    clearFilter("Failed");
                  }
                  return;
                }}
                className={`py-2 pl-4 cursor-pointer`}
              >
                Failed
              </li>
            </ul>
          ) : (
            <ul className="absolute bg-white min-w-[11rem] py-2 mt-2 rounded-md shadow-lg z-10">
              <li
                onClick={() => {
                  props.setSettlementStatusFilter("Settled");
                }}
                className={`py-2 pl-4 cursor-pointer mb-2 `}
              >
                Settled
              </li>
              <li
                onClick={() => {
                  props.setSettlementStatusFilter("Pending");
                }}
                className={`py-2 pl-4 cursor-pointer mb-2 `}
              >
                Pending
              </li>
            </ul>
          ))}
      </div>
      {props.transaction && (
        <div className="relative bg-[#F6F8FA]  w-full">
          <button
            onClick={() =>
              setDropDownOpt((pre: any) => {
                return {
                  date: false,
                  status: false,
                  allFilters: !dropDownOpt.allFilters,
                  backdrop: !dropDownOpt.allFilters,
                };
              })
            }
            className=" border text-xs border-edviron_black rounded-md py-2 w-full lg:min-w-[11rem] min-w-[6rem] text-left flex items-center"
          >
            <span className="mr-auto pl-2">All Filters</span>
            <HiOutlineAdjustmentsHorizontal className=" ml-auto w-8" />
          </button>
          {dropDownOpt.allFilters && (
            <AllFilters
              schoolData={props.schoolData}
              checkboxFilter={props.checkboxFilter}
              setSchoolFilter={props.setSchoolFilter}
              schoolFilter={props.schoolFilter}
              setCheckboxFilter={props.setCheckboxFilter}
            />
          )}
        </div>
      )}
    </div>
  );
}
export default Filters;
