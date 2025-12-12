import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  _Table,
  Pagination,
  RowsPerPageSelect,
} from "../../../../components/Table";
import { useQuery } from "@apollo/client";
import { GET_ALL_VENDOR_SUBTRUSTEE_SETTLEMENT } from "../../../../Qurries";
import { amountFormat } from "../../../../utils/amountFormat";
import { getStartAndEndOfMonth } from "../../../../utils/getStartAndEndOfMonth";
import TransactionDateFilter, {
  formatDate,
} from "../../Transaction/components/TransactionDateFilter";
import { HiMiniXMark } from "react-icons/hi2";
import { endOfDay, startOfDay } from "date-fns";
import Institute from "../../Transaction/components/AllFilter/Institute";
import Vendor from "../../Transaction/components/AllFilter/Vendor";
import { CustomDropdownIndicator } from "../../Settlement/Settlement";
import Select from "react-select";
import { IoSearchOutline } from "react-icons/io5";
function VendorSettlement() {
  const [searchText, setSearchText] = useState<any>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerRow, setItemsPerRow] = useState({ name: 10 });
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [type, setType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [settlementData, setSettlementData] = useState<any>([]);
  const [isDateRangeIsSelected, setIsDateRangeIsSelected] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<any>([]);
  const [selectSchool, setSelectSchool] = useState("");
  const [refetching, setRefetching] = useState(false);
  const { startDate, endDate } = getStartAndEndOfMonth();
  const [searchFilter, setSearchFilter] = useState<any>("");
  const [selectVendor, setSelectVendor] = useState("");
  const [vendorId, setVendorId] = useState<any>(null);

  const { data, loading, refetch } = useQuery(
    GET_ALL_VENDOR_SUBTRUSTEE_SETTLEMENT,
    {
      onCompleted(data) {
        if (data?.getAllSubtrusteeVendorSettlementReport?.vendor_settlements) {
          setSettlementData(
            data?.getAllSubtrusteeVendorSettlementReport?.vendor_settlements,
          );
        }
      },
      variables: {
        page: currentPage,
        limit: itemsPerRow.name,
        startDate: startDate,
        endDate: endDate,
      },
    },
  );

  const refetchDataFetch = async ({
    start_date,
    end_date,
    page,
    status,
    school_id,
    vendor_id,
    utr,
  }: {
    start_date?: any;
    end_date?: any;
    page?: String;
    status?: String;
    school_id?: string[] | null;
    limit?: String;
    vendor_id?: string;
    utr?: string;
  }) => {
    try {
      setRefetching(true);
      const data = await refetch({
        end_date,
        start_date,
        page: currentPage,
        limit: itemsPerRow.name,
        status,
        school_id,
        vendor_id,
        utr,
      });
      if (
        data?.data?.getAllSubtrusteeVendorSettlementReport?.vendor_settlements
      ) {
        setRefetching(false);
        setSettlementData(
          data?.data?.getAllSubtrusteeVendorSettlementReport
            ?.vendor_settlements,
        );
      }
    } catch (error) {}
  };

  useEffect(() => {
    refetchDataFetch({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: status?.toUpperCase(),
      school_id: schoolId && schoolId.length > 0 ? schoolId : [],
      vendor_id: searchFilter === "vendor_id" ? searchText : vendorId,
      utr: searchFilter === "utr" ? searchText : null,
    });
  }, [status, schoolId, itemsPerRow, currentPage, vendorId]);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <AiOutlineLoading3Quarters className=" animate-spin text-2xl" />
        </div>
      ) : (
        <_Table
          perPage={false}
          exportBtn={true}
          heading={"Settlements"}
          copyContent={[10]}
          filter={[searchText]}
          loading={loading || refetching}
          searchBox={
            <div className="w-full ">
              <div className="flex xl:!flex-row flex-col justify-between gap-2  w-full xl:items-center items-start mb-2">
                <div className="bg-[#EEF1F6] py-3 items-center flex  px-3 xl:max-w-md max-w-[34rem] w-full rounded-lg">
                  <input
                    className="text-xs pr-2 bg-transparent focus:outline-none w-full placeholder:font-normal"
                    type="text"
                    value={searchText}
                    placeholder="Search(Order ID...)"
                    onChange={(e) => {
                      setSearchText(e.target.value);
                    }}
                  />
                  {searchFilter !== "" && searchText.length > 3 && (
                    <HiMiniXMark
                      onClick={async () => {
                        setSearchFilter("");
                        setSearchText("");
                        refetchDataFetch({
                          start_date: startDate,
                          end_date: endDate,
                        });
                      }}
                      className="text-[#1E1B59] cursor-pointer text-md mr-2 shrink-0"
                    />
                  )}
                  <Select
                    className="border-l-2 border-gray-400"
                    options={[
                      {
                        label: "By UTR",
                        value: "utr",
                      },
                      { label: "By Vendor ID", value: "vendor_id" },
                    ]}
                    isSearchable={false}
                    components={{
                      DropdownIndicator: CustomDropdownIndicator,
                      IndicatorSeparator: () => null,
                    }}
                    onChange={(e: any) => {
                      setSearchFilter(e.value.toLowerCase());
                      setCurrentPage(1);
                    }}
                    placeholder={
                      <div className="text-[#1E1B59] -mt-1 capitalize text-[10px]">
                        {searchFilter === ""
                          ? "filter by"
                          : searchFilter
                                .toString()
                                .toLowerCase()
                                .replaceAll("_", " ") === "utr"
                            ? "By UTR"
                            : searchFilter
                                .toString()
                                .toLowerCase()
                                .replaceAll("_", " ")}
                      </div>
                    }
                    value={searchFilter}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "transparent",
                        height: "20px",
                        border: "none",
                        boxShadow: "none",
                        cursor: "pointer",
                        minHeight: "10px",
                        padding: "0px",
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        height: "20px",
                        width: "8rem",
                        padding: "0 8px",
                      }),
                      input: (provided) => ({
                        ...provided,
                        margin: "0",
                        padding: "0",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        margin: "0",
                        padding: "0",
                        lineHeight: "20px",
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        lineHeight: "20px",
                      }),
                      indicatorsContainer: (provided) => ({
                        ...provided,
                        height: "20px",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        fontSize: "10px",
                        cursor: "pointer",
                      }),
                    }}
                  />

                  <div className="w-10 z-50 shrink-0 flex justify-center items-center">
                    {searchText.length > 3 && refetching ? (
                      <AiOutlineLoading3Quarters className="text-xs animate-spin" />
                    ) : (
                      <IoSearchOutline
                        onClick={() => {
                          if (searchText.length > 3 && searchFilter !== "") {
                            setCurrentPage(1);
                            refetchDataFetch({
                              vendor_id:
                                searchFilter === "vendor_id"
                                  ? searchText
                                  : null,
                              utr: searchFilter === "utr" ? searchText : null,
                            });
                          }
                        }}
                        className=" cursor-pointer text-edvion_black text-opacity-50 text-md "
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center flex-1 w-full max-w-[34rem]">
                  <TransactionDateFilter
                    setType={setDateRange}
                    type={dateRange}
                    refetch={() => {
                      refetchDataFetch({
                        start_date: formatDate(selectedRange.startDate),
                        end_date: formatDate(selectedRange.endDate),
                        school_id:
                          schoolId && schoolId.length > 0 ? schoolId : [],
                      });
                    }}
                    selectedRange={selectedRange}
                    setSelectedRange={setSelectedRange}
                    setIsDateRangeIsSelected={setIsDateRangeIsSelected}
                  />
                  <div className="w-full ml-2">
                    <Institute
                      setSelectSchool={setSelectSchool}
                      setSchoolId={setSchoolId}
                    />
                  </div>

                  <div className="w-full ml-2">
                    <Vendor
                      setSelectVendor={setSelectVendor}
                      setVendorId={setVendorId}
                      menuIsOpen={undefined}
                      schoolId={null}
                    />
                  </div>
                </div>
              </div>
              <div>
                <RowsPerPageSelect
                  setItemsPerRow={setItemsPerRow}
                  itemsPerRow={itemsPerRow}
                  className=" justify-start"
                />
              </div>
              <div className="flex items-center">
                {type !== "" && (
                  <div className=" text-sm m-2  max-w-fit ">
                    <button
                      onClick={async () => {
                        setSelectedRange({
                          startDate: startOfDay(new Date()),
                          endDate: endOfDay(new Date()),
                          key: "selection",
                        });
                        if (status || schoolId) {
                          setType("");
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : [],
                          });

                          setIsDateRangeIsSelected(false);
                        } else {
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                          });
                          setType("");
                          setIsDateRangeIsSelected(false);
                        }
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {type} <HiMiniXMark className=" text-lg ml-1" />
                    </button>
                  </div>
                )}
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
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : [],
                          });
                          setDateRange("");
                          setIsDateRangeIsSelected(false);
                        } else {
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
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
                {selectSchool !== "" && (
                  <div className=" text-sm m-2  max-w-fit ">
                    <button
                      onClick={() => {
                        if (status || isDateRangeIsSelected || type) {
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: status?.toUpperCase(),
                            vendor_id: vendorId,
                          });
                          setSelectSchool("");
                          setSchoolId("");
                        } else {
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                            vendor_id: vendorId,
                          });
                          setSelectSchool("");
                          setSchoolId("");
                        }
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {selectSchool} <HiMiniXMark className=" text-lg ml-1" />
                    </button>
                  </div>
                )}
                {selectVendor !== "" && (
                  <div className=" text-sm m-2  max-w-fit ">
                    <button
                      onClick={() => {
                        if (
                          status ||
                          isDateRangeIsSelected ||
                          type ||
                          selectSchool
                        ) {
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : [],
                          });
                          setSelectVendor("");
                          setVendorId(null);
                        } else {
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                          });
                          setSelectVendor("");
                          setVendorId(null);
                        }
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {selectVendor} <HiMiniXMark className=" text-lg ml-1" />
                    </button>
                  </div>
                )}
                {status && (
                  <div className=" text-sm m-2  max-w-fit ">
                    <button
                      onClick={async () => {
                        setCurrentPage(1);
                        if (selectSchool || isDateRangeIsSelected) {
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : [],
                          });
                          setStatus(null);
                        } else {
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                          });
                          setStatus(null);
                        }
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {status} <HiMiniXMark className=" text-lg ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
          data={[
            [
              "Sr.No",
              "Institute Name",
              "Vendor Name",
              "Settlement Amount",
              "Adjustment",
              "Payment Amount",
              "From",
              "Till",
              "Status",
              "UTR No",
              "Settlement Date",
            ],

            ...([
              ...settlementData.map((d: any, index: number) => {
                return {
                  ...d,
                  serialNumber:
                    (currentPage - 1) * itemsPerRow.name + 1 + index,
                };
              }),
            ].map((settlement: any, index: number) => [
              <div className="truncate">{settlement.serialNumber}</div>,
              <div className="truncate">{settlement?.school_name}</div>,
              <div className="truncate">{settlement?.vendor_name}</div>,
              <div className=" truncate">
                {amountFormat(settlement?.settlement_amount)}
              </div>,
              <div className=" truncate">{settlement?.adjustment}</div>,
              <div className=" truncate">
                {amountFormat(settlement?.net_settlement_amount)}
              </div>,

              <div className=" truncate">
                {new Date(settlement?.payment_from).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </div>,
              <div className=" truncate">
                {new Date(settlement?.payment_till).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </div>,
              <div className=" truncate">{settlement?.status}</div>,
              <div
                className=" truncate overflow-hidden"
                style={{ maxWidth: "5em" }}
                title={settlement?.utr}
              >
                {settlement?.utr}
              </div>,
              <div className="truncate">
                {new Date(settlement?.settled_on).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                })}
              </div>,
            ]) || []),
          ]}
          footer={
            <div className="flex justify-center items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={
                  data?.getAllSubtrusteeVendorSettlementReport?.totalPages
                }
                onPageChange={handlePageChange}
              />
            </div>
          }
        />
      )}
    </div>
  );
}

export default VendorSettlement;
