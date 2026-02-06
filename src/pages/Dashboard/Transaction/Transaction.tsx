import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "../../../Qurries";
import {
  _Table,
  Pagination,
  RowsPerPageSelect,
} from "../../../components/Table";
// import { Pagination, RowsPerPageSelect } from "../../../../components/Table/Table";
import { amountFormat } from "../../../utils/amountFormat";
import { getVendorAmount } from "../../../utils/getVendorAmount";
import { Link } from "react-router-dom";
import { useTransactionFilters } from "../../../hooks/useTransactionFilters";
import { useEffect, useState } from "react";
import { getStartAndEndOfMonth } from "../../../utils/getStartAndEndOfMonth";
import Select from "react-select";
import { HiMiniXMark } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { endOfDay, startOfDay } from "date-fns";
import TransactionDateFilter, {
  formatDate,
} from "./components/TransactionDateFilter";
import { getPaymentMode } from "../../../utils/getPaymentMode";
import MixFilter from "./components/MixFilter";
import { IoIosArrowDown } from "react-icons/io";
import Aword from "../../../assets/a_round.svg";

export const payment_method_map: any = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  net_banking: "Net Banking",
  UPI: "UPI",
  upi: "UPI",
  wallet: "Wallet",
  credit_card_emi: "Credit Card EMI",
  debit_card_emi: "Debit Card EMI",
  cardless_emi: "Cardless EMI",
  pay_later: "Pay Later",
  upi_credit_card: "UPI Credit Card",
  vba: "Bank Transfer(VBA)",
  pos_credit_card: "POS Credit Card",
  pos_debit_card: "POS Debit Card",
  pos_qr: "POS QR",
};

export const gatewayName = {
  PHONEPE: "PHONEPE",
  HDFC: "HDFC",
  EDVIRON_PG: "CASHFREE",
  EDVIRON_PAY_U: "PAY U",
  EDVIRON_CCAVENUE: "CCAVENUE",
  EDVIRON_EASEBUZZ: "EASEBUZZ",
  PENDING: "PENDING",
  EXPIRED: "EXPIRED",
  EDVIRON_HDFC_RAZORPAY: "HDFC RAZORPAY",
  SMART_GATEWAY: "SMART GATEWAY",
  PAYTM_POS: "PAYTM POS",
  MOSAMBEE_POS: "MOSAMBEE POS",
  EDVIRON_NTTDATA: "NTT DATA",
  EDVIRON_WORLDLINE: "WORLDLINE",
  EDVIRON_RAZORPAY: "RAZORPAY",
  EDVIRON_RAZORPAY_SEAMLESS: "RAZORPAY SEAMLESS",
  EDVIRON_GATEPAY: "GATEPAY",
  EDVIRON_PAY: "EDVIRON PAY",
};

export const handleCheckboxChange = (
  category: any,
  option: any,
  setFilters: any,
) => {
  setFilters((prevFilters: any) => ({
    ...prevFilters,
    [category]: {
      ...prevFilters[category],
      [option]: !prevFilters[category][option],
    },
  }));
};

export const CustomDropdownIndicator = () => {
  return (
    <div>
      <IoIosArrowDown className="text-xs w-8 text-[#1E1B59]" />
    </div>
  );
};

// export function getVendorAmount({ array, orderAmount }: any) {
//   const res = array
//     ?.map((info: any) => {
//       const { percentage, amount } = info;
//       let split_amount = amount;
//       if (percentage) {
//         split_amount = (orderAmount * percentage) / 100;
//       }
//       return split_amount;
//     })
//     ?.reduce((acc: any, curr: any) => acc + curr, 0);

//   return res;
// }

export default function Transaction() {
  const [urlFilters, setUrlFilters] = useTransactionFilters();
  const [currentPage, setCurrentPage] = useState<any>(
    Number(urlFilters.page) || 1,
  );
  const [itemsPerRow, setItemsPerRow] = useState<any>({
    name: Number(urlFilters.limit) || 10,
  });

  const [searchText, setSearchText] = useState<string>("");
  const [isCustomSearch, setIsCustomSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState<any>("");

  const [transactionReportData, settransactionReportData] = useState<any>([]);
  const [isDateRangeIsSelected, setIsDateRangeIsSelected] = useState(false);
  const [transactionTotal, setTransactionAmount] = useState(0);
  const [orderAmountTotal, setOrderAmountTotal] = useState(0);

  const [type, setType] = useState("");
  const [dateRange, setDateRange] = useState("");

  const [refetchLoading, setRefetchLoading] = useState(false);

  const [status, setStatus] = useState<any>(urlFilters.status || null);
  const [selectSchool, setSelectSchool] = useState<string | null>(
    urlFilters.school_name || null,
  );
  const [schoolId, setSchoolId] = useState<any>(urlFilters.school_id || null);

  const [transactionAmountDetails, setTransactionAmountDetails] =
    useState<any>(null);
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
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
      PHONEPE: urlFilters.gateway.split(",").includes("PHONEPE") ? true : false,
      HDFC: urlFilters.gateway.split(",").includes("HDFC") ? true : false,
      EDVIRON_PG: urlFilters.gateway.split(",").includes("EDVIRON_PG")
        ? true
        : false,
      EDVIRON_PAY_U: urlFilters.gateway.split(",").includes("EDVIRON_PAY_U")
        ? true
        : false,
      EDVIRON_CCAVENUE: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_CCAVENUE")
        ? true
        : false,
      EDVIRON_EASEBUZZ: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_EASEBUZZ")
        ? true
        : false,
      EDVIRON_HDFC_RAZORPAY: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_HDFC_RAZORPAY")
        ? true
        : false,
      SMART_GATEWAY: urlFilters.gateway.split(",").includes("SMART_GATEWAY")
        ? true
        : false,
      PAYTM_POS: urlFilters.gateway.split(",").includes("PAYTM_POS")
        ? true
        : false,
      MOSAMBEE_POS: urlFilters.gateway.split(",").includes("MOSAMBEE_POS")
        ? true
        : false,
      EDVIRON_NTTDATA: urlFilters.gateway.split(",").includes("EDVIRON_NTTDATA")
        ? true
        : false,
      EDVIRON_WORLDLINE: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_WORLDLINE")
        ? true
        : false,
      EDVIRON_RAZORPAY: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_RAZORPAY")
        ? true
        : false,
      EDVIRON_RAZORPAY_SEAMLESS: urlFilters.gateway
        .split(",")
        .includes("EDVIRON_RAZORPAY_SEAMLESS")
        ? true
        : false,
      EDVIRON_GATEPAY: urlFilters.gateway.split(",").includes("EDVIRON_GATEPAY")
        ? true
        : false,
      EDVIRON_PAY: urlFilters.gateway.split(",").includes("EDVIRON_PAY")
        ? true
        : false,
    },
  });

  const [transactionData, setTransactionData] = useState<any>([]);

  const { startDate, endDate } = getStartAndEndOfMonth();
  const {
    data: transactionReport,
    loading: transactionReportLoading,
    refetch,
  } = useQuery(GET_TRANSACTIONS, {
    variables: {
      startDate: urlFilters.start_date ? urlFilters.start_date : startDate,
      endDate: urlFilters?.end_date ? urlFilters.end_date : endDate,
      page: currentPage.toString(),
      status: status?.toUpperCase(),
      school_id: selectSchool === "" ? null : schoolId,
      limit: itemsPerRow.name.toString(),
      payment_modes: getPaymentMode(filters.paymentMode, type),
      isQRCode: getPaymentMode(filters.paymentMode, type)?.includes("qr"),
      gateway: getPaymentMode(filters.gateway, type),
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (transactionReport?.getSubtrusteeTransactionReport?.transactionReport) {
      const formattedData =
        transactionReport?.getSubtrusteeTransactionReport?.transactionReport.map(
          (row: any, index: number) => {
            const gatewayKey = row.gateway?.toUpperCase();
            const gatewayname =
              gatewayKey && gatewayName[gatewayKey as keyof typeof gatewayName]
                ? gatewayName[gatewayKey as keyof typeof gatewayName] ===
                  "Pending"
                  ? "NA"
                  : gatewayName[gatewayKey as keyof typeof gatewayName]
                : "NA";

            return {
              schoolName: row.school_name,
              transactionTime: row.createdAt,
              orderID: row.collect_id,
              transactionAmount:
                row.transaction_amount === null ? "--" : row.transaction_amount,
              paymentMode:
                row.payment_method === "" || row.payment_method === null
                  ? "NA"
                  : payment_method_map[row.payment_method],
              orderAmount: row.order_amount === null ? "--" : row.order_amount,
              transactionStatus:
                row.status === null ? "NA" : row.status?.toLowerCase(),
              schoolId: row.school_id === null ? "NA" : row.school_id,
              ...row,
              serialNumber: (currentPage - 1) * itemsPerRow.name + 1 + index,
              gateway: gatewayname,
              isVBAPaymentComplete: row?.isVBAPaymentComplete,
              student_id: row?.student_id,
            };
          },
        );

      setTransactionData(formattedData);
    }
  }, [transactionReport]);

  const refetchDataFetch = async ({
    start_date,
    end_date,
    status,
    school_id,
    isCustomSearch,
    searchFilter,
    searchParams,
    payment_modes,
    isQrCode,
    gateway,
  }: {
    start_date?: any;
    end_date?: any;
    status?: String;
    school_id?: String;
    isCustomSearch?: boolean;
    searchFilter?: String;
    searchParams?: String;
    payment_modes?: string[] | null;
    isQrCode?: boolean;
    gateway?: string[] | null;
  }) => {
    setRefetchLoading(true);

    try {
      const res = await refetch({
        startDate: urlFilters.start_date ? urlFilters.start_date : start_date,
        endDate: urlFilters.end_date ? urlFilters.end_date : end_date,
        page: currentPage.toString(),
        limit: itemsPerRow.name.toString(),
        status,
        school_id,
        isCustomSearch: isCustomSearch,
        searchFilter,
        searchParams,
        payment_modes: isQrCode ? null : payment_modes,
        isQRCode: isQrCode,
        gateway,
      });
      if (res) {
        setRefetchLoading(false);
        setTransactionData(
          res?.data?.getSubtrusteeTransactionReport.transactionReport.map(
            (row: any, index: any) => {
              const gatewayKey = row.gateway?.toUpperCase();
              const gatewayname =
                gatewayKey &&
                gatewayName[gatewayKey as keyof typeof gatewayName]
                  ? gatewayName[gatewayKey as keyof typeof gatewayName] ===
                    "Pending"
                    ? "NA"
                    : gatewayName[gatewayKey as keyof typeof gatewayName]
                  : "NA";

              return {
                schoolName: row.school_name,
                transactionTime: row.createdAt,
                orderID: row.collect_id,
                transactionAmount:
                  row.transaction_amount === null
                    ? "--"
                    : row.transaction_amount,
                paymentMode:
                  row.payment_method === "" || row.payment_method === null
                    ? "NA"
                    : payment_method_map[row.payment_method],
                orderAmount:
                  row.order_amount === null ? "--" : row.order_amount,
                transactionStatus:
                  row.status === null ? "NA" : row.status?.toLowerCase(),
                schoolId: row.school_id === null ? "NA" : row.school_id,
                ...row,
                serialNumber: (currentPage - 1) * itemsPerRow.name + 1 + index,
                gateway: gatewayname,
                isVBAPaymentComplete: row?.isVBAPaymentComplete,
                student_id: row?.student_id,
              };
            },
          ),
        );
      }
    } catch (error) {
      if (error) {
        setRefetchLoading(false);
      }
    }
  };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    setUrlFilters({
      ...urlFilters,
      page: page,
    });
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

      school_id: selectSchool === "" ? null : schoolId,
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
    });

    setUrlFilters({
      ...urlFilters,
      page: currentPage,
      limit: itemsPerRow.name,
    });
  }, [currentPage, itemsPerRow]);

  useEffect(() => {
    if (
      searchText.length > 3 &&
      ["order_id", "custom_order_id"].includes(searchFilter)
    ) {
      setIsCustomSearch(true);
    } else {
      setIsCustomSearch(false);
    }
  }, [searchText, searchFilter]);

  return (
    <div>
      <div className="overflow-x-auto w-full">
        {transactionReportData ? (
          <_Table
            heading={"History"}
            exportBtn={true}
            pagination={false}
            perPage={false}
            copyContent={[4, 5]}
            filter={[searchText]}
            loading={refetchLoading || transactionReportLoading}
            isCustomFilter={true}
            searchBox={
              <div className="w-full ">
                <div className="flex xl:!flex-row flex-col justify-between gap-2  w-full xl:items-center items-start mb-2">
                  <div className="bg-[#EEF1F6] py-3 items-center flex  px-3 xl:max-w-md max-w-[34rem] w-full rounded-lg">
                    <input
                      className="text-xs pr-2 bg-transparent focus:outline-none w-full placeholder:font-normal"
                      type="text"
                      value={searchText}
                      placeholder=" Search(Order ID...)"
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
                        { label: "By Student Info", value: "student_info" },
                        {
                          label: "By UPI Transaction ID",
                          value: "bank_reference",
                        },
                        { label: "By UPI Id", value: "upi_id" },
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
                      {searchText.length > 3 && refetchLoading ? (
                        <AiOutlineLoading3Quarters className="text-xs animate-spin" />
                      ) : (
                        <IoSearchOutline
                          onClick={() => {
                            if (searchText.length > 3 && searchFilter !== "") {
                              setCurrentPage(1);
                              refetchDataFetch({
                                isCustomSearch,
                                searchFilter: searchFilter,
                                searchParams: searchText,
                                start_date: isDateRangeIsSelected
                                  ? formatDate(selectedRange.startDate)
                                  : startDate,
                                end_date: isDateRangeIsSelected
                                  ? formatDate(selectedRange.endDate)
                                  : endDate,
                                status: status?.toUpperCase(),
                                school_id: schoolId === "" ? null : schoolId,
                                payment_modes: getPaymentMode(
                                  filters.paymentMode,
                                  type,
                                ),
                                isQrCode: getPaymentMode(
                                  filters.paymentMode,
                                  type,
                                )?.includes("qr"),
                                gateway: getPaymentMode(filters.gateway, type),
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
                          school_id: schoolId === "" ? null : schoolId,
                          payment_modes: getPaymentMode(
                            filters.paymentMode,
                            type,
                          ),
                          isQrCode: getPaymentMode(
                            filters.paymentMode,
                            type,
                          )?.includes("qr"),
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
                        onChange={(e: any) => {
                          setStatus(e.value);
                          setUrlFilters({
                            ...urlFilters,
                            status: e.value?.toUpperCase(),
                          });
                          setCurrentPage(1);
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: e.value?.toUpperCase(),
                            isCustomSearch: isCustomSearch,
                            searchFilter: searchFilter,
                            searchParams: searchText,
                            school_id: selectSchool === "" ? null : schoolId,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            ),
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
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
                    <div className="w-full">
                      <MixFilter
                        setSelectSchool={setSelectSchool}
                        setSchoolId={setSchoolId}
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
                            isCustomSearch: isCustomSearch,
                            searchFilter: searchFilter,
                            searchParams: searchText,
                            school_id: selectSchool === "" ? null : schoolId,
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
                          });
                        }}
                        onApply={() => {
                          setCurrentPage(1);
                          setUrlFilters({
                            ...urlFilters,
                            school_id: selectSchool === "" ? null : schoolId,
                            school_name: selectSchool,
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

                            school_id: selectSchool === "" ? null : schoolId,
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
                      setUrlFilters({
                        ...urlFilters,
                        limit: e.name,
                      });
                    }}
                    itemsPerRow={itemsPerRow}
                    className=" justify-start"
                  />
                </div>
                <div className="flex items-center">
                  {(type !== "" ||
                    urlFilters.payment_modes !== "" ||
                    urlFilters.gateway !== "") && (
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
                          });
                          setCurrentPage(1);

                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: status?.toUpperCase(),
                            school_id: schoolId === "" ? null : schoolId,
                            payment_modes: null,
                            gateway: null,
                          });

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
                            },
                            gateway: {
                              EDVIRON_PG: false,
                              EDVIRON_EASEBUZZ: false,
                            },
                          });
                        }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                      >
                        {urlFilters.payment_modes || urlFilters.gateway
                          ? "Custom Filter"
                          : type}{" "}
                        <HiMiniXMark className=" text-lg ml-1" />
                      </button>
                    </div>
                  )}
                  {(dateRange !== "" ||
                    urlFilters.end_date !== "" ||
                    urlFilters.start_date !== "") && (
                    <div className=" text-sm m-2  max-w-fit ">
                      <button
                        onClick={async () => {
                          setSelectedRange({
                            startDate: startOfDay(new Date()),
                            endDate: endOfDay(new Date()),
                            key: "selection",
                          });
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: status?.toUpperCase(),
                            isCustomSearch: isCustomSearch,
                            searchFilter: searchFilter,
                            searchParams: searchText,
                            school_id: selectSchool === "" ? null : schoolId,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            ),
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
                          });
                          setDateRange("");
                          setIsDateRangeIsSelected(false);
                          setUrlFilters({
                            ...urlFilters,
                            start_date: "",
                            end_date: "",
                            page: 1,
                            limit: itemsPerRow.name,
                          });
                          setCurrentPage(1);
                        }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                      >
                        {urlFilters.end_date || urlFilters.start_date
                          ? "Custom Date"
                          : dateRange}{" "}
                        <HiMiniXMark className=" text-lg ml-1" />
                      </button>
                    </div>
                  )}
                  {selectSchool !== "" && selectSchool !== null && (
                    <div className=" text-sm m-2  max-w-fit ">
                      <button
                        onClick={() => {
                          setUrlFilters({
                            ...urlFilters,
                            school_id: null,
                            school_name: "",
                            page: 1,
                            limit: itemsPerRow.name,
                          });
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            status: status?.toUpperCase(),

                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            ),
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
                          });
                          setSelectSchool("");
                          setSchoolId(null);
                          setCurrentPage(1);
                        }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                      >
                        {urlFilters?.school_name
                          ? urlFilters?.school_name
                          : selectSchool}{" "}
                        <HiMiniXMark className=" text-lg ml-1" />
                      </button>
                    </div>
                  )}
                  {status && (
                    <div className=" text-sm m-2  max-w-fit ">
                      <button
                        onClick={async () => {
                          refetchDataFetch({
                            start_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.startDate)
                              : startDate,
                            end_date: isDateRangeIsSelected
                              ? formatDate(selectedRange.endDate)
                              : endDate,
                            school_id: schoolId === "" ? null : schoolId,
                            payment_modes: getPaymentMode(
                              filters.paymentMode,
                              type,
                            ),
                            isQrCode: getPaymentMode(
                              filters.paymentMode,
                              type,
                            )?.includes("qr"),
                            gateway: getPaymentMode(filters.gateway, type),
                          });
                          setStatus(null);
                          setUrlFilters({
                            ...urlFilters,
                            status: null,
                            page: 1,
                            limit: itemsPerRow.name,
                          });
                          setCurrentPage(1);
                        }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full w-full"
                      >
                        {urlFilters.status
                          ? urlFilters.status.replace(/_/g, " ").toLowerCase()
                          : status?.replace(/_/g, " ").toLowerCase()}{" "}
                        <HiMiniXMark className=" text-lg ml-1" />
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
                "Date & Time",
                "Order ID",
                "Edviron Order ID",
                "Order Amt",
                "Transaction Amt",
                "Payment Method",
                "Status",
                "Student Name",
                "Student ID",
                "Phone No.",
                "Vendor Amount",
                "Gateway",
                "Capture Status",
              ],
              ...transactionData?.map((row: any) => [
                <div>{row?.serialNumber}</div>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div className="truncate" key={row.orderID}>
                    {row.schoolName}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div className=" truncate" key={row.orderID}>
                    {row.payment_time
                      ? new Date(row?.payment_time).toLocaleString("hi", {
                          timeZone: "Asia/Kolkata",
                        })
                      : new Date(row?.updatedAt).toLocaleString("hi", {
                          timeZone: "Asia/Kolkata",
                        })}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div
                    className="truncate"
                    title={row.orderID}
                    key={row.orderID}
                  >
                    {row.custom_order_id ? row.custom_order_id : "N/A"}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div
                    className="truncate"
                    title={row.orderID}
                    key={row.orderID}
                  >
                    {row.orderID}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div
                    key={row.orderID}
                  >{`₹${row.orderAmount !== null ? Number(row?.orderAmount.toFixed(2)).toLocaleString("hi-IN") : 0}`}</div>
                </Link>,

                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div
                    key={row.orderID}
                  >{`₹${row.transactionAmount !== null ? Number(row?.transactionAmount.toFixed(2)).toLocaleString("hi-IN") : 0}`}</div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div key={row.orderID}>
                    {row.isQRPayment ? "Dynamic QR Code" : row.paymentMode}
                  </div>
                </Link>,

                // <div className="text-center pr-4">{row?.commission}</div>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div
                    className={`flex items-center capitalize ${
                      row.transactionStatus === "success"
                        ? "text-[#04B521]"
                        : row.transactionStatus === "failure" ||
                            row.transactionStatus === "failed"
                          ? "text-[#E54F2F]"
                          : row.transactionStatus === "pending"
                            ? "text-yellow-400"
                            : ""
                    }`}
                    key={row.orderID}
                  >
                    {row.transactionStatus?.replaceAll("_", " ")}
                    {row.isAutoRefund ? (
                      <img className="w-5 h-5 ml-[10px]" src={Aword} alt="a" />
                    ) : null}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div key={row.orderID}>
                    {row.student_name ? row.student_name : "NA"}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div key={row.orderID}>
                    {row.student_id ? row.student_id : "NA"}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}&isVba=${row?.isVBAPaymentComplete}`}
                >
                  <div key={row.orderID}>
                    {row.student_phone ? row.student_phone : "NA"}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}`}
                >
                  <div>
                    {row.vendors_info?.length > 0
                      ? amountFormat(
                          getVendorAmount({
                            array: row?.vendors_info,
                            orderAmount: row?.orderAmount,
                          }),
                        )
                      : "NA"}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}`}
                >
                  <div className="truncate" key={row.orderID}>
                    {row?.gateway}
                  </div>
                </Link>,
                <Link
                  to={`/payments/transaction-receipt/${row?.orderID}?sid=${row?.schoolId}`}
                >
                  <div className="truncate " key={row.orderID}>
                    {row?.capture_status || "NA"}
                  </div>
                </Link>,
              ]),
            ]}
            footer={
              <div className="flex justify-center items-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    transactionReport?.getSubtrusteeTransactionReport
                      ?.total_pages,
                  )}
                  onPageChange={handlePageChange}
                />
              </div>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
