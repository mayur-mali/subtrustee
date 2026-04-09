import { useEffect, useState } from "react";
import { _Table } from "../../../components/Table";
import Card from "../../../components/Card/Card";
import { useQuery } from "@apollo/client";
import { GET_SUBTRUSTEE_DISPUTES } from "../../../Qurries";
import { amountFormat } from "../../../utils/amountFormat";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Select from "react-select";
import { HiMiniXMark } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { CustomDropdownIndicator } from "../Settlement/Settlement";
import TransactionDateFilter, {
  formatDate,
} from "../Transaction/components/TransactionDateFilter";
import Institute from "../Transaction/components/AllFilter/Institute";
import { endOfDay, startOfDay } from "date-fns";
import { getStartAndEndOfMonth } from "../../../utils/getStartAndEndOfMonth";

const STATUS_OPTIONS = [
  { label: "dispute created", value: "DISPUTE_CREATED" },
  { label: "request initiated", value: "REQUEST_INITIATED" },
  { label: "dispute closed", value: "DISPUTE_CLOSED" },
  { label: "dispute under review", value: "DISPUTE_UNDER_REVIEW" },
  { label: "chargeback merchant won", value: "CHARGEBACK_MERCHANT_WON" },
  { label: "pre arbitration created", value: "PRE_ARBITRATION_CREATED" },
];

function Disputes() {
  const [page] = useState(1);
  const [limit] = useState(100);
  const [searchText, setSearchText] = useState("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [refetchLoading, setRefetchLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [isDateRangeIsSelected, setIsDateRangeIsSelected] = useState(false);
  const [status, setStatus] = useState("");
  const [selectSchool, setSelectSchool] = useState<string>("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [instituteValue, setInstituteValue] = useState<any>(null);
  const { startDate, endDate } = getStartAndEndOfMonth();
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [dueAmounts, setDueAmounts] = useState({
    todayDueAmount: 0,
    tomorrowDueAmount: 0,
  });

  const {
    data: disputeData,
    loading,
    refetch,
  } = useQuery(GET_SUBTRUSTEE_DISPUTES, {
    variables: { page, limit },
  });

  useEffect(() => {
    const disputes = disputeData?.getSubTrusteeDisputes?.disputes;
    if (!disputes) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let todayDue = 0;
    let tomorrowDue = 0;

    disputes.forEach((d: any) => {
      if (!d.dispute_respond_by_date) return;
      const dueDate = new Date(d.dispute_respond_by_date)
        .toISOString()
        .split("T")[0];
      if (dueDate === todayStr) todayDue += d.dispute_amount ?? 0;
      else if (dueDate === tomorrowStr) tomorrowDue += d.dispute_amount ?? 0;
    });

    setDueAmounts({ todayDueAmount: todayDue, tomorrowDueAmount: tomorrowDue });
  }, [disputeData]);

  const refetchData = async ({
    start_date,
    end_date,
    dispute_status,
    school_id,
    collect_id,
    custom_id,
    dispute_id,
  }: {
    start_date?: string | null;
    end_date?: string | null;
    dispute_status?: string;
    school_id?: string | null;
    collect_id?: string;
    custom_id?: string;
    dispute_id?: string;
  }) => {
    setRefetchLoading(true);
    try {
      await refetch({
        page,
        limit,
        startDate: start_date ?? null,
        endDate: end_date ?? null,
        dispute_status: dispute_status ?? null,
        school_id: school_id ? [school_id] : null,
        collect_id: collect_id ?? null,
        custom_id: custom_id ?? null,
        dispute_id: dispute_id ?? null,
      });
    } finally {
      setRefetchLoading(false);
    }
  };

  useEffect(() => {
    refetchData({
      start_date: isDateRangeIsSelected
        ? formatDate(selectedRange.startDate)
        : null,
      end_date: isDateRangeIsSelected
        ? formatDate(selectedRange.endDate)
        : null,
      dispute_status: status || undefined,
      school_id: schoolId,
    });
  }, [schoolId, status]);

  const disputes = disputeData?.getSubTrusteeDisputes?.disputes ?? [];

  return (
    <div>
      <div className="grid grid-cols-3 gap-5 mb-4">
        <Card
          amount={amountFormat(dueAmounts.todayDueAmount)}
          date="Due Today"
          description="Amount"
        />
        <Card
          amount={amountFormat(dueAmounts.tomorrowDueAmount)}
          date="Due Tommorrow"
          description="Amount"
        />
        <Card amount={0} date="Insufficient Evidence" description="Amount" />
      </div>

      <_Table
        loading={loading || refetchLoading}
        heading="Disputes"
        exportBtn={true}
        copyContent={[4]}
        searchBox={
          <div className="w-full">
            <div className="flex xl:!flex-row flex-col justify-between gap-2 w-full xl:items-center items-start mb-2">
              {/* Search box with Filter By */}
              <div className="bg-[#EEF1F6] py-3 items-center flex px-3 xl:max-w-md max-w-[34rem] w-full rounded-lg">
                <input
                  className="text-xs pr-2 bg-transparent focus:outline-none w-full placeholder:font-normal"
                  type="text"
                  value={searchText}
                  placeholder=" Search(Order ID...)"
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {searchFilter !== "" && searchText.length > 3 && (
                  <HiMiniXMark
                    onClick={() => {
                      setSearchFilter("");
                      setSearchText("");
                      refetchData({});
                    }}
                    className="text-[#1E1B59] cursor-pointer text-md mr-2 shrink-0"
                  />
                )}
                <Select
                  className="border-l-2 border-gray-400"
                  options={[
                    { label: "By Order ID", value: "custom_order_id" },
                    { label: "By Edviron Order ID", value: "collect_id" },
                    { label: "By Dispute ID", value: "dispute_id" },
                  ]}
                  isSearchable={false}
                  components={{
                    DropdownIndicator: CustomDropdownIndicator,
                    IndicatorSeparator: () => null,
                  }}
                  onChange={(e: any) => {
                    setSearchFilter(e.value.toLowerCase());
                  }}
                  placeholder={
                    <div className="text-[#1E1B59] -mt-1 capitalize text-[10px]">
                      {searchFilter === ""
                        ? "Filter By"
                        : searchFilter.replaceAll("_", " ")}
                    </div>
                  }
                  value={null}
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
                    option: (provided) => ({
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
                          refetchData({
                            custom_id:
                              searchFilter === "custom_order_id"
                                ? searchText
                                : undefined,
                            collect_id:
                              searchFilter === "collect_id"
                                ? searchText
                                : undefined,
                            dispute_id:
                              searchFilter === "dispute_id"
                                ? searchText
                                : undefined,
                          });
                        }
                      }}
                      className="cursor-pointer text-edvion_black text-opacity-50 text-md"
                    />
                  )}
                </div>
              </div>

              {/* Right-side filters */}
              <div className="flex justify-end items-center flex-1 w-full max-w-[34rem] gap-2">
                <TransactionDateFilter
                  setType={setDateRange}
                  type={dateRange}
                  refetch={() => {
                    refetchData({
                      start_date: isDateRangeIsSelected
                        ? formatDate(selectedRange.startDate)
                        : null,
                      end_date: isDateRangeIsSelected
                        ? formatDate(selectedRange.endDate)
                        : null,
                      dispute_status: status || undefined,
                      school_id: schoolId,
                    });
                  }}
                  selectedRange={selectedRange}
                  setSelectedRange={setSelectedRange}
                  setIsDateRangeIsSelected={setIsDateRangeIsSelected}
                />
                <div className="w-full">
                  <Select
                    className="font-normal m-0 p-2 capitalize"
                    options={STATUS_OPTIONS}
                    components={{
                      DropdownIndicator: CustomDropdownIndicator,
                      IndicatorSeparator: () => null,
                    }}
                    onChange={(e: any) => {
                      setStatus(e.value);
                    }}
                    placeholder={
                      <div className="text-[#1E1B59] text-xs">Status</div>
                    }
                    value={null}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: "#F6F8FA",
                        border: "1px solid #1B163B",
                        borderRadius: "6px",
                        minHeight: "15px",
                        margin: "0px",
                        color: "#6687FF",
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        padding: "0px",
                        paddingLeft: "0.5rem",
                      }),
                      input: (provided) => ({
                        ...provided,
                        backgroundColor: "transparent",
                        color: "#000",
                      }),
                      option: (provided) => ({
                        ...provided,
                        fontSize: "12px",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }),
                    }}
                  />
                </div>
                <div className="w-full">
                  <Institute
                    setSelectSchool={setSelectSchool}
                    setSchoolId={setSchoolId}
                    value={instituteValue}
                  />
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            <div className="flex items-center flex-wrap gap-1">
              {dateRange !== "" && (
                <button
                  onClick={() => {
                    setSelectedRange({
                      startDate: startOfDay(new Date()),
                      endDate: endOfDay(new Date()),
                      key: "selection",
                    });
                    setDateRange("");
                    setIsDateRangeIsSelected(false);
                    refetchData({
                      start_date: startDate,
                      end_date: endDate,
                      dispute_status: status || undefined,
                      school_id: schoolId,
                    });
                  }}
                  className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 text-sm"
                >
                  {dateRange} <HiMiniXMark className="text-lg ml-1" />
                </button>
              )}
              {selectSchool !== "" && (
                <button
                  onClick={() => {
                    setSelectSchool("");
                    setSchoolId(null);
                    setInstituteValue(null);
                  }}
                  className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 text-sm"
                >
                  {selectSchool} <HiMiniXMark className="text-lg ml-1" />
                </button>
              )}
              {status !== "" && (
                <button
                  onClick={() => setStatus("")}
                  className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 text-sm"
                >
                  {status.toLowerCase().replaceAll("_", " ")}{" "}
                  <HiMiniXMark className="text-lg ml-1" />
                </button>
              )}
            </div>
          </div>
        }
        data={[
          [
            "Created At",
            "Dispute ID",
            "Order ID",
            "Bank Ref.No",
            "School Name",
            "Student Name",
            "Type",
            "Dispute Amt.",
            "Respond By",
            "Status",
            "Settlement UTR",
            "Settlement Date",
            "Dispute Closed Date",
          ],
          ...disputes.map((item: any) => [
            item.dispute_created_date
              ? new Date(item.dispute_created_date).toLocaleString("hi")
              : "-",
            item.dispute_id ?? "NA",
            item.custom_order_id &&
            !["na", "n/a"].includes(item.custom_order_id.toLowerCase())
              ? item.custom_order_id
              : (item.collect_id ?? "-"),
            item.bank_reference ?? "N/A",
            item.school_name ?? "N/A",
            item.student_name ?? "N/A",
            item.dispute_type ?? "-",
            item.dispute_amount != null
              ? amountFormat(item.dispute_amount)
              : "N/A",
            item.dispute_respond_by_date
              ? new Date(item.dispute_respond_by_date).toLocaleString("hi")
              : "-",
            item.dispute_status ?? "-",
            item.utr_number ?? "-",
            item.dispute_settled_date
              ? new Date(item.dispute_settled_date).toLocaleString("hi")
              : "-",
            item.dispute_resolved_at_date
              ? new Date(item.dispute_resolved_at_date).toLocaleString("hi")
              : "-",
          ]),
        ]}
      />
    </div>
  );
}

export default Disputes;
