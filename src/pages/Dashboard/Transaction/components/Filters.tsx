import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import AllFilters from "./AllFilter/AllFilters";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { toast } from "react-toastify";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";

function Filters(props: any) {
  const [dropDownOpt, setDropDownOpt] = useState<any>({
    date: false,
    status: false,
    allFilters: false,
    backdrop: false,
  });

  const [pendingFilterType, setPendingFilterType] = useState<string>("");
  const [pendingStartDate, setPendingStartDate] = useState<any>(null);
  const [pendingEndDate, setPendingEndDate] = useState<any>(null);
  const [pendingSelectDays, setPendingSelectDays] = useState<number>(0);

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
    let rangeStartDate: Date;
    let rangeEndDate: Date;

    if (type === "Today") {
      rangeStartDate = startOfDay(new Date());
      rangeEndDate = endOfDay(new Date());
    } else if (type === "Last 7 days") {
      rangeStartDate = subDays(new Date(), 7);
      rangeEndDate = endOfDay(new Date());
    } else if (type === "This Month") {
      rangeStartDate = startOfMonth(new Date());
      rangeEndDate = endOfDay(new Date());
    } else if (type === "Last Month") {
      const currentDate = new Date();
      const lastMonth = currentDate.getMonth() - 1;
      const year =
        lastMonth < 0
          ? currentDate.getFullYear() - 1
          : currentDate.getFullYear();
      const month = lastMonth < 0 ? 11 : lastMonth;
      rangeStartDate = new Date(year, month, 1);
      rangeEndDate = new Date(year, month + 1, 0);
    } else {
      rangeStartDate = new Date();
      rangeEndDate = null as any;
    }

    if (type !== "Custom Date Range") {
      props.setDateRange([
        {
          startDate: rangeStartDate,
          endDate: rangeEndDate,
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
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleClearTimeRangeSettlement = () => {
    props.setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(""),
        key: "selection",
      },
    ]);
    props.setStartDate("");
    props.setDateFilterType("");
    props.setEndDate("");
    props.setSelectDays(0);
  };
  const handleApplyClick = () => {
    if (props.dateRange[0].startDate && props.dateRange[0].endDate) {
      props.setDateFilterType("Custom Date");
      const startDateObj = new Date(props.dateRange[0].startDate);
      const endDateObj = new Date(props.dateRange[0].endDate);

      // Calculate the difference in milliseconds
      const timeDifference = endDateObj.getTime() - startDateObj.getTime();

      // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 milliseconds)
      const daysDifference = Math.ceil(timeDifference / (24 * 60 * 60 * 1000));

      props.setStartDate(props.dateRange[0].startDate);
      props.setEndDate(props.dateRange[0].endDate);
      // setShowCustomDateModelset(!showCustomDateModel);
      props.setSelectDays(daysDifference);
      props.setDateDropDown(!props.dateDropDown);
    } else {
      // Handle case where either startDate or endDate is null
      toast.error("Both start and end dates are required");
      console.error("Both start and end dates are required.");
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
          <div className="absolute left-0 mt-2 text-sm bg-white  lg:min-w-[26rem] min-w-[20rem]  min-h-[27rem] px-4 pt-4 pb-4 rounded-md shadow-lg z-10 ">
            <p className="text-sm text-center mb-4">Custom Range</p>
            {props.transaction ? (
              <div className="w-full">
                <div className="grid grid-cols-2 text-[10px] mb-4 pl-4">
                  <button
                    onClick={() => handleTimeFilter("Today")}
                    className="p-1.5 cursor-pointer rounded-md text-left"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleTimeFilter("Last 7 days")}
                    className="p-1.5 cursor-pointer rounded-md text-left"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleTimeFilter("This Month")}
                    className="p-1.5 cursor-pointer rounded-md text-left"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => handleTimeFilter("Last Month")}
                    className="p-1.5 cursor-pointer rounded-md text-left"
                  >
                    Last Month
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-2 text-[10px] mb-4 pl-4">
                  <button
                    className="p-1.5 cursor-pointer rounded-md text-left"
                    onClick={() => {
                      const startDate = startOfDay(new Date());
                      const endDate = endOfDay(new Date());
                      setPendingStartDate(formatDateForAPI(startDate));
                      setPendingEndDate(formatDateForAPI(endDate));
                      setPendingSelectDays(1);
                      setPendingFilterType("Custom Date");
                      props.setDateRange([
                        {
                          startDate: startDate,
                          endDate: endDate,
                          key: "selection",
                        },
                      ]);
                    }}
                  >
                    Today
                  </button>
                  <button
                    className="p-1.5 cursor-pointer rounded-md text-left"
                    onClick={() => {
                      const startDate = subDays(new Date(), 7);
                      const endDate = endOfDay(new Date());
                      setPendingStartDate(formatDateForAPI(startDate));
                      setPendingEndDate(formatDateForAPI(endDate));
                      setPendingSelectDays(7);
                      setPendingFilterType("Custom Date");
                      props.setDateRange([
                        {
                          startDate: startDate,
                          endDate: endDate,
                          key: "selection",
                        },
                      ]);
                    }}
                  >
                    Last 7 Days
                  </button>
                  <button
                    className="p-1.5 cursor-pointer rounded-md text-left"
                    onClick={() => {
                      const startDate = startOfMonth(new Date());
                      const endDate = endOfDay(new Date());
                      setPendingStartDate(formatDateForAPI(startDate));
                      setPendingEndDate(formatDateForAPI(endDate));
                      setPendingSelectDays(
                        Math.ceil(
                          (endDate.getTime() - startDate.getTime()) /
                            (24 * 60 * 60 * 1000),
                        ),
                      );
                      setPendingFilterType("Custom Date");
                      props.setDateRange([
                        {
                          startDate: startDate,
                          endDate: endDate,
                          key: "selection",
                        },
                      ]);
                    }}
                  >
                    This Month
                  </button>
                  <button
                    className="p-1.5 cursor-pointer rounded-md text-left"
                    onClick={() => {
                      const currentDate = new Date();
                      const lastMonth = currentDate.getMonth() - 1;
                      const year =
                        lastMonth < 0
                          ? currentDate.getFullYear() - 1
                          : currentDate.getFullYear();
                      const month = lastMonth < 0 ? 11 : lastMonth;
                      const startDate = new Date(year, month, 1);
                      const endDate = new Date(year, month + 1, 0);
                      setPendingStartDate(formatDateForAPI(startDate));
                      setPendingEndDate(formatDateForAPI(endDate));
                      setPendingSelectDays(
                        Math.ceil(
                          (endDate.getTime() - startDate.getTime()) /
                            (24 * 60 * 60 * 1000),
                        ),
                      );
                      setPendingFilterType("Custom Date");
                      props.setDateRange([
                        {
                          startDate: startDate,
                          endDate: endDate,
                          key: "selection",
                        },
                      ]);
                    }}
                  >
                    Last Month
                  </button>
                </div>
              </div>
            )}
            {props.transaction ? (
              <div className="flex flex-col w-full">
                <div className="mx-auto">
                  <DateRange
                    editableDateInputs={false}
                    onChange={(item: any) =>
                      props.setDateRange([item.selection])
                    }
                    ranges={props.dateRange}
                    maxDate={new Date()}
                    showDateDisplay={false}
                  />
                </div>
                <div className="flex justify-end items-center mt-2">
                  <button
                    onClick={() => handleClearTimeRange()}
                    className="border px-3 py-1.5 rounded-lg mr-2 text-[#6687FFCC]"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleTimeFilter("Custom Date Range")}
                    className="bg-[#1E1B59] text-white px-3 py-1.5 rounded-lg mr-2"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <div className="mx-auto">
                  <DateRange
                    editableDateInputs={false}
                    ranges={[props.dateRange[0]]}
                    onChange={(item: any) => {
                      props.setDateRange([item.selection]);
                    }}
                    maxDate={new Date()}
                    showDateDisplay={false}
                  />
                </div>
                <div className="flex justify-end items-center mt-2">
                  <button
                    onClick={() => {
                      setPendingFilterType("");
                      setPendingStartDate(null);
                      setPendingEndDate(null);
                      setPendingSelectDays(0);
                      handleClearTimeRangeSettlement();
                    }}
                    className="border px-3 py-1.5 rounded-lg mr-2 text-[#6687FFCC]"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      if (pendingFilterType) {
                        // preset was selected — commit it
                        props.setStartDate(pendingStartDate);
                        props.setEndDate(pendingEndDate);
                        props.setSelectDays(pendingSelectDays);
                        props.setDateFilterType(pendingFilterType);
                        props.setDateDropDown(!props.dateDropDown);
                        setPendingFilterType("");
                        setPendingStartDate(null);
                        setPendingEndDate(null);
                        setPendingSelectDays(0);
                        toogleDropDownOpt("date");
                      } else {
                        // custom calendar range — existing logic
                        props.setStartDate(props.dateRange[0].startDate);
                        props.setEndDate(props.dateRange[0].endDate);
                        handleApplyClick();
                        toogleDropDownOpt("date");
                      }
                    }}
                    className="bg-[#1E1B59] text-white px-3 py-1.5 rounded-lg mr-2"
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
