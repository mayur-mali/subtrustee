import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { GET_INSTITUTES, SUBTRUSTEE_REFUND_REQUESTS } from "../../../Qurries";
import {
  _Table,
  Pagination,
  RowsPerPageSelect,
} from "../../../components/Table";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { amountFormat } from "../../../utils/amountFormat";

import Select, { components } from "react-select";
import DateFilter from "./DateFilter";
import { HiMiniXMark } from "react-icons/hi2";
import { CustomDropdownIndicator } from "../Settlement/Settlement";
import { endOfDay, startOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { getStartAndEndOfMonth } from "../../../utils/getStartAndEndOfMonth";
import RefundDateFilter, { formatDate } from "./RefundDateFilter";
import { FaX } from "react-icons/fa6";
import { useTransactionFilters } from "../../../hooks/useTransactionFilters";
import Institute from "../Transaction/components/AllFilter/Institute";
import TransactionDateFilter from "../Transaction/components/TransactionDateFilter";
function Refund() {
  const [searchText, setSearchText] = useState<string>("");
  // const { data } = useQuery(GET_SCHOOLS);
  const [status, setStatus] = useState<any>("");
  const [selectSchool, setSelectSchool] = useState<any>("");
  const [type, setType] = useState("");
  const { startDate, endDate } = getStartAndEndOfMonth();
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<any>([]);
  const [settlementStatusFilter, setSettlementStatusFilter] = useState("");
  const [selectDays, setSelectDays] = useState(0);
  const [schoolId, setSchoolId] = useState<any[]>([]);
  const [schoolFilterData, setSchoolFilterData] = useState<any[]>([]);
  const [SettlementReportsData, setSettlementReportsData] = useState([]);
  const [unsettledAmount, setUnsettledAmount] = useState(null);
  const [showCustomDateModel, setShowCustomDateModelset] = useState(false);
  const [dateDropDown, setDateDropDown] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerRow, setItemsPerRow] = useState({ name: 10 });
  const [isDateRangeIsSelected, setIsDateRangeIsSelected] = useState(false);
  const [urlFilters, setUrlFilters] = useTransactionFilters();
  const [searchClicked, setsearchClicked] = useState(false);
  const [checkboxFilter, setCheckboxFilter] = useState<any>({
    size: 0,
    status: 0,
    mode: 0,
  });
  const [dateRange, setDateRange] = useState("");
  const [refetchLoading, setRefetchLoading] = useState(false);

  const [refundRequestData, setRefundRequestData] = useState<any>([]);

  const {
    data: refundData,
    loading,
    refetch,
  } = useQuery(SUBTRUSTEE_REFUND_REQUESTS, {
    variables: {
      page: 1,
      limit: 10,
      startDate: startDate,
      endDate: endDate,
    },
  });

  useEffect(() => {
    if (refundData?.getSubTrusteeRefundRequest) {
      setRefundRequestData(refundData?.getSubTrusteeRefundRequest?.refund);
      setTotalPages(refundData?.getSubTrusteeRefundRequest?.totalPages);
    }
  }, [refundData?.getSubTrusteeRefundRequest]);
  useEffect(() => {}, [refundRequestData]);

  const refetchDateFetch = async ({
    start_date,
    end_date,
    status,
    schools,
    searchQuery,
    page,
    limit,
  }: {
    start_date?: string;
    end_date?: string;
    status?: string;
    schools?: string[];
    searchQuery?: string;
    page?: number;
    limit?: number;
  }) => {
    setRefetchLoading(true);
    const res = await refetch({
      startDate: start_date,
      endDate: end_date,
      status: status,
      school_id: schools,
      searchQuery: searchQuery,
      page: page,
      limit: limit,
    });

    try {
      if (res) {
        console.log(res, "res");
        setRefetchLoading(false);
        setRefundRequestData(res?.data?.getSubTrusteeRefundRequest?.refund);
        setTotalPages(res?.data?.getSubTrusteeRefundRequest?.totalPages);
      }
    } catch (error) {
      if (error) {
        setRefetchLoading(false);
      }
    }
  };

  function handelSearchQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }
  const handleSchoolFilterChange = (selectedFilter: any) => {
    if (!schoolFilterData.includes(selectedFilter.label)) {
      const newSchoolId = selectedFilter?.value?.toLocaleString();
      const updatedSchoolIds = [...schoolId, newSchoolId];
      const updatedSchoolFilterData = [
        ...schoolFilterData,
        selectedFilter?.label,
      ];
      setSchoolId(updatedSchoolIds);
      setSchoolFilterData(updatedSchoolFilterData);
      refetchDateFetch({
        searchQuery: searchQuery,
        page: 1,
        limit: itemsPerRow.name,
        start_date: isDateRangeIsSelected
          ? formatDate(selectedRange.startDate)
          : startDate,
        end_date: isDateRangeIsSelected
          ? formatDate(selectedRange.endDate)
          : endDate,
        status: settlementStatusFilter,
        schools: updatedSchoolIds,
      });
    }
  };

  const removeFilter = (index: any) => {
    // Create a new array without the filter at the specified index
    const updatedFilters = filters.filter((_: any, i: number) => i !== index);
    setFilters(updatedFilters);
    setCurrentPage(1);
    refetchDateFetch({
      searchQuery: searchQuery,
      page: 1,
      limit: itemsPerRow.name,
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: settlementStatusFilter,
      schools: schoolId,
    });
  };

  const removeSchoolFilter = (index: number) => {
    const updatedSchoolIds = schoolId.filter((_, i) => i !== index);
    const updatedSchoolFilterData = schoolFilterData.filter(
      (_, i) => i !== index,
    );

    setSchoolId(updatedSchoolIds);
    setSchoolFilterData(updatedSchoolFilterData);
    refetchDateFetch({
      searchQuery: searchQuery,
      page: 1,
      limit: itemsPerRow.name,
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: settlementStatusFilter,
      schools: updatedSchoolIds,
    });
  };

  const handlePageChange = (page: any) => {
    // if (page == currentPage) {
    //   return;
    // }
    setCurrentPage(page);
    refetchDateFetch({
      searchQuery: searchQuery,
      page: page,
      limit: itemsPerRow.name,
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: settlementStatusFilter,
      schools: schoolId,
    });
  };
  return (
    <div className="w-full pt-2">
      {loading ? (
        <div className="min-h-[80vh] w-full flex justify-center items-center">
          <AiOutlineLoading3Quarters className="text-3xl animate-spin" />
        </div>
      ) : (
        <>
          {refundData?.getSubTrusteeRefundRequest?.refund ? (
            <_Table
              pagination={false}
              heading={"Refund"}
              filter={[searchText]}
              loading={refetchLoading || loading}
              copyContent={[3, 4]}
              searchBox={
                <div className="flex flex-col w-full">
                  <div className="flex xl:!flex-row flex-col gap-2  w-full xl:items-center items-start mb-2 justify-between">
                    <div className="bg-[#EEF1F6] py-3 items-center flex  px-6 xl:max-w-md max-w-[34rem] w-full rounded-lg">
                      <input
                        type="text"
                        className="ml-4 text-xs bg-transparent focus:outline-none w-full placeholder:font-normal"
                        onFocus={(e) =>
                          (e.target.style.borderColor = "transparent")
                        }
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setSearchQuery(newValue);

                          if (newValue === "" && searchClicked) {
                            setsearchClicked(false);
                            setCurrentPage(1);
                            refetchDateFetch({
                              searchQuery: null,
                              page: 1,
                              limit: itemsPerRow.name,
                              start_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.startDate)
                                : startDate,
                              end_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.endDate)
                                : endDate,
                              status: settlementStatusFilter,
                              schools: schoolId,
                            });
                          }
                        }}
                      />
                      {searchQuery.length > 0 && (
                        <HiMiniXMark
                          onClick={() => {
                            setSearchQuery("");
                            setCurrentPage(1);
                            setsearchClicked(false);
                            refetchDateFetch({
                              searchQuery: null,
                              page: 1,
                              limit: itemsPerRow.name,
                              start_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.startDate)
                                : startDate,
                              end_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.endDate)
                                : endDate,
                              status: settlementStatusFilter,
                              schools: schoolId,
                            });
                          }}
                          className="text-[#1E1B59] cursor-pointer text-md ml-2 shrink-0"
                        />
                      )}
                      <div className="w-10 z-50 shrink-0 flex justify-center items-center">
                        {searchQuery.length > 3 &&
                        (loading || refetchLoading) ? (
                          <AiOutlineLoading3Quarters className="text-xs animate-spin" />
                        ) : (
                          <IoSearchOutline
                            onClick={() => {
                              if (searchQuery.length > 3) {
                                setsearchClicked(true);
                                setCurrentPage(1);
                                refetchDateFetch({
                                  searchQuery: searchQuery,
                                  page: 1,
                                  limit: itemsPerRow.name,
                                  start_date: isDateRangeIsSelected
                                    ? formatDate(selectedRange.startDate)
                                    : startDate,
                                  end_date: isDateRangeIsSelected
                                    ? formatDate(selectedRange.endDate)
                                    : endDate,
                                  status: settlementStatusFilter,
                                  schools: schoolId,
                                });
                              }
                            }}
                            className=" cursor-pointer text-edvion_black text-opacity-50 text-md "
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center xl:max-w-lg w-full">
                      <TransactionDateFilter
                        setType={setDateRange}
                        type={dateRange}
                        refetch={() => {
                          setCurrentPage(1);
                          refetchDateFetch({
                            searchQuery: searchQuery,
                            page: 1,
                            limit: itemsPerRow.name,
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: settlementStatusFilter,
                            schools: schoolId,
                          });
                        }}
                        selectedRange={selectedRange}
                        setSelectedRange={setSelectedRange}
                        setIsDateRangeIsSelected={setIsDateRangeIsSelected}
                      />
                      <div className="w-full">
                        <Select
                          className="font-normal m-0 p-2 capitalize"
                          options={[
                            { label: "INITIATED", value: "INITIATED" },
                            { label: "REJECTED", value: "REJECTED" },
                            { label: "APPROVED", value: "APPROVED" },
                            {
                              label: "DELETED BY USER",
                              value: "DELETED BY USER",
                            },
                          ].map((status: any) => {
                            return {
                              label: status.label?.toLowerCase(),
                              value: status.value?.toLowerCase(),
                            };
                          })}
                          components={{
                            DropdownIndicator: CustomDropdownIndicator,
                            IndicatorSeparator: () => null,
                          }}
                          onChange={(e: any) => {
                            setSettlementStatusFilter(e.value?.toUpperCase());
                            setCurrentPage(1);
                            refetchDateFetch({
                              searchQuery: searchQuery,
                              page: 1,
                              limit: itemsPerRow.name,
                              start_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.startDate)
                                : startDate,
                              end_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.endDate)
                                : endDate,
                              status: e.value?.toUpperCase(),
                              schools: schoolId,
                            });
                          }}
                          placeholder={
                            <div className="text-[#1E1B59] text-xs">Status</div>
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
                              "::placeholder": {
                                backgroundColor: "#YourDesiredColor",
                                opacity: 1,
                              },
                              placeholder: (provided: any) => ({
                                ...provided,
                                color: "red", // Set the color of the placeholder text
                              }),
                            }),
                          }}
                        />
                      </div>
                      <div className="w-full min-w-[180px] max-w-[180px]">
                        <Institute
                          setSelectSchool={setSelectSchool}
                          setSchoolId={(id: any) => {
                            const updatedSchoolIds = [...schoolId, id];
                            setSchoolId(updatedSchoolIds);
                            setCurrentPage(1);
                            refetchDateFetch({
                              searchQuery: searchQuery,
                              page: 1,
                              limit: itemsPerRow.name,
                              start_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.startDate)
                                : "",
                              end_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.endDate)
                                : "",
                              status: settlementStatusFilter,
                              schools: updatedSchoolIds,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <RowsPerPageSelect
                      setItemsPerRow={(e: any) => {
                        if (itemsPerRow.name === e.name) {
                          return;
                        }
                        setCurrentPage(1);
                        setItemsPerRow(e);
                        refetchDateFetch({
                          searchQuery: searchQuery,
                          page: 1,
                          limit: e.name,
                          start_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.startDate)
                            : startDate,
                          end_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.endDate)
                            : endDate,
                          status: settlementStatusFilter,
                          schools: schoolId,
                        });
                        setUrlFilters({
                          ...urlFilters,
                          limit: e.name,
                        });
                      }}
                      itemsPerRow={itemsPerRow}
                      className=" justify-start"
                    />
                  </div>
                  <div className="flex flex-wrap">
                    {filters.map(
                      (filter: any, index: number) =>
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
                    {selectSchool !== "" && selectSchool !== null && (
                      <div className=" text-sm m-2  max-w-fit ">
                        <button
                          onClick={() => {
                            setSelectSchool("");
                            setSchoolId([]);
                            setCurrentPage(1);
                            refetchDateFetch({
                              searchQuery: searchQuery,
                              page: 1,
                              limit: itemsPerRow.name,
                              start_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.startDate)
                                : startDate,
                              end_date: isDateRangeIsSelected
                                ? formatDate(selectedRange.endDate)
                                : endDate,
                              status: settlementStatusFilter,
                            });
                          }}
                          className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                        >
                          {selectSchool}{" "}
                          <HiMiniXMark className=" text-lg ml-1" />
                        </button>
                      </div>
                    )}
                    {/* {schoolFilterData.map(
                      (school: any, index: number) =>
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
                        )
                    )} */}
                    {dateRange !== "" && (
                      <div className=" text-sm m-2  max-w-fit ">
                        <button
                          onClick={async () => {
                            setSelectedRange({
                              startDate: startOfDay(new Date()),
                              endDate: endOfDay(new Date()),
                              key: "selection",
                            });
                            if (status || schoolId) {
                              refetchDateFetch({
                                start_date: startDate,
                                end_date: endDate,
                                status: status?.toUpperCase(),
                                schools: schoolId,
                                page: 1,
                                limit: itemsPerRow.name,
                              });
                              setDateRange("");
                              setIsDateRangeIsSelected(false);
                            } else {
                              refetchDateFetch({
                                start_date: startDate,
                                end_date: endDate,
                                status: status?.toUpperCase(),
                                schools: schoolId,
                                page: 1,
                                limit: itemsPerRow.name,
                              });
                              setDateRange("");
                              setIsDateRangeIsSelected(false);
                            }
                          }}
                          className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                        >
                          {dateRange} <HiMiniXMark className=" text-lg ml-1" />
                        </button>
                      </div>
                    )}
                    {selectDays !== 0 && (
                      <div className="bg-[#6687FFCC] text-sm m-2 rounded-lg min-w-max h-10 px-2 flex items-center gap-x-2">
                        <span className="text-white">{dateFilterType}</span>
                        <span>
                          <FaX
                            className="text-white cursor-pointer h-3"
                            onClick={() => {
                              setDateFilterType("");
                              setDateRange("");
                              // setDateRange([
                              //   {
                              //     startDate: new Date(),
                              //     endDate: new Date(""),
                              //     key: "selection",
                              //   },
                              // ]);
                              // setEndDate("");
                              setSelectDays(0);
                              refetch({ startDate });
                            }}
                          />
                        </span>
                      </div>
                    )}
                    {settlementStatusFilter !== "" && (
                      <div className="bg-[#6687FFCC] text-sm m-2 rounded-lg min-w-max h-10 px-2 flex items-center gap-x-2">
                        <span className="text-white">
                          {settlementStatusFilter}
                        </span>
                        <span>
                          <FaX
                            className="text-white cursor-pointer h-3"
                            onClick={() => {
                              setCurrentPage(1);
                              refetchDateFetch({
                                searchQuery: searchQuery,
                                page: 1,
                                limit: itemsPerRow.name,
                                start_date: isDateRangeIsSelected
                                  ? formatDate(selectedRange.startDate)
                                  : startDate,
                                end_date: isDateRangeIsSelected
                                  ? formatDate(selectedRange.endDate)
                                  : endDate,

                                schools: schoolId,
                              });
                              setSettlementStatusFilter("");
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              }
              data={[
                [
                  "Sr.No",
                  "School Name",
                  "Refund ID",
                  "Order ID",
                  "Refund Amount",
                  "Order Amount",
                  "Transaction Amount",
                  "Status",
                  "Created Date",
                  "Updated Date",
                  "Reason",
                ],
                ...refundRequestData.map((data: any, index: any) => [
                  <div>{(currentPage - 1) * itemsPerRow.name + 1 + index}</div>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                  >
                    <div className="truncate max-w-[10rem]">
                      {data.school_name}
                    </div>
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {data._id}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {data.custom_id?.toLowerCase() === "na" ||
                    data.custom_id === null
                      ? data.order_id
                      : data.custom_id}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {amountFormat(data.refund_amount)}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {amountFormat(data.order_amount)}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {amountFormat(data.transaction_amount)}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {data.status !== "APPROVED"
                      ? data.status
                      : "PROCESSED/APPROVED"}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {new Date(Number(data?.createdAt)).toLocaleString("hi")}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    {new Date(Number(data?.updatedAt)).toLocaleString("hi")}
                  </Link>,
                  <Link
                    to={`/payments/transaction-receipt/${data.order_id}?sid=${data.school_id}`}
                    className="truncate"
                  >
                    <div
                      className="truncate max-w-[7rem]"
                      title={data?.reason || "NA"}
                      style={{ position: "relative" }}
                    >
                      {data?.reason || "NA"}
                    </div>
                  </Link>,
                ]),
              ]}
              footer={
                <div className="flex justify-center mt-2 w-full">
                  <Pagination
                    onPageChange={handlePageChange}
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      refundData?.getSubTrusteeRefundRequest?.totalPages,
                    )}
                  />
                </div>
              }
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export default Refund;
