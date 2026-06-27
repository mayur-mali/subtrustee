import { useQuery } from "@apollo/client";
import React, { useEffect, useState, useRef } from "react";
import { GET_VENDOR_ALL_SUBTRUSTEE_TRANSACTION } from "../../../../Qurries";
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
import { endOfDay, startOfDay } from "date-fns";
import { HiMiniXMark } from "react-icons/hi2";
import { getStartAndEndOfMonth } from "../../../../utils/getStartAndEndOfMonth";
import { Link, useLocation } from "react-router-dom";
import { payment_method_map } from "../../Transaction/Transaction";
import { IoSearchOutline } from "react-icons/io5";
import MixFilter from "../../Transaction/components/MixFilter";
import { useTransactionFilters } from "../../../../hooks/useTransactionFilters";
import { getPaymentMode } from "../../../../utils/getPaymentMode";
import { FaX } from "react-icons/fa6";
import axios from "axios";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { GET_USER } from "../../../../Qurries";
import { GET_ALL_SCHOOLS_QUERY_FOR_REPORT } from "../../../../Qurries";

function VendorTransaction() {
  const location = useLocation();
  const [urlFilters, setUrlFilters] = useTransactionFilters();
  const [searchText, setSearchText] = useState<any>(urlFilters.search || "");
  const [currentPage, setCurrentPage] = useState(Number(urlFilters.page) || 1);
  const [itemsPerRow, setItemsPerRow] = useState({
    name: Number(urlFilters.limit) || 10,
  });
  const [selectedRange, setSelectedRange] = useState({
    startDate: urlFilters.start_date
      ? new Date(urlFilters.start_date)
      : new Date(),
    endDate: urlFilters.end_date ? new Date(urlFilters.end_date) : new Date(),
    key: "selection",
  });
  const [type, setType] = useState("");
  const [dateRange, setDateRange] = useState(
    urlFilters.date_filter_type ||
      (urlFilters.start_date ? "Custom Date" : "Today"),
  );

  // Sync page changes from URL to state
  useEffect(() => {
    const pageFromUrl = Number(urlFilters.page) || 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [urlFilters.page]);

  // Sync limit changes from URL to state
  useEffect(() => {
    const limitFromUrl = Number(urlFilters.limit) || 10;
    if (limitFromUrl !== itemsPerRow.name) {
      setItemsPerRow({ name: limitFromUrl });
    }
  }, [urlFilters.limit]);

  // Sync URL filters back to states on change
  useEffect(() => {
    if (urlFilters.status !== undefined && urlFilters.status !== status) {
      setStatus(urlFilters.status || null);
    }
  }, [urlFilters.status]);

  useEffect(() => {
    const nextSchoolId = urlFilters.school_id
      ? urlFilters.school_id.split(",")
      : [];
    if (
      urlFilters.school_id !== undefined &&
      JSON.stringify(nextSchoolId) !== JSON.stringify(schoolId)
    ) {
      setSchoolId(nextSchoolId);
      setSelectSchool(
        urlFilters.school_name ? urlFilters.school_name.split(",") : [],
      );
    }
  }, [urlFilters.school_id, urlFilters.school_name]);

  useEffect(() => {
    if (
      urlFilters.vendor_id !== undefined &&
      urlFilters.vendor_id !== vendorId
    ) {
      setVendorId(urlFilters.vendor_id || null);
      setSelectVendor(urlFilters.vendor_name || null);
    }
  }, [urlFilters.vendor_id, urlFilters.vendor_name]);

  useEffect(() => {
    if (urlFilters.search !== undefined && urlFilters.search !== searchText) {
      setSearchText(urlFilters.search || "");
    }
  }, [urlFilters.search]);

  useEffect(() => {
    if (
      urlFilters.start_date !== undefined &&
      urlFilters.start_date !==
        (selectedRange.startDate ? formatDate(selectedRange.startDate) : "")
    ) {
      setSelectedRange({
        startDate: urlFilters.start_date
          ? new Date(urlFilters.start_date)
          : new Date(),
        endDate: urlFilters.end_date
          ? new Date(urlFilters.end_date)
          : new Date(),
        key: "selection",
      });
      setIsDateRangeIsSelected(
        !!(urlFilters.start_date && urlFilters.end_date),
      );
      setDateRange(
        urlFilters.date_filter_type ||
          (urlFilters.start_date ? "Custom Date" : "Today"),
      );
    }
  }, [urlFilters.start_date, urlFilters.end_date, urlFilters.date_filter_type]);

  const [transactionData, setTransactionData] = useState<any>([]);
  const isFirstRenderSync = useRef(true);
  const [isDateRangeIsSelected, setIsDateRangeIsSelected] = useState(
    !!(urlFilters.start_date && urlFilters.end_date),
  );
  const [status, setStatus] = useState<any>(urlFilters.status || null);
  const [vendorAmountDetails, setVendorAmountDetails] = useState<any>(null);
  const [schoolId, setSchoolId] = useState<any>(
    urlFilters.school_id ? urlFilters.school_id.split(",") : [],
  );
  const [selectSchool, setSelectSchool] = useState<any[]>(
    urlFilters.school_name ? urlFilters.school_name.split(",") : [],
  );
  const [vendorId, setVendorId] = useState<string | null>(
    urlFilters.vendor_id || null,
  );
  const [selectVendor, setSelectVendor] = useState<string | null>(
    urlFilters.vendor_name || null,
  );
  const [refetching, setRefetching] = useState(false);
  const { startDate, endDate } = getStartAndEndOfMonth();
  const todayFormatted = formatDate(new Date());
  const [searchFilter, setSearchFilter] = useState<any>(
    urlFilters.search_filter || "",
  );

  const showCustomDate =
    isDateRangeIsSelected && urlFilters.start_date && urlFilters.end_date;

  // ── mirrors Transaction: initialise every checkbox from urlFilters ──
  const [filters, setFilters] = useState<any>({
    paymentMode: {
      credit_card: urlFilters.payment_modes.split(",").includes("credit_card"),
      credit_card_emi: urlFilters.payment_modes
        .split(",")
        .includes("credit_card_emi"),
      upi: urlFilters.payment_modes.split(",").includes("upi"),
      wallet: urlFilters.payment_modes.split(",").includes("wallet"),
      pay_later: urlFilters.payment_modes.split(",").includes("pay_later"),
      cardless_emi: urlFilters.payment_modes
        .split(",")
        .includes("cardless_emi"),
      net_banking: urlFilters.payment_modes.split(",").includes("net_banking"),
      debit_card_emi: urlFilters.payment_modes
        .split(",")
        .includes("debit_card_emi"),
      debit_card: urlFilters.payment_modes.split(",").includes("debit_card"),
      na: urlFilters.payment_modes.split(",").includes("na"),
      qr: urlFilters.payment_modes.split(",").includes("qr"),
      vba: urlFilters.payment_modes.split(",").includes("vba"),
      pos_credit_card: urlFilters.payment_modes
        .split(",")
        .includes("pos_credit_card"),
      pos_debit_card: urlFilters.payment_modes
        .split(",")
        .includes("pos_debit_card"),
      pos_qr: urlFilters.payment_modes.split(",").includes("pos_qr"),
    },
    gateway: {
      PHONEPE: urlFilters.gateway.split(",").includes("PHONEPE"),
      HDFC: urlFilters.gateway.split(",").includes("HDFC"),
      EDVIRON_PG: urlFilters.gateway.split(",").includes("EDVIRON_PG"),
      EDVIRON_PAY_U: urlFilters.gateway.split(",").includes("EDVIRON_PAY_U"),
      EDVIRON_CCAVENUE: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_CCAVENUE"),
      EDVIRON_EASEBUZZ: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_EASEBUZZ"),
      EDVIRON_HDFC_RAZORPAY: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_HDFC_RAZORPAY"),
      SMART_GATEWAY: urlFilters.gateway.split(",").includes("SMART_GATEWAY"),
      PAYTM_POS: urlFilters.gateway.split(",").includes("PAYTM_POS"),
      MOSAMBEE_POS: urlFilters.gateway.split(",").includes("MOSAMBEE_POS"),
      EDVIRON_NTTDATA: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_NTTDATA"),
      EDVIRON_WORLDLINE: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_WORLDLINE"),
      EDVIRON_RAZORPAY: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_RAZORPAY"),
      EDVIRON_RAZORPAY_SEAMLESS: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_RAZORPAY_SEAMLESS"),
      EDVIRON_GATEPAY: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_GATEPAY"),
      EDVIRON_PAY: urlFilters.gateway.split(",").includes("EDVIRON_PAY"),
    },
  });

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
      startDate: todayFormatted,
      endDate: todayFormatted,
      order_id:
        urlFilters.search_filter === "order_id" ? urlFilters.search : null,
      custom_id:
        urlFilters.search_filter === "custom_order_id"
          ? urlFilters.search
          : null,
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
    isQrCode,
    gateway,
    vendor_id,
  }: {
    start_date?: any;
    end_date?: any;
    page?: string;
    status?: string;
    school_id?: string[] | null;
    limit?: string;
    custom_id?: string;
    order_id?: string;
    payment_modes?: string[] | null;
    isQrCode?: boolean;
    gateway?: string[] | null;
    vendor_id?: string | null;
  }) => {
    try {
      setRefetching(true);
      const data = await refetch({
        endDate: end_date,
        startDate: start_date,
        page: currentPage,
        limit: itemsPerRow.name,
        // mirror Transaction: pass null for payment_modes when QR is active
        payment_modes: isQrCode ? null : payment_modes,
        isQRCode: isQrCode,
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
          data.data.getAllSubtrusteeVendorTransaction.vendorsTransaction,
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
      start_date:
        isDateRangeIsSelected &&
        selectedRange?.startDate &&
        selectedRange?.endDate
          ? formatDate(selectedRange.startDate)
          : todayFormatted,
      end_date:
        isDateRangeIsSelected &&
        selectedRange?.startDate &&
        selectedRange?.endDate
          ? formatDate(selectedRange.endDate)
          : todayFormatted,
      status: status ? status.toUpperCase() : null,
      school_id: schoolId && schoolId.length > 0 ? schoolId : null,
      payment_modes:
        Object.keys(filters.paymentMode).filter(
          (key) => filters.paymentMode[key],
        ).length > 0
          ? Object.keys(filters.paymentMode).filter(
              (key) => filters.paymentMode[key],
            )
          : null,
      isQrCode: getPaymentMode(filters.paymentMode, type)?.includes("qr"),
      gateway: getPaymentMode(filters.gateway, type),
      vendor_id: vendorId || null,
    });

    // Sync all state changes back to URL (skip initial mount to avoid parameter overwrites)
    if (isFirstRenderSync.current) {
      isFirstRenderSync.current = false;
      return;
    }
    setUrlFilters({
      ...urlFilters,
      page: currentPage,
      limit: itemsPerRow.name,
      status: status || "",
      school_id: Array.isArray(schoolId) ? schoolId.join(",") : schoolId || "",
      school_name: Array.isArray(selectSchool)
        ? selectSchool.join(",")
        : selectSchool || "",
      vendor_id: vendorId || "",
      vendor_name: selectVendor || "",
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : "",
      end_date: isDateRangeIsSelected ? formatDate(selectedRange.endDate) : "",
      date_filter_type: dateRange || "",
      search: searchText || "",
      search_filter: searchFilter || "",
    });
  }, [
    currentPage,
    itemsPerRow,
    status,
    schoolId,
    selectSchool,
    vendorId,
    selectVendor,
    isDateRangeIsSelected,
    selectedRange,
    dateRange,
    searchText,
    searchFilter,
  ]);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const removeSchoolFilter = (index: number) => {
    const updatedSchoolIds = schoolId?.filter((_: any, i: any) => i !== index);
    const updatedSchoolFilterData = selectSchool?.filter((_, i) => i !== index);
    setSchoolId(updatedSchoolIds);
    setSelectSchool(updatedSchoolFilterData);
    refetchDataFetch({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : todayFormatted,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : todayFormatted,
      status: status?.toUpperCase(),
      school_id:
        updatedSchoolIds && updatedSchoolIds.length > 0
          ? updatedSchoolIds
          : null,
      vendor_id: vendorId || null,
      payment_modes: getPaymentMode(filters.paymentMode, type)?.includes("qr")
        ? null
        : getPaymentMode(filters.paymentMode, type),
      isQrCode: getPaymentMode(filters.paymentMode, type)?.includes("qr"),
      gateway: getPaymentMode(filters.gateway, type),
    });
  };

  const removeVendorFilter = () => {
    setVendorId(null);
    setSelectVendor(null);
    refetchDataFetch({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : todayFormatted,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : todayFormatted,
      status: status?.toUpperCase(),
      school_id: schoolId && schoolId.length > 0 ? schoolId : null,
      vendor_id: null,
      payment_modes: getPaymentMode(filters.paymentMode, type)?.includes("qr")
        ? null
        : getPaymentMode(filters.paymentMode, type),
      isQrCode: getPaymentMode(filters.paymentMode, type)?.includes("qr"),
      gateway: getPaymentMode(filters.gateway, type),
    });
  };

  const { data: user_data } = useQuery(GET_USER);
  const { data: schoolsData, loading: schoolsLoading } = useQuery(
    GET_ALL_SCHOOLS_QUERY_FOR_REPORT,
    { fetchPolicy: "network-only" },
  );

  const GET_VENDOR_TRANSACTION_AMOUNT = async (
    start_date: string,
    end_date: string,
    trustee_id: string,
    school_ids: string[],
    status: string,
    vendor_id?: string | null,
    mode?: string[] | null,
    gateway?: string[] | null,
  ) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        `${import.meta.env.VITE_PAYMENT_BACKEND_URL}/edviron-pg/get-vendor-transaction-report-batched`,
        {
          trustee_id,
          school_ids,
          start_date,
          end_date,
          status,
          vendor_id,
          mode,
          gateway,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        setVendorAmountDetails(response.data.transactions[0]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (schoolsLoading) return;
    if (!user_data?.getSubTrusteeQuery?.trustee_id) return;

    GET_VENDOR_TRANSACTION_AMOUNT(
      isDateRangeIsSelected &&
        selectedRange?.startDate &&
        selectedRange?.endDate
        ? formatDate(selectedRange.startDate)
        : todayFormatted,
      isDateRangeIsSelected &&
        selectedRange?.startDate &&
        selectedRange?.endDate
        ? formatDate(selectedRange.endDate)
        : todayFormatted,
      user_data.getSubTrusteeQuery.trustee_id,
      schoolId && schoolId.length > 0
        ? schoolId
        : schoolsData?.getAllSubTrusteeSchools?.map(
            (school: any) => school.school_id,
          ) || [],
      status ? status.toUpperCase() : "SUCCESS",
      vendorId,
      getPaymentMode(filters.paymentMode, type),
      getPaymentMode(filters.gateway, type),
    );
  }, [
    schoolsLoading,
    schoolsData,
    user_data,
    type,
    status,
    vendorId,
    selectedRange,
    filters,
    isDateRangeIsSelected,
    startDate,
    endDate,
    schoolId,
  ]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
        </div>
      ) : (
        <>
          <h2 className="text-[#1B163B] text-[28px] ml-4 font-semibold">
            Vendor Transactions
          </h2>
          <div className="w-full grid xl:grid-cols-2 gap-4 mb-2">
            <div className="xl:col-span-1 col-span-2">
              <h2 className="text-[#1B163B] xl:text-[24px] text-lg ml-2 font-normal">
                Transaction Amount
              </h2>
              <div className="text-[#229635] font-normal flex items-center">
                <span className="xl:text-[44px] text-3xl flex items-center">
                  <LiaRupeeSignSolid />
                  {vendorAmountDetails !== null &&
                  (status?.toLowerCase() === "success" || status === null) ? (
                    <span>
                      {vendorAmountDetails?.totalTransactionAmount?.toLocaleString(
                        "hi-in",
                      )}
                    </span>
                  ) : (
                    <span>0</span>
                  )}
                </span>
                <span className="text-[20px] text-[#717171] flex items-center ml-2">
                  {` (selected period )`}
                </span>
              </div>
            </div>

            <div className="xl:col-span-1 col-span-2">
              <h2 className="text-[#1B163B] xl:text-[24px] text-lg ml-2 font-normal">
                Vendor Amount
              </h2>
              <div className="text-[#229635] font-normal flex items-center">
                <span className="xl:text-[44px] text-3xl flex items-center">
                  <LiaRupeeSignSolid />
                  {vendorAmountDetails !== null &&
                  (status?.toLowerCase() === "success" || status === null) ? (
                    <span>
                      {vendorAmountDetails?.totalOrderAmount?.toLocaleString(
                        "hi-in",
                      )}
                    </span>
                  ) : (
                    <span>0</span>
                  )}
                </span>
                <span className="text-[20px] text-[#717171] flex items-center ml-2">
                  {` (selected period )`}
                </span>
              </div>
            </div>
          </div>

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
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchFilter !== "" && searchText.length > 3 && (
                      <HiMiniXMark
                        onClick={async () => {
                          setSearchFilter("");
                          setSearchText("");
                          setUrlFilters({
                            ...urlFilters,
                            search: "",
                            search_filter: "",
                            page: 1,
                          });
                          refetchDataFetch({
                            start_date: todayFormatted,
                            end_date: todayFormatted,
                          });
                        }}
                        className="text-[#1E1B59] cursor-pointer text-md mr-2 shrink-0"
                      />
                    )}
                    <Select
                      className="border-l-2 border-gray-400"
                      options={[
                        { label: "By Order ID", value: "custom_order_id" },
                        { label: "By Edviron Order ID", value: "order_id" },
                      ]}
                      isSearchable={false}
                      components={{
                        DropdownIndicator: CustomDropdownIndicator,
                        IndicatorSeparator: () => null,
                      }}
                      onChange={(e: any) => {
                        const newFilter = e.value.toLowerCase();
                        setSearchFilter(newFilter);
                        setCurrentPage(1);
                        setUrlFilters({
                          ...urlFilters,
                          search_filter: newFilter,
                        });
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
                              setUrlFilters({
                                ...urlFilters,
                                search: searchText,
                                search_filter: searchFilter,
                                page: 1,
                              });
                              refetchDataFetch({
                                order_id:
                                  searchFilter === "order_id"
                                    ? searchText
                                    : null,
                                custom_id:
                                  searchFilter === "custom_order_id"
                                    ? searchText
                                    : null,
                                start_date: isDateRangeIsSelected
                                  ? formatDate(selectedRange.startDate)
                                  : todayFormatted,
                                end_date: isDateRangeIsSelected
                                  ? formatDate(selectedRange.endDate)
                                  : todayFormatted,
                                status: status?.toUpperCase(),
                                school_id:
                                  schoolId && schoolId.length > 0
                                    ? schoolId
                                    : null,
                                payment_modes: getPaymentMode(
                                  filters.paymentMode,
                                  type,
                                )?.includes("qr")
                                  ? null
                                  : getPaymentMode(filters.paymentMode, type),
                                isQrCode: getPaymentMode(
                                  filters.paymentMode,
                                  type,
                                )?.includes("qr"),
                                gateway: getPaymentMode(filters.gateway, type),
                                vendor_id: vendorId || null,
                              });
                            }
                          }}
                          className="cursor-pointer text-edvion_black text-opacity-50 text-md"
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
                          date_filter_type: dateRange,
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
                          )?.includes("qr")
                            ? null
                            : getPaymentMode(filters.paymentMode, type),
                          isQrCode: getPaymentMode(
                            filters.paymentMode,
                            type,
                          )?.includes("qr"),
                          gateway: getPaymentMode(filters.gateway, type),
                          vendor_id: vendorId || null,
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
                          setUrlFilters({
                            ...urlFilters,
                            status: e.value?.toUpperCase(),
                          });
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : todayFormatted,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : todayFormatted,
                            status: e.value?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr")
                              ? null
                              : getPaymentMode(filters.paymentMode, type),
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
                            vendor_id: vendorId || null,
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
                          setSelectSchool((prev) => [...prev, id]);
                        }}
                        setSchoolId={(id: any) => {
                          setSchoolId((prev: any) => [...prev, id]);
                        }}
                        setSelectVendor={(vendorName: any) => {
                          setSelectVendor(vendorName);
                        }}
                        setVendorId={(newVendorId: any) => {
                          setVendorId(newVendorId);
                        }}
                        paymentModes={Object.keys(filters.paymentMode).filter(
                          (key) => filters.paymentMode[key],
                        )}
                        gateway={Object.keys(filters.gateway).filter(
                          (key) => filters.gateway[key],
                        )}
                        setType={setType}
                        onCancel={() => {
                          setFilters({
                            paymentMode: {
                              credit_card: false,
                              credit_card_emi: false,
                              upi: false,
                              wallet: false,
                              pay_later: false,
                              cardless_emi: false,
                              net_banking: false,
                              debit_card_emi: false,
                              debit_card: false,
                              na: false,
                              qr: false,
                              vba: false,
                              pos_credit_card: false,
                              pos_debit_card: false,
                              pos_qr: false,
                            },
                            gateway: {
                              PHONEPE: false,
                              HDFC: false,
                              EDVIRON_PG: false,
                              EDVIRON_PAY_U: false,
                              EDVIRON_CCAVENUE: false,
                              EDVIRON_EASEBUZZ: false,
                              EDVIRON_HDFC_RAZORPAY: false,
                              SMART_GATEWAY: false,
                              PAYTM_POS: false,
                              MOSAMBEE_POS: false,
                              EDVIRON_NTTDATA: false,
                              EDVIRON_WORLDLINE: false,
                              EDVIRON_RAZORPAY: false,
                              EDVIRON_RAZORPAY_SEAMLESS: false,
                              EDVIRON_GATEPAY: false,
                              EDVIRON_PAY: false,
                            },
                          });
                          setType("");
                          setUrlFilters({
                            ...urlFilters,
                            payment_modes: null,
                            gateway: null,
                            vendor_id: null,
                            vendor_name: "",
                          });
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : todayFormatted,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : todayFormatted,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            payment_modes: null,
                            isQrCode: false,
                            gateway: null,
                            vendor_id: null,
                          });
                        }}
                        onApply={(
                          pendingPaymentMode: any,
                          pendingGateway: any,
                        ) => {
                          const paymentModesResult = getPaymentMode(
                            pendingPaymentMode,
                            type,
                          );
                          const gatewayResult = getPaymentMode(
                            pendingGateway,
                            type,
                          );
                          setCurrentPage(1);
                          setUrlFilters({
                            ...urlFilters,
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            school_name:
                              selectSchool?.length > 0 ? selectSchool : null,
                            vendor_id: vendorId || null,
                            vendor_name: selectVendor || null,
                            payment_modes: paymentModesResult,
                            gateway: gatewayResult,
                          });
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : todayFormatted,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : todayFormatted,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            vendor_id: vendorId || null,
                            payment_modes: paymentModesResult?.includes("qr")
                              ? null
                              : paymentModesResult,
                            isQrCode: paymentModesResult?.includes("qr"),
                            gateway: gatewayResult,
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
                    setItemsPerRow={(e: any) => {
                      setCurrentPage(1);
                      setItemsPerRow(e);
                      setUrlFilters({ ...urlFilters, limit: e.name });
                    }}
                    itemsPerRow={itemsPerRow}
                    className="justify-start"
                  />
                </div>
                <div className="flex items-center">
                  {type !== "" && (
                    <div className=" text-sm m-2  max-w-fit ">
                      <button
                        onClick={async () => {
                          setType("");
                          setUrlFilters({
                            ...urlFilters,
                            payment_modes: null,
                            gateway: null,
                            page: 1,
                            limit: itemsPerRow.name,
                            vendor_id: vendorId || null,
                            vendor_name: selectVendor || null,
                          });
                          setCurrentPage(1);
                          setFilters({
                            paymentMode: {
                              credit_card: false,
                              credit_card_emi: false,
                              upi: false,
                              wallet: false,
                              pay_later: false,
                              cardless_emi: false,
                              net_banking: false,
                              debit_card_emi: false,
                              debit_card: false,
                              na: false,
                              qr: false,
                              vba: false,
                              pos_credit_card: false,
                              pos_debit_card: false,
                              pos_qr: false,
                            },
                            gateway: {
                              PHONEPE: false,
                              HDFC: false,
                              EDVIRON_PG: false,
                              EDVIRON_PAY_U: false,
                              EDVIRON_CCAVENUE: false,
                              EDVIRON_EASEBUZZ: false,
                              EDVIRON_HDFC_RAZORPAY: false,
                              SMART_GATEWAY: false,
                              PAYTM_POS: false,
                              MOSAMBEE_POS: false,
                              EDVIRON_NTTDATA: false,
                              EDVIRON_WORLDLINE: false,
                              EDVIRON_RAZORPAY: false,
                              EDVIRON_RAZORPAY_SEAMLESS: false,
                              EDVIRON_GATEPAY: false,
                              EDVIRON_PAY: false,
                            },
                            vendor_id: vendorId || null,
                          });
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : todayFormatted,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : todayFormatted,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            payment_modes: null,
                            isQrCode: false,
                            gateway: null,
                            vendor_id: vendorId || null,
                          });
                        }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                      >
                        {type} <HiMiniXMark className=" text-lg ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Custom date chip */}
                  {showCustomDate && (
                    <div className="text-sm m-2 max-w-fit">
                      <button
                        onClick={async () => {
                          setDateRange("Today");
                          setIsDateRangeIsSelected(false);
                          setSelectedRange({
                            startDate: startOfDay(new Date()),
                            endDate: endOfDay(new Date()),
                            key: "selection",
                          });
                          setUrlFilters({
                            ...urlFilters,
                            start_date: "",
                            end_date: "",
                            page: 1,
                            limit: itemsPerRow.name,
                          });
                          setCurrentPage(1);
                          refetchDataFetch({
                            start_date: todayFormatted,
                            end_date: todayFormatted,
                            status: status?.toUpperCase(),
                            school_id:
                              schoolId && schoolId.length > 0 ? schoolId : null,
                            vendor_id: vendorId || null,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr")
                              ? null
                              : getPaymentMode(filters.paymentMode, type),
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
                          });
                        }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                      >
                        {urlFilters.end_date || urlFilters.start_date
                          ? "Custom Date"
                          : dateRange}
                        <HiMiniXMark className="text-lg ml-1" />
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
                            <FaX
                              className="text-white cursor-pointer h-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSchoolFilter(index);
                              }}
                            />
                          </div>
                        ),
                    )}
                  </div>

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
                  <div className="text-sm m-2 max-w-fit">
                    <button
                      onClick={async () => {
                        setStatus(null);
                        setCurrentPage(1);
                        setUrlFilters({
                          ...urlFilters,
                          status: null,
                          page: 1,
                          limit: itemsPerRow.name,
                        });
                        refetchDataFetch({
                          start_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.startDate)
                            : todayFormatted,
                          end_date: isDateRangeIsSelected
                            ? formatDate(selectedRange.endDate)
                            : todayFormatted,
                          school_id:
                            schoolId && schoolId.length > 0 ? schoolId : null,
                          payment_modes: getPaymentMode(
                            filters.paymentMode,
                            type,
                          )?.includes("qr")
                            ? null
                            : getPaymentMode(filters.paymentMode, type),
                          isQrCode: getPaymentMode(
                            filters.paymentMode,
                            type,
                          )?.includes("qr"),
                          gateway: getPaymentMode(filters.gateway, type),
                          vendor_id: vendorId || null,
                        });
                      }}
                      className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                    >
                      {(urlFilters.status ?? status)
                        ?.replace(/_/g, " ")
                        .toLowerCase()}
                      <HiMiniXMark className="text-lg ml-1" />
                    </button>
                  </div>
                )}
              </div>
              // </div>
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
              ...(transactionData?.map((d: any, index: number) => {
                const transaction = {
                  ...d,
                  payment_method:
                    d.payment_method === "" || d.payment_method === null
                      ? "NA"
                      : payment_method_map[d.payment_method],
                  serialNumber:
                    (currentPage - 1) * itemsPerRow.name + 1 + index,
                };
                const linkState = {
                  collect_id: transaction?.collect_id,
                  amount: transaction?.amount,
                  schoolName: transaction?.name,
                  gateway:
                    transaction.gateway === "EDVIRON_PG"
                      ? "Cashfree"
                      : transaction.gateway,
                  from: location.pathname + location.search,
                };
                const to = `/payments/vendor-transaction-receipt/`;
                return [
                  <div>{transaction?.serialNumber}</div>,
                  <Link state={linkState} to={to}>
                    <div className="truncate">{transaction?.name}</div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div className="truncate">
                      {transaction?.schoolName || "N/A"}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div className="truncate">
                      {new Date(transaction?.createdAt).toLocaleString("hi")}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>
                      {transaction.custom_order_id
                        ? transaction?.custom_order_id
                        : transaction?.collect_id}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>{amountFormat(transaction.transaction_amount)}</div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>{amountFormat(transaction.amount)}</div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>
                      {transaction.payment_method !== null
                        ? transaction.payment_method
                        : "NA"}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div
                      className={`flex items-center capitalize ${
                        transaction.status.toLowerCase() === "success"
                          ? "text-[#04B521]"
                          : transaction.status.toLowerCase() === "failure" ||
                              transaction.status.toLowerCase() === "failed"
                            ? "text-[#E54F2F]"
                            : transaction.status.toLowerCase() === "pending" ||
                                transaction.status.toLowerCase() ===
                                  "user_dropped"
                              ? "text-yellow-400"
                              : ""
                      }`}
                    >
                      {transaction.status.replace(/_/g, " ")}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>
                      {(() => {
                        try {
                          return (
                            JSON.parse(transaction?.additional_data)
                              ?.student_details?.student_name || "N/A"
                          );
                        } catch {
                          return "N/A";
                        }
                      })()}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>
                      {(() => {
                        try {
                          return (
                            JSON.parse(transaction?.additional_data)
                              ?.student_details?.student_id || "N/A"
                          );
                        } catch {
                          return "N/A";
                        }
                      })()}
                    </div>
                  </Link>,
                  <Link state={linkState} to={to}>
                    <div>
                      {transaction.gateway === "EDVIRON_PG"
                        ? "Cashfree"
                        : transaction.gateway}
                    </div>
                  </Link>,
                ];
              }) || []),
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
        </>
      )}
    </div>
  );
}

export default VendorTransaction;
