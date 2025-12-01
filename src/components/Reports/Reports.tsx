import React, { useEffect, useRef, useState } from "react";
import { _Table, Pagination, RowsPerPageSelect } from "../../components/Table";
import Modal from "../../components/Modal/Modal";
import { FiDownload } from "react-icons/fi";
import Select from "react-select";
import Accordion from "../../components/Accordion/Accordion";
import { DateRange } from "react-date-range-ts";
import generatingFileAnimation from "../../assets/fileGenerating.json";

import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import LottiePlayer from "../../components/Lottie/LottiePlayer";
import { useMutation, useQuery } from "@apollo/client";
import {
  GENERATE_REPORT,
  GET_ALL_SCHOOLS_QUERY_FOR_REPORT,
  GET_REPORTS,
  GET_VENDORS_FOR_REPORT,
} from "../../Qurries";
import { FaDownload } from "react-icons/fa6";
import { toast } from "react-toastify";
import { RiRefreshLine } from "react-icons/ri";
import { FcRefresh } from "react-icons/fc";

const MAX_RANGE_DAYS = 30;

type OptionType = { label: string; value: string };

let TRANSACTION_FIELDS = [
  "collect_id",
  "custom_order_id",
  "order_amount",
  "transaction_amount",
  "payment_method",
  "school_name",
  "school_id",
  "status",
  "student_id",
  "student_name",
  "student_email",
  "student_phone",
  "gateway",
  "capture_status",
  "createdAt",
  "transactionDate",
];

let VENDOR_TRANSACTION_FIELDS = [
  "vendor_id",
  "name",
  "collect_id",
  "custom_order_id",
  "amount",
  "transaction_amount",
  "payment_method",
  "school_name",
  "school_id",
  "status",
  "student_id",
  "student_name",
  "student_email",
  "student_phone",
  "gateway",
  "createdAt",
  "payment_time",
];

export default function Reports() {
  const [openModal, setModal] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [itemsPerRow, setItemsPerRow] = useState<{
    name: number;
  }>({
    name: 10,
  });
  const {
    data,
    loading: reportLoading,
    refetch,
  } = useQuery(GET_REPORTS, {
    variables: { page: currentPage, limit: itemsPerRow.name },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const { data: schoolsData } = useQuery(GET_ALL_SCHOOLS_QUERY_FOR_REPORT, {
    fetchPolicy: "network-only",
  });

  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const { data: vendorsData, refetch: refetchVendors } = useQuery(
    GET_VENDORS_FOR_REPORT,
    {
      variables: { school: selectedSchoolIds },
      skip: selectedSchoolIds.length === 0,
      fetchPolicy: "network-only",
    },
  );

  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [SelectedFields, setSelectedFields] = useState<string[]>([]);
  console.log(SelectedFields, "SelectedFields");
  const [generate, { loading: generateReportLoading }] = useMutation(
    GENERATE_REPORT,
    {
      refetchQueries: [
        { query: GET_REPORTS, variables: { page: 1, limit: 10 } },
      ],
      awaitRefetchQueries: true,
    },
  );
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [reportData, setReportData] = useState({
    startDate: selectedRange.startDate,
    endDate: selectedRange.endDate,
    name: "",
    format: "",
    email: "",
    type: "",
    school_list: [] as string[],
    vendor_list: [] as string[],
    SelectedFields: [] as string[],
  });

  useEffect(() => {
    if (!openModal) {
      setSelectedVendorIds([]);
      setReportData({
        startDate: new Date(),
        endDate: new Date(),
        name: "",
        format: "",
        email: "",
        type: "",
        school_list: [],
        vendor_list: [],
        SelectedFields: [],
      });
      setSelectedRange({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      });
    }
  }, [openModal]);

  const handlePresetFilter = (type: any) => {
    let startDate, endDate;

    switch (type) {
      case "today":
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());

        break;
      case "last7days":
        startDate = subDays(new Date(), 7);
        endDate = new Date();

        break;
      case "thisMonth":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());

        break;
      case "lastMonth":
        startDate = startOfMonth(subDays(new Date(), 30));
        endDate = endOfMonth(subDays(new Date(), 30));

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

  const fields =
    reportData.type === "VENDOR_TRANSACTION_REPORT"
      ? VENDOR_TRANSACTION_FIELDS
      : TRANSACTION_FIELDS;

  const items = [
    {
      title: "What report is this?",
      subtitle: "Report type",
      content: (
        <div className="flex flex-col gap-y-4 pb-4">
          <div className="flex flex-col px-4 bg-gray-100">
            <label htmlFor="report" className="my-2">
              Select Report required *
            </label>
            <Select
              closeMenuOnSelect={true}
              onChange={(selectedOption) => {
                setReportData((prevData) => ({
                  ...prevData,
                  type: selectedOption ? selectedOption.value : "",
                  school_list: [],
                  vendor_list: [],
                  SelectedFields: [],
                }));
                setSelectedVendorIds([]);
                setSelectedFields([]);
              }}
              options={[
                {
                  value: "SETTLEMENT_REPORT",
                  label: "Merchant Settlement Report",
                },
                {
                  value: "SETTLEMENT_VENDOR",
                  label: "Vendor Settlement Report",
                },
                {
                  value: "SETTLEMENT_RECON",
                  label: "Settlement Reconciliation Report",
                },
                { value: "TRANSACTION_REPORT", label: "Transaction Report" },
                {
                  value: "VENDOR_TRANSACTION_REPORT",
                  label: "Vendor Transaction Report",
                },
                // { value: "dispute", label: "Dispute Report" },
              ]}
              isSearchable={false}
            />
            <p className="text-[9px] my-2 text-gray-500">
              Please select the report you want to download.
            </p>
          </div>
          {(reportData.type === "TRANSACTION_REPORT" ||
            reportData.type === "VENDOR_TRANSACTION_REPORT") && (
            <div className="flex flex-col px-4 bg-gray-100">
              <label className="my-2">Select Schools</label>

              <Select
                placeholder="Select Schools"
                isMulti
                value={selectedSchoolIds.map((id) => ({
                  value: id,
                  label:
                    schoolsData?.getAllSubTrusteeSchools?.find(
                      (s: any) => s.school_id === id,
                    )?.school_name ?? "",
                }))}
                onChange={(options) => {
                  const ids = options ? options.map((o: any) => o.value) : [];

                  setSelectedSchoolIds(ids);
                  setSelectedVendorIds([]);

                  setReportData((prev) => ({
                    ...prev,
                    school_list: ids,
                    vendor_list: [],
                  }));

                  if (
                    ids.length &&
                    ids.length > 0 &&
                    reportData.type === "VENDOR_TRANSACTION_REPORT"
                  )
                    refetchVendors({ school: ids });
                }}
                options={
                  schoolsData?.getAllSubTrusteeSchools?.map((s: any) => ({
                    value: s.school_id,
                    label: s.school_name,
                  })) || []
                }
              />
            </div>
          )}

          {reportData.type === "VENDOR_TRANSACTION_REPORT" && (
            <div className="flex flex-col px-4 bg-gray-100">
              <label className="my-2">Select Vendors (optional)</label>

              <Select
                placeholder={
                  selectedSchoolIds.length
                    ? "Select Vendors"
                    : "Select schools first"
                }
                isMulti
                isDisabled={selectedSchoolIds.length === 0}
                value={selectedVendorIds.map((id) => ({
                  value: id,
                  label:
                    vendorsData?.getVendorsForReport?.find(
                      (v: any) => v.vendor_id === id,
                    )?.name ?? "",
                }))}
                onChange={(options) => {
                  const ids = options ? options.map((o: any) => o.value) : [];
                  setSelectedVendorIds(ids);

                  setReportData((prev) => ({
                    ...prev,
                    vendor_list: ids,
                  }));
                }}
                options={
                  vendorsData?.getVendorsForReport?.map((v: any) => ({
                    value: v.vendor_id,
                    label: v.name,
                  })) || []
                }
              />
            </div>
          )}

          {(reportData.type === "TRANSACTION_REPORT" ||
            reportData.type === "VENDOR_TRANSACTION_REPORT") && (
            <div className="flex flex-col px-4 bg-gray-100">
              <label className="my-2">Select Fields</label>

              <Select
                placeholder="Select Fields"
                isMulti
                value={SelectedFields.map((field) => ({
                  value: field,
                  label: field,
                }))}
                onChange={(options) => {
                  const selected = options
                    ? options.map((opt) => opt.value)
                    : [];

                  setSelectedFields(selected);
                  setReportData((prev) => ({
                    ...prev,
                    SelectedFields: selected,
                  }));
                }}
                options={fields.map((f) => ({
                  value: f,
                  label: f,
                }))}
              />
            </div>
          )}

          <div className="flex flex-col p-4 bg-gray-100">
            <label htmlFor="email" className="my-2">
              Save Report As optional (optional)
            </label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={(e) => {
                setReportData((prevData) => ({
                  ...prevData,
                  name: e.target.value,
                }));
              }}
              className="border border-gray-300 focus:ring-2 ring-blue-600 rounded-md px-4 py-2 focus:outline-none "
              placeholder="Eg: Transaction Report"
            />
            <p className="text-[9px] my-2 text-gray-500">
              Enter file name for your report.
            </p>
          </div>
          <div className="flex flex-col px-4 bg-gray-100">
            <label htmlFor="report" className="my-2">
              Select Format optional (optional)
            </label>
            <Select
              closeMenuOnSelect={true}
              onChange={(selectedOption) => {
                setReportData((prevData) => ({
                  ...prevData,
                  format: selectedOption ? selectedOption.value : "",
                }));
              }}
              options={[
                { value: "csv", label: "CSV" },
                // { value: "pdf", label: "PDF" },
                // { value: "excel", label: "Excel" },
              ]}
              isSearchable={false}
            />
            <p className="text-[9px] my-2 text-gray-500">
              Please select the format you want to download the report in.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "What will you receive in this report?",
      subtitle: "Period of data, time, date etc.",
      content: (
        <div className="flex flex-col gap-y-4 pb-4">
          <div className="flex flex-col p-4 bg-gray-100">
            <label htmlFor="report" className="my-2">
              Select Duration *
            </label>

            <div className="flex bg-white ">
              <div className="flex flex-col w-40 p-4 gap-4 mb-2">
                <span
                  onClick={() => handlePresetFilter("today")}
                  className="font-normal px-3 py-1  text-black text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Today
                </span>
                <span
                  onClick={() => handlePresetFilter("last7days")}
                  className="font-normal px-3 py-1  text-black text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Last 7 Days
                </span>
                <span
                  onClick={() => handlePresetFilter("thisMonth")}
                  className="font-normal px-3 py-1  text-black text-xs hover:bg-gray-100 cursor-pointer"
                >
                  This Month
                </span>
                <span
                  onClick={() => handlePresetFilter("lastMonth")}
                  className="font-normal px-3 py-1  text-black text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Last Month
                </span>
              </div>
              <DateRange
                ranges={[selectedRange]}
                rangeColors={["#1E1B59"]}
                className="w-full"
                onChange={(item: any) => {
                  const { startDate, endDate } = item.selection;

                  const diffInMs = endDate.getTime() - startDate.getTime();
                  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

                  if (diffInDays <= MAX_RANGE_DAYS) {
                    setSelectedRange(item.selection);
                  } else {
                    const adjustedEndDate = new Date(startDate);
                    adjustedEndDate.setDate(
                      startDate.getDate() + MAX_RANGE_DAYS,
                    );

                    setSelectedRange({
                      ...item.selection,
                      endDate: adjustedEndDate,
                    });
                  }
                }}
                maxDate={new Date()}
                showDateDisplay={true}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setReportData((prevData) => ({
      ...prevData,
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate,
    }));
  }, [selectedRange]);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  // useEffect(() => {
  //   const reports = data?.getMerchantReportsLogs?.reports || [];
  //   startPolling(3000);
  //   const allResolved =
  //     reports.length > 0 &&
  //     reports.every(
  //       (r: any) =>
  //         (r.status === "COMPLETED" && r.url?.trim() !== "") ||
  //         r.status === "FAILED" ||
  //         r.status === "DELETED" ||
  //         r.status !== "PENDING"
  //     );
  //   console.log("polling", pollingActive && allResolved);

  //   if (pollingActive && allResolved) {
  //     stopPolling();
  //     setPollingActive(false);
  //   }
  // }, [data?.getMerchantReportsLogs?.reports, pollingActive, stopPolling]);

  return (
    <div className="w-full pt-2">
      <Modal
        className=" max-w-2xl "
        open={openModal}
        setOpen={setModal}
        hasChanged={true}
      >
        <div className="p-4 ">
          <h2 className="text-lg font-semibold mb-4">
            Download report for your business
          </h2>
          <p className="text-sm text-gray-600 pb-4">
            Here you can view the details of the selected report.
          </p>

          <div className="overflow-y-auto h-[550px]  ease-in-out border-t border-gray-200 pt-4 ">
            <Accordion items={items} multiple={false} />
            <div className="flex justify-end items-center gap-x-4 ">
              <button
                onClick={() => setModal(false)}
                className="mt-4 border-2 text-black px-6 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (
                    !reportData.startDate ||
                    !reportData.endDate ||
                    !reportData.type
                  ) {
                    toast.warn("Please fill all required fields.");
                    return;
                  }
                  generate({
                    variables: {
                      startDate: format(reportData.startDate, "yyyy-MM-dd"),
                      endDate: format(reportData.endDate, "yyyy-MM-dd"),
                      type: reportData.type,
                      format: reportData.format,
                      name: reportData.name,
                      school_list: reportData.school_list.length
                        ? reportData.school_list
                        : undefined,
                      vendor_list: reportData.vendor_list.length
                        ? reportData.vendor_list
                        : undefined,
                      dynamic_values: SelectedFields.length
                        ? SelectedFields
                        : undefined,
                    },
                    onCompleted: () => {
                      toast.success("Report generation started.");
                      setSelectedRange({
                        startDate: new Date(),
                        endDate: new Date(),
                        key: "selection",
                      });
                      setReportData({
                        startDate: new Date(),
                        endDate: new Date(),
                        name: "",
                        format: "",
                        type: "",
                        email: "",
                        school_list: [],
                        vendor_list: [],
                        SelectedFields: [],
                      });
                      setModal(false);
                    },
                    onError: (error) => {
                      toast.error("Error generating report.");
                      setModal(false);
                    },
                  });
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <_Table
        heading="Reports"
        loading={reportLoading && loading}
        searchBox={
          <div className="flex flex-col  justify-end w-full">
            <div className="flex justify-end gap-x-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  refetch();
                  setTimeout(() => {
                    setLoading(false);
                  }, 1000);
                }}
                className="h-9  flex items-center gap-x-2 bg-gray-200 text-sm rounded-md text-black px-6"
              >
                <RiRefreshLine
                  className={
                    "text-lg " + (loading ? " animate-spin duration-300" : "")
                  }
                />
                Refresh
              </button>
              <button
                onClick={() => setModal(true)}
                className="h-9 flex items-center gap-x-2 bg-[#1E1B59] hover:bg-[#1E1B59] text-white text-sm rounded-md px-6"
              >
                <FiDownload className="text-lg" />
                Download Report
              </button>
            </div>
            <RowsPerPageSelect
              setItemsPerRow={(e: any) => {
                setCurrentPage(1);
                setItemsPerRow(e);
              }}
              itemsPerRow={itemsPerRow}
              className=" justify-start"
            />
          </div>
        }
        data={[
          [
            "Sr.No",
            "Duration Covered",
            "Type",
            "Status",
            "Created At",
            "Download",
          ],
          ...(data?.getSubTrusteeReportsLogs?.reports.map(
            (item: any, index: number) => [
              (currentPage - 1) * itemsPerRow.name + 1 + index,
              `${new Date(item.start_date).toDateString()} - ${new Date(
                item.end_date,
              ).toDateString()}`,
              item.type.replaceAll("_", " "),

              ["COMPLETED", "DELETED", "FAILED"].includes(item.status) ? (
                item.status
              ) : (
                <div className="flex items-end gap-x-2">
                  <LottiePlayer
                    animationData={generatingFileAnimation}
                    width={25}
                    height={25}
                  />
                  <span className="text-xs text-gray-600">Generating...</span>
                </div>
              ),
              new Date(item.createdAt).toDateString(),
              <div className="w-[20px]">
                {item.status === "COMPLETED" && item.url !== "" ? (
                  <a href={item.url}>
                    <FaDownload className="text-xl text-blue-600 hover:text-blue-700" />
                  </a>
                ) : (
                  "N/A"
                )}
              </div>,
            ],
          ) || []),
        ]}
        footer={
          <div className="flex justify-center items-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(data?.getSubTrusteeReportsLogs?.totalPages)}
              onPageChange={handlePageChange}
            />
          </div>
        }
      />
    </div>
  );
}
