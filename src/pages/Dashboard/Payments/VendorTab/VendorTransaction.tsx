import { useLazyQuery, useQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import {
  // GET_SINGLE_VENDOR_TRANSACTION,
  GET_VENDOR_ALL_SUBTRUSTEE_TRANSACTION,
} from "../../../../Qurries";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  _Table,
  Pagination,
  RowsPerPageSelect,
} from "../../../../components/Table";
import { amountFormat } from "../../../../utils/amountFormat";
import TransactionDateFilter, {
  formatDate,
} from "../../Transaction/components/TransactionDateFilter";
import { CustomDropdownIndicator } from "../../Settlement/Settlement";
import Select from "react-select";
import Institute from "../../Transaction/components/AllFilter/Institute";
import { endOfDay, startOfDay } from "date-fns";
import { HiMiniXMark } from "react-icons/hi2";
import { getStartAndEndOfMonth } from "../../../../utils/getStartAndEndOfMonth";
import { Link } from "react-router-dom";
import { payment_method_map } from "../../Transaction/Transaction";
import { IoSearchOutline } from "react-icons/io5";
import MixFilter from "../../Transaction/components/MixFilter";
import { useTransactionFilters } from "../../../../hooks/useTransactionFilters";
import { getPaymentMode } from "../../../../utils/getPaymentMode";
import { FaX } from "react-icons/fa6";
function VendorTransaction() {
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
  const [transactionData, setTransactionData] = useState<any>([]);
  const [isDateRangeIsSelected, setIsDateRangeIsSelected] = useState(false);
  const [status, setStatus] = useState<any>(null);
  // const [schoolId, setSchoolId] = useState<string>("");
  const [schoolId, setSchoolId] = useState<any>([]);
  const [selectSchool, setSelectSchool] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [selectVendor, setSelectVendor] = useState<string | null>(null);
  const [refetching, setRefetching] = useState(false);
  const { startDate, endDate } = getStartAndEndOfMonth();
  const [urlFilters, setUrlFilters] = useTransactionFilters();
  const [searchFilter, setSearchFilter] = useState<any>("");
  const {
    data: vendorTransactions,
    loading,
    refetch,
  } = useQuery(GET_VENDOR_ALL_SUBTRUSTEE_TRANSACTION, {
    onCompleted(data) {
      setTransactionData(
        data?.getAllSubtrusteeVendorTransaction?.vendorsTransaction,
      );
    },
    variables: {
      page: currentPage,
      limit: itemsPerRow.name,
      startDate: startDate,
      endDate: endDate,
    },
  });

  const [filters, setFilters] = useState<any>({
    paymentMode: {
      credit_card: urlFilters.payment_modes.split(",").includes("credit_card")
        ? true
        : false,
      credit_card_emi: urlFilters.payment_modes
        .split(",")
        .includes("credit_card_emi")
        ? true
        : false,
      upi: urlFilters.payment_modes.split(",").includes("upi") ? true : false,
      wallet: urlFilters.payment_modes.split(",").includes("wallet")
        ? true
        : false,
      pay_later: urlFilters.payment_modes.split(",").includes("pay_later")
        ? true
        : false,
      cardless_emi: urlFilters.payment_modes.split(",").includes("cardless_emi")
        ? true
        : false,
      net_banking: urlFilters.payment_modes.split(",").includes("net_banking")
        ? true
        : false,
      debit_card_emi: urlFilters.payment_modes
        .split(",")
        .includes("debit_card_emi")
        ? true
        : false,
      debit_card: urlFilters.payment_modes.split(",").includes("debit_card")
        ? true
        : false,
      na: urlFilters.payment_modes.split(",").includes("na") ? true : false,
      qr: urlFilters.payment_modes.split(",").includes("qr") ? true : false,
      vba: urlFilters.payment_modes.split(",").includes("vba") ? true : false,
      pos_credit_card: urlFilters.payment_modes
        .split(",")
        .includes("pos_credit_card")
        ? true
        : false,
      pos_debit_card: urlFilters.payment_modes
        .split(",")
        .includes("pos_debit_card")
        ? true
        : false,
      pos_qr: urlFilters.payment_modes.split(",").includes("pos_qr")
        ? true
        : false,
    },
    gateway: {
      EDVIRON_PG: urlFilters.gateway.split(",").includes("EDVIRON_PG")
        ? true
        : false,
      EDVIRON_EASEBUZZ: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_EASEBUZZ")
        ? true
        : false,
      EDVIRON_RAZORPAY: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_RAZORPAY")
        ? true
        : false,
    },
  });

  const refetchDataFetch = async ({
    start_date,
    end_date,
    page,
    status,
    school_id,
    custom_id,
    order_id,
    payment_modes,
    gateway,
    vendor_id,
  }: {
    start_date?: any;
    end_date?: any;
    page?: String;
    status?: String;
    school_id?: string[];
    limit?: String;
    custom_id?: string;
    order_id?: string;
    payment_modes?: string[] | null;
    gateway?: string[] | null;
    vendor_id?: string;
  }) => {
    try {
      setRefetching(true);
      const data = await refetch({
        endDate: end_date,
        startDate: start_date,
        page: currentPage,
        limit: itemsPerRow.name,
        payment_modes: payment_modes ? payment_modes : null,
        gateway,
        status,
        school_id: school_id,
        custom_id,
        order_id,
        vendor_id,
      });
      if (data?.data?.getAllSubtrusteeVendorTransaction?.vendorsTransaction) {
        setRefetching(false);
        setTransactionData(
          data?.data?.getAllSubtrusteeVendorTransaction?.vendorsTransaction,
        );
      }
    } catch (error) {
      if (error) {
        setRefetching(false);
        refetchDataFetch({
          start_date: isDateRangeIsSelected
            ? formatDate(selectedRange.startDate)
            : startDate,
          end_date: isDateRangeIsSelected
            ? formatDate(selectedRange.endDate)
            : endDate,
          status: status?.toUpperCase(),
        });
      }
    }
  };

  console.log("here");

  useEffect(() => {
    refetchDataFetch({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: status?.toUpperCase(),
    });
  }, [status, itemsPerRow, currentPage]);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const removeSchoolFilter = (index: number) => {
    let updatedSchoolIds = schoolId?.filter((_: any, i: any) => i !== index);
    let updatedSchoolFilterData = selectSchool?.filter((_, i) => i !== index);
    console.log(updatedSchoolIds);
    console.log(updatedSchoolFilterData);

    setSchoolId(updatedSchoolIds);
    setSelectSchool(updatedSchoolFilterData);
    refetchDataFetch({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: status?.toUpperCase(),
      school_id:
        updatedSchoolIds && updatedSchoolIds.length > 0
          ? updatedSchoolIds
          : null,
      vendor_id: vendorId || null,
      payment_modes: getPaymentMode(filters.paymentMode, type),
      gateway: getPaymentMode(filters.gateway, type),
    });
  };

  const removeVendorFilter = () => {
    setVendorId(null);
    setSelectVendor(null);
    refetchDataFetch({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : startDate,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : endDate,
      status: status?.toUpperCase(),
      school_id: schoolId && schoolId.length > 0 ? schoolId : null,
      vendor_id: null,
      payment_modes: getPaymentMode(filters.paymentMode, type),
      gateway: getPaymentMode(filters.gateway, type),
    });
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
          heading={"Vendor Transactions"}
          copyContent={[5]}
          srNo={false}
          filter={[searchText]}
          loading={refetching || loading}
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
                        label: "By Order ID",
                        value: "custom_order_id",
                      },
                      { label: "By Edviron Order ID", value: "order_id" },
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
                                .replaceAll("_", " ") === "order id"
                            ? "Edviron Order ID"
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
                              order_id:
                                searchFilter === "order_id" ? searchText : null,
                              custom_id:
                                searchFilter === "custom_order_id"
                                  ? searchText
                                  : null,
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
                      setCurrentPage(1);
                      setUrlFilters({
                        ...urlFilters,
                        start_date: formatDate(selectedRange.startDate),
                        end_date: formatDate(selectedRange.endDate),
                      });
                      refetchDataFetch({
                        start_date: formatDate(selectedRange.startDate),
                        end_date: formatDate(selectedRange.endDate),
                        status: status?.toUpperCase(),
                        school_id:
                          schoolId && schoolId.length > 0 ? schoolId : null,
                        payment_modes: getPaymentMode(
                          filters.paymentMode,
                          type,
                        ),
                        gateway: getPaymentMode(filters.gateway, type),
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
                        { label: "SUCCESS", value: "SUCCESS" },
                        { label: "PENDING", value: "PENDING" },
                        { label: "FAILED", value: "FAILED" },
                        { label: "USER DROPPED", value: "USER_DROPPED" },
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
                      isSearchable={false}
                      onChange={(e: any) => {
                        setStatus(e.value);
                        setCurrentPage(1);
                        // refetchDataFetch({
                        //   start_date: isDateRangeIsSelected
                        //     ? formatDate(selectedRange.startDate)
                        //     : startDate,
                        //   end_date: isDateRangeIsSelected
                        //     ? formatDate(selectedRange.endDate)
                        //     : endDate,
                        //   status: e.value?.toUpperCase(),
                        //   isCustomSearch: isCustomSearch,
                        //   searchFilter: searchFilter,
                        //   searchParams: searchText,
                        //   school_id: selectSchool === "" ? null : schoolId,
                        //   payment_modes: getPaymentMode(
                        //     filters.paymentMode,
                        //     type
                        //   ),
                        //   isQrCode: getPaymentMode(
                        //     filters.paymentMode,
                        //     type
                        //   )?.includes("qr"),
                        // });
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
                          padding: "4px",
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
                  <div className="w-full">
                    <MixFilter
                      setSelectSchool={(id: any) => {
                        const updatedSchoolIds = [...selectSchool, id];
                        setSelectSchool(updatedSchoolIds);
                      }}
                      setSchoolId={(id: any) => {
                        const updatedSchoolIds = [...schoolId, id];
                        setSchoolId(updatedSchoolIds);
                      }}
                      setSelectVendor={(vendorName: any) => {
                        setSelectVendor(vendorName);
                      }}
                      setVendorId={(newVendorId: any) => {
                        setVendorId(newVendorId);
                      }}
                      // setSchoolId={setSchoolId}
                      paymentModes={Object.keys(filters.paymentMode).filter(
                        (key) => filters.paymentMode[key],
                      )}
                      gateway={Object.keys(filters.gateway).filter(
                        (key) => filters.gateway[key],
                      )}
                      setType={setType}
                      onCancel={() => {
                        setUrlFilters({
                          ...urlFilters,
                          payment_modes: null,
                          gateway: null,
                        });
                        refetchDataFetch({
                          start_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.startDate)
                            : startDate,
                          end_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.endDate)
                            : endDate,
                          status: status?.toUpperCase(),
                          school_id:
                            schoolId && schoolId.length > 0 ? schoolId : null,
                          vendor_id: vendorId || null,
                          gateway: null,
                        });
                      }}
                      onApply={() => {
                        setCurrentPage(1);
                        setUrlFilters({
                          ...urlFilters,
                          school_id:
                            schoolId && schoolId.length > 0 ? schoolId : null,
                          school_name: selectSchool || null,
                          vendor_id: vendorId || null,
                          vendor_name: selectVendor || null,
                          payment_modes: getPaymentMode(
                            filters.paymentMode,
                            type,
                          ),
                          gateway: getPaymentMode(filters.gateway, type),
                        });
                        refetchDataFetch({
                          start_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.startDate)
                            : startDate,
                          end_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.endDate)
                            : endDate,
                          status: status?.toUpperCase(),
                          school_id:
                            schoolId && schoolId.length > 0 ? schoolId : null,
                          vendor_id: vendorId || null,
                          // school_id: selectSchool === "" ? null : schoolId,
                          payment_modes: getPaymentMode(
                            filters.paymentMode,
                            type,
                          )?.includes("qr")
                            ? null
                            : getPaymentMode(filters.paymentMode, type),
                          gateway: getPaymentMode(filters.gateway, type),
                        });
                      }}
                      filters={filters}
                      setFilters={setFilters}
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
                            // checking
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            payment_modes: null,
                            gateway: null,
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
                        refetchDataFetch({
                          start_date: startDate,
                          end_date: endDate,
                          status: status?.toUpperCase(),
                          school_id:
                            schoolId && schoolId.length > 0 ? schoolId : null,
                          vendor_id: vendorId || null,
                          payment_modes: getPaymentMode(
                            filters.paymentMode,
                            type,
                          ),
                          gateway: getPaymentMode(filters.gateway, type),
                        });
                        setDateRange("");
                        setIsDateRangeIsSelected(false);
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {dateRange} <HiMiniXMark className=" text-lg ml-1" />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                  {selectSchool.map(
                    (school: any, index: number) =>
                      school !== null && (
                        <div
                          key={index}
                          className="bg-[#6687FFCC] text-sm m-2 rounded-lg px-2 h-10 flex items-center gap-x-2 min-w-max max-w-[8em] sm:max-w-[10em] md:max-w-[12em] lg:max-w-[14em] xl:max-w-[16em]"
                        >
                          <span className="text-white truncate pl-2">
                            {school}
                          </span>
                          <span>
                            <FaX
                              className="text-white cursor-pointer h-3"
                              onClick={(e) => {
                                e.stopPropagation(); // 🛑 prevent parent clicks
                                removeSchoolFilter(index);
                              }}
                            />
                          </span>
                        </div>
                      ),
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
                  {selectVendor && (
                    <div className="bg-[#6687FFCC] text-sm m-2 rounded-lg px-2 h-10 flex items-center gap-x-2 min-w-max max-w-[8em] sm:max-w-[10em] md:max-w-[12em] lg:max-w-[14em] xl:max-w-[16em]">
                      <span className="text-white truncate pl-2">
                        {selectVendor}
                      </span>
                      <span>
                        <FaX
                          className="text-white cursor-pointer h-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVendorFilter();
                          }}
                        />
                      </span>
                    </div>
                  )}
                </div>
                {/* {selectSchool !== "" && (
                  <div className=" text-sm m-2  max-w-fit ">
                    <button
                      onClick={() => {
                        if (status || isDateRangeIsSelected || type) {
                          refetchDataFetch({
                            start_date: formatDate(selectedRange.startDate),
                            end_date: formatDate(selectedRange.endDate),
                            status: status?.toUpperCase(),
                            school_id: schoolId && schoolId.length>0 ? schoolId  : null,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type
                            ),
                            gateway: getPaymentMode(filters.gateway, type),
                          });
                          // setSelectSchool("");
                          // setSchoolId("");
                        } else {
                          refetchDataFetch({
                            start_date: startDate,
                            end_date: endDate,
                          });
                          // setSelectSchool("");
                          // setSchoolId("");
                        }
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {selectSchool} <HiMiniXMark className=" text-lg ml-1" />
                    </button>
                  </div>
                )} */}
                {status && (
                  <div className=" text-sm m-2  max-w-fit ">
                    <button
                      onClick={async () => {
                        setCurrentPage(1);
                        if (selectSchool || isDateRangeIsSelected) {
                          refetchDataFetch({
                            start_date: formatDate(selectedRange.startDate),
                            end_date: formatDate(selectedRange.endDate),
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            ),
                            gateway: getPaymentMode(filters.gateway, type),
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
              "Name",
              "School name",
              "Date & Time",
              "Order ID",
              "Transaction Amt",
              "Vendor Order Amt",
              "Payment Method",
              "Status",
              "Student Name",
              "Student Id",
              "Gateway",
            ],
            ...([
              ...transactionData?.map((d: any, index: number) => {
                return {
                  ...d,
                  payment_method:
                    d.payment_method === "" || d.payment_method === null
                      ? "NA"
                      : payment_method_map[d.payment_method],
                  serialNumber:
                    (currentPage - 1) * itemsPerRow.name + 1 + index,
                };
              }),
            ]
              // .filter((d: any) => {
              //   const arr = [
              //     d.collect_id,
              //     d.custom_id,
              //     d.school_id,
              //     d.name,
              //   ].join(",");
              //   return arr.toLowerCase().includes(searchText.toLowerCase());
              // })
              .map((transaction: any, index: number) => [
                <div>{transaction?.serialNumber}</div>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div
                    // onClick={(e) => {
                    //   console.log(transaction)
                    //   // e.preventDefault(); // Prevents any unwanted navigation issues
                    //   // handelReciept(transaction); // Correctly passing the transaction object
                    // }}
                    className="truncate"
                    key={transaction.orderID}
                  >
                    {transaction?.name}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div className="truncate">
                    {transaction?.schoolName || "N/A"}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div className=" truncate">
                    {new Date(transaction?.createdAt).toLocaleString("hi")}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>
                    {transaction.custom_order_id
                      ? transaction?.custom_order_id
                      : transaction?.collect_id}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>{amountFormat(transaction.transaction_amount)}</div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>{amountFormat(transaction.amount)}</div>
                </Link>,

                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>
                    {transaction.payment_method !== null
                      ? transaction.payment_method
                      : "NA"}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div
                    className={`flex items-center capitalize ${
                      transaction.status.toLowerCase() === "success"
                        ? "text-[#04B521]"
                        : transaction.status.toLowerCase() === "failure" ||
                            transaction.status.toLowerCase() === "failed"
                          ? "text-[#E54F2F]"
                          : transaction.status.toLowerCase() === "pending"
                            ? "text-yellow-400"
                            : transaction.status.toLowerCase() ===
                                "USER_DROPPED"
                              ? "text-yellow-400"
                              : ""
                    }`}
                  >
                    {transaction.status.replace(/_/g, " ")}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>
                    {(() => {
                      try {
                        return (
                          JSON.parse(transaction?.additional_data)
                            ?.student_details?.student_name || "N/A"
                        );
                      } catch (error) {
                        return "N/A";
                      }
                    })()}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>
                    {(() => {
                      try {
                        return (
                          JSON.parse(transaction?.additional_data)
                            ?.student_details?.student_id || "N/A"
                        );
                      } catch (error) {
                        return "N/A";
                      }
                    })()}
                  </div>
                </Link>,
                <Link
                  state={{
                    collect_id: transaction?.collect_id,
                    amount: transaction?.amount,
                    schoolName: transaction?.name,
                  }}
                  to={`/payments/vendor-transaction-receipt/`}
                >
                  <div>
                    {transaction.gateway === "EDVIRON_PG"
                      ? "Cashfree"
                      : transaction.gateway}
                  </div>
                </Link>,
              ]) || []),
          ]}
          footer={
            <div className="flex justify-center items-center">
              <Pagination
                currentPage={currentPage}
                totalPages={
                  vendorTransactions?.getAllSubtrusteeVendorTransaction
                    ?.totalPages
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

export default VendorTransaction;
