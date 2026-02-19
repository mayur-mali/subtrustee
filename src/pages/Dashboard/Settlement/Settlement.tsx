/* eslint-disable react/jsx-pascal-case */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  _Table,
  Pagination,
  RowsPerPageSelect,
} from "../../../components/Table";
import Select from "react-select";
import { GET_SETTLEMENT_REPORTS, GET_INSTITUTES } from "../../../Qurries";
import { useQuery, useLazyQuery } from "@apollo/client";
import { FaX } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
// import Filters from "../Transaction/components/Filters";
import { amountFormat } from "../../../utils/amountFormat";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Filters from "../Transaction/components/Filters";

// Custom dropdown indicator (unchanged)
export const CustomDropdownIndicator = () => {
  return (
    <div>
      <IoIosArrowDown className="text-xs w-8 text-[#1E1B59]" />
    </div>
  );
};

const Settlement = () => {
  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const debounceTimerRef = useRef<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerRow] = useState({
    name: 10,
  });

  // UI filters
  const [filters, setFilters] = useState<(string | null)[]>([null]);
  const [settlementStatusFilter, setSettlementStatusFilter] = useState("");
  const [selectDays, setSelectDays] = useState(0);
  const [schoolId, setSchoolId] = useState<(string | null)[]>([null]);
  const [unsettledAmountExplicit, setUnsettledAmountExplicit] = useState<
    number | null
  >(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCustomDateModel, setShowCustomDateModelset] = useState(false);
  const [dateDropDown, setDateDropDown] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<string>("");

  // Other UI state (unchanged behavior)
  const [selectedTime, setSelectedTime] = useState<string>("Date");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(""),
      key: "selection",
    },
  ]);

  const { data, loading, refetch } = useQuery(GET_SETTLEMENT_REPORTS, {
    variables: {
      filters: {
        page: currentPage,
        limit: itemsPerPage.name,
        search: committedSearch || undefined,
        status: settlementStatusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        dateFilterType: dateFilterType || undefined,
      },
    },
  });

  // Data state
  const settlementData = data?.getSettlementReportsSubTrustee?.data ?? [];
  const totalCount = data?.getSettlementReportsSubTrustee?.total ?? 0;

  // Apollo: fetch schools then settlements
  const { data: schoolsData, loading: schoolsLoading } =
    useQuery(GET_INSTITUTES);

  const enrichedRows = useMemo(() => {
    const allSchools = schoolsData?.getSubTrusteeSchools?.schools ?? [];

    return settlementData.map((report: any) => {
      const match = allSchools.find(
        (s: any) => s.school_id === report.schoolId,
      );
      return {
        ...report,
        schoolName: match ? match.school_name : "Unknown School",
      };
    });
  }, [settlementData, schoolsData]);

  // Build schools list options once from API data
  const schoolsList = useMemo(
    () =>
      (schoolsData?.getSubTrusteeSchools?.schools ?? []).map((school: any) => ({
        label: school.school_name,
        value: school.school_name,
      })),
    [schoolsData],
  );
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const commitSearch = () => {
    setCommittedSearch(searchQuery.trim());
    setCurrentPage(1);
  };

  // Utilities
  const filterByDateRange = useCallback(
    (row: any, currentDate: Date, days: number) => {
      if (!days || days === 0) return true;
      const settlementDate = new Date(row.settlementDate);
      const diffMs = currentDate.getTime() - settlementDate.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);
      if (diffDays < 0) return false;
      return diffDays <= days;
    },
    [],
  );

  const dataContainsQuery = useCallback((row: any, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const hay: (string | number | null | undefined)[] = [
      row.schoolName,
      row.status,
      row.utrNumber,
      row.settlementAmount,
      row.netSettlementAmount,
      row.adjustment,
      new Date(row.fromDate).toLocaleDateString("en-US"),
      new Date(row.tillDate).toLocaleDateString("en-US"),
      new Date(row.settlementDate).toLocaleString("en-US"),
    ];
    return hay.some((v) => (v ?? "").toString().toLowerCase().includes(q));
  }, []); // always returns boolean; stable reference [7][10]

  // Derive filtered rows (no setState here; pure derivation)
  // const filteredRows = useMemo(() => {
  //   if (!schoolData?.length) return [];
  //   const currentDate = endDate ? new Date(endDate) : new Date();

  //   const byDate = (r: any) => filterByDateRange(r, currentDate, selectDays);
  //   const byQuery = (r: any) => dataContainsQuery(r, debouncedSearch);
  //   const bySchool = (r: any) =>
  //     schoolId.length === 1 || schoolId.includes(r.schoolName);
  //   const byStatus = (r: any) =>
  //     settlementStatusFilter !== ""
  //       ? r.status === settlementStatusFilter ||
  //         (r.status === "SUCCESS" && settlementStatusFilter === "Settled")
  //       : true;

  //   return schoolData.filter(
  //     (r: any) => byDate(r) && byQuery(r) && bySchool(r) && byStatus(r),
  //   );
  // }, [
  //   schoolData,
  //   endDate,
  //   selectDays,
  //   debouncedSearch,
  //   schoolId,
  //   settlementStatusFilter,
  //   filterByDateRange,
  //   dataContainsQuery,
  // ]);

  // Pagination based on filtered rows
  // const totalPages = Math.ceil(filteredRows.length / itemsPerPage?.name) || 1;
  const totalPages = Math.ceil(totalCount / itemsPerPage.name) || 1;

  // const pageSliceStart = (currentPageSafe - 1) * itemsPerPage?.name;
  // const pageSliceEnd = currentPageSafe * itemsPerPage?.name;
  // const paginatedRows = filteredRows.slice(pageSliceStart, pageSliceEnd);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const handleClearTimeRange = () => {
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(""),
        key: "selection",
      },
    ]);
    setEndDate("");
    setSelectDays(0);
  };

  const handleFilterChange = (selectedFilter: any) => {
    setSettlementStatusFilter(selectedFilter.value);
    const val = selectedFilter.value;
    setFilters((prev) => (prev.includes(val) ? prev : [...prev, val]));
    setCurrentPage(1);
  };

  const handleSchoolFilterChange = useCallback((selectedFilter: any) => {
    const val = selectedFilter?.value;
    setSchoolId((prev) => (prev.includes(val) ? prev : [...prev, val]));
    setCurrentPage(1);
  }, []);

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
    setCurrentPage(1);
  };

  const removeSchoolFilter = (index: number) => {
    setSchoolId((prev) => prev.filter((_, i) => i !== index));
    setCurrentPage(1);
  };

  const handleApplyClick = () => {
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const diff = endDateObj.getTime() - startDateObj.getTime();
      const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
      setShowCustomDateModelset(!showCustomDateModel);
      setSelectDays(days);
      setDateDropDown(!dateDropDown);
      setCurrentPage(1);
    } else {
      toast.error("Both start and end dates are required");
      console.error("Both start and end dates are required.");
    }
  };

  return (
    <div className="overflow-hidden">
      <h2 className="text-[#1B163B] text-[28px] font-">Settlements</h2>

      <div className="w-full -ml-2 flex justify-between items-end">
        <div className="text-[#229635] font- flex ">
          {/* summary removed */}
        </div>
        <div className="">
          <div className="text-[14px] font- text-right m-0">
            settlement cycle
          </div>
          <div className="text-[20px] font- text-[#6687FF] m-0 mt-0">
            1 working day
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col overflow-x-auto mt-1">
        <_Table
          perPage={false}
          exportBtn={true}
          heading={"History"}
          srNo={false}
          loading={loading || schoolsLoading}
          pagination={false}
          copyContent={[9]}
          filter={[committedSearch]}
          isCustomFilter={true}
          searchBox={
            <div className="flex flex-col w-full">
              <div className="flex xl:!flex-row flex-col gap-2  w-full xl:items-center items-start mb-2 justify-between">
                <div className="bg-[#EEF1F6] py-3 items-center flex px-6 xl:max-w-md max-w-[34rem] w-full rounded-lg relative">
                  <input
                    type="text"
                    className="ml-1 text-xs bg-transparent focus:outline-none w-full placeholder:font-normal pr-6"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitSearch();
                    }}
                  />

                  {searchQuery && (
                    <FaX
                      className="absolute right-10 text-xs cursor-pointer text-gray-500 hover:text-black"
                      onClick={() => {
                        setSearchQuery("");
                        setCommittedSearch("");
                        setCurrentPage(1);
                      }}
                    />
                  )}
                  <IoSearchOutline
                    className="absolute right-3 text-lg cursor-pointer text-edvion_black text-opacity-50"
                    onClick={commitSearch}
                  />
                </div>

                <div className="flex items-center xl:max-w-lg w-full">
                  <Filters
                    selectedTime={selectedTime}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    transaction={false}
                    setSettlementStatusFilter={setSettlementStatusFilter}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    startDate={startDate}
                    endDate={endDate}
                    setSelectDays={setSelectDays}
                    setDateDropDown={setDateDropDown}
                    dateDropDown={dateDropDown}
                    setDateFilterType={setDateFilterType}
                    dateFilterType={dateFilterType}
                  />

                  <div className="w-full min-w-[180px] max-w-[180px]">
                    {schoolsList && (
                      <Select
                        className="font-normal m-0 p-2"
                        options={schoolsList}
                        components={{
                          DropdownIndicator: CustomDropdownIndicator,
                          IndicatorSeparator: () => null,
                        }}
                        onChange={handleSchoolFilterChange}
                        placeholder={
                          <div className="text-[#1E1B59] text-xs">
                            Select Institute
                          </div>
                        }
                        value={null}
                        styles={{
                          control: (provided: any) => ({
                            ...provided,
                            backgroundColor: "#F6F8FA",
                            border: "1px solid #1B163B",
                            borderRadius: "6px",
                            minHeight: "15px",
                            margin: "0px",
                            color: "#6687FF",
                          }),
                          valueContainer: (provided: any) => ({
                            ...provided,
                            padding: "0px",
                            paddingLeft: "0.5rem",
                          }),
                          input: (provided: any) => ({
                            ...provided,
                            backgroundColor: "transparent",
                            color: "#000",
                          }),
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex ">
                {filters.map(
                  (filter, index) =>
                    filter !== null && (
                      <div
                        className="bg-[#6687FFCC] text-[16px] m-2 rounded-[8px] w-[131px] h-[40px] flex items-center justify-around"
                        key={index}
                      >
                        <span className="text-white">{filter}</span>
                        <span>
                          <FaX
                            className="text-white cursor-pointer"
                            onClick={() => removeFilter(index)}
                          />
                        </span>
                      </div>
                    ),
                )}

                {schoolId.map(
                  (school, index) =>
                    school !== null && (
                      <div
                        className="bg-[#6687FFCC] text-sm m-2 rounded-lg min-w-max h-10 px-2 flex items-center gap-x-2"
                        style={{ maxWidth: "8em" }}
                        key={index}
                      >
                        <span className="text-white truncate pl-2">
                          {school}
                        </span>
                        <span>
                          <FaX
                            className="text-white cursor-pointer h-3"
                            onClick={() => removeSchoolFilter(index)}
                          />
                        </span>
                      </div>
                    ),
                )}

                {selectDays !== 0 && (
                  <div className="bg-[#6687FFCC] text-sm m-2 rounded-lg min-w-max h-10 px-2 flex items-center gap-x-2">
                    <span className="text-white">{dateFilterType}</span>
                    <span>
                      <FaX
                        className="text-white cursor-pointer h-3"
                        onClick={() => {
                          setDateFilterType("");
                          setDateRange([
                            {
                              startDate: new Date(),
                              endDate: new Date(""),
                              key: "selection",
                            },
                          ]);
                          setEndDate("");
                          setSelectDays(0);
                        }}
                      />
                    </span>
                  </div>
                )}

                {settlementStatusFilter !== "" && (
                  <div className="bg-[#6687FFCC] text-sm m-2 rounded-lg min-w-max h-10 px-2 flex items-center gap-x-2">
                    <span className="text-white">{settlementStatusFilter}</span>
                    <span>
                      <FaX
                        className="text-white cursor-pointer h-3"
                        onClick={() => setSettlementStatusFilter("")}
                      />
                    </span>
                  </div>
                )}
              </div>
              <div>
                <RowsPerPageSelect
                  setItemsPerRow={(e: any) => {
                    setCurrentPage(1);
                    setItemsPerRow(e);
                  }}
                  itemsPerRow={itemsPerPage}
                  className=" justify-start"
                />
              </div>
            </div>
          }
          data={[
            [
              "Sr. No.",
              "Institute Name",
              "Settlement Amount",
              "Adjustment",
              "Payment Amount",
              "From",
              "Till",
              "Status",
              "UTR No",
              "Settlement Date",
            ],
            ...enrichedRows.map((data: any, index) => [
              (currentPage - 1) * itemsPerPage.name + 1 + index,
              <Link
                to="/payments/settlements-transaction"
                state={{
                  utrno: data.utrNumber,
                  settlementDate: data.settlementDate,
                }}
              >
                <div className="truncate">{data.schoolName}</div>
              </Link>,

              <div className="truncate">
                {amountFormat(data.settlementAmount)}
              </div>,

              <div className="truncate">{data.adjustment}</div>,

              <div className="truncate">
                {amountFormat(data.netSettlementAmount)}
              </div>,

              <div className="truncate">
                {new Date(data.fromDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>,

              <div className="truncate">
                {new Date(data.tillDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>,

              <div
                className={
                  "truncate " +
                  (data.status.toLowerCase() === "settled" ||
                  data.status.toLowerCase() === "success"
                    ? "text-[#04B521]"
                    : "")
                }
              >
                {data.status.toLowerCase() === "settled" ||
                data.status.toLowerCase() === "success"
                  ? "Settled"
                  : data.status}
              </div>,

              <div
                className="truncate overflow-hidden"
                style={{ maxWidth: "5em" }}
                title={data.utrNumber}
              >
                {data.utrNumber}
              </div>,

              <div className={"truncate"}>
                {new Date(data.settlementDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}
              </div>,
            ]),
          ]}
          footer={
            <div className="flex justify-center items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Settlement;
