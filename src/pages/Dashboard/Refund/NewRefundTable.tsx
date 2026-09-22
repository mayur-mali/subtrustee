import React, { useEffect, useMemo, useState } from "react";
import { NewTable, RowsPerPage } from "../../../components/NewTable";
import type {
  ColumnDefinition,
  RefundData,
  SortState,
} from "../../../components/NewTable";
import { AllInOneFilters } from "../../../components/NewFilters/Filters";

import { useTransactionFilters } from "../../../hooks/useTransactionFilters";
import {
  SUBTRUSTEE_REFUND_REQUESTS,
  GET_SUBTRUSTEE_REFUND_METRICS,
} from "../../../Qurries";
import { useQuery } from "@apollo/client";
import { NewPagination } from "../../../components/NewFilters/NewPagination";
import { getStartAndEndOfMonth } from "../../../utils/getStartAndEndOfMonth";
import { formatDateInDDMMYYYY } from "../../../utils/formateDateInDDMMYYY";

import {
  CircleCheck,
  Clock2,
  Hourglass,
  IndianRupee,
  TriangleAlert,
} from "lucide-react";
import { MetricsCard } from "../../../components/MatricsCard";
import RefundReceiptModal, {
  formatMinutesToHours,
} from "../../Dashboard/Refund/RefundReceiptModal";
import {
  ACCOUNT_TYPE_FILTER_ALL,
  ACCOUNT_TYPE_FILTER_OPTIONS,
  formatAccountType,
  formatConvenienceFee,
  formatRefundGateway,
  formatRefundInitiationType,
  formatRefundOrigin,
  formatRefundSpeed,
  formatPaymentChannel,
  formatPaymentMode,
  getRefundStatusBadgeClass,
  formatRefundStatusLabel,
  GATEWAY_FILTER_ALL,
  GATEWAY_FILTER_OPTIONS,
  normalizeAggregatorFilter,
  REFUND_COLUMN_TOOLTIPS,
  REFUND_SEARCH_FILTER_BY,
  getRefundStage,
  PAYMENT_CHANNEL_FILTER_ALL,
  PAYMENT_CHANNEL_FILTER_OPTIONS,
  PAYMENT_MODE_FILTER_ALL,
  PAYMENT_MODE_FILTER_OPTIONS,
  refundMetaQueryVariables,
  toGatewayQueryValue,
} from "../../../utils/refundDisplay";

const RefundMetricsKeys = {
  TOTAL_REFUNDED: "totalRefunded",
  FAILED_OR_REJECTED: "failedOrRejected",
  AVG_PROCESSING_TIME_IN_MINUTES: "avgProcessingTimeInMinutes",
  PENDING_REFUNDS: "pendingRefunds",
  PROCESS_TODAY: "processToday",
} as const;

function NewRefundTable() {
  const { startDate: defaultStartDate, endDate: defaultEndDate } =
    getStartAndEndOfMonth();

  // Controls & Toggle Mode State
  const [isVirtualizedMode, setIsVirtualizedMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters URL Parameters & State Sync Hook
  const [urlFilters, setUrlFilters] = useTransactionFilters();

  // Local state initialization from URL filters or defaults
  const [searchTerm, setSearchTerm] = useState(() => urlFilters.search);
  const [searchFilterBy, setSearchFilterBy] = useState(
    () => urlFilters.search_filter || "",
  );

  const [startDate, setStartDate] = useState(
    () => urlFilters.start_date || defaultStartDate,
  );
  const [endDate, setEndDate] = useState(
    () => urlFilters.end_date || defaultEndDate,
  );
  const [selectedGateway, setSelectedGateway] = useState(() =>
    normalizeAggregatorFilter(urlFilters.gateway),
  );
  const [selectedAccount, setSelectedAccount] = useState(
    () => urlFilters.account || "All Accounts",
  );
  const [selectedStatus, setSelectedStatus] = useState(
    () => urlFilters.status || "All Statuses",
  );
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState(
    () => urlFilters.payment_channel || PAYMENT_CHANNEL_FILTER_ALL,
  );
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(
    () => urlFilters.payment_mode || PAYMENT_MODE_FILTER_ALL,
  );
  const [selectedAccountType, setSelectedAccountType] = useState(
    () => urlFilters.account_type || ACCOUNT_TYPE_FILTER_ALL,
  );
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(
    () => urlFilters.is_date_range_selected === "true",
  );

  const [selectedInstitute, setSelectedInstitute] = useState(
    () => urlFilters.school_name || "All Institutes",
  );
  const [selectedInstituteId, setSelectedInstituteId] = useState(
    () => urlFilters.school_id || null,
  );

  // Pagination State - Initialized from URL filters or defaults
  const [currentPage, setCurrentPage] = useState(
    () => Number(urlFilters.page) || 1,
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(urlFilters.limit) || 10,
  );

  const searchQuery = searchTerm.trim() !== "" ? searchTerm.trim() : null;
  const queryStartDate = searchQuery
    ? null
    : isDateRangeSelected
      ? startDate
      : defaultStartDate;
  const queryEndDate = searchQuery
    ? null
    : isDateRangeSelected
      ? endDate
      : defaultEndDate;

  const { data: refundMetrics, loading: refundMetricsLoading } = useQuery(
    GET_SUBTRUSTEE_REFUND_METRICS,
    {
      variables: {
        startDate: queryStartDate,
        endDate: queryEndDate,
        status: selectedStatus === "All Statuses" ? null : selectedStatus,
        searchQuery,
        searchFilter: searchFilterBy || null,
        school_id: selectedInstituteId ? [selectedInstituteId] : undefined,
        gateway: toGatewayQueryValue(selectedGateway),
        ...refundMetaQueryVariables({
          paymentChannel: selectedPaymentChannel,
          paymentMode: selectedPaymentMode,
          accountType: selectedAccountType,
        }),
      },
    },
  );

  const [isRowsMenuOpen, setIsRowsMenuOpen] = useState(false);

  // Sorting State
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: "asc",
  });

  // Keep state in sync when URL changes (e.g. from back/forward navigation or clearing filters)
  useEffect(() => {
    setSearchTerm(urlFilters.search);
    setSearchFilterBy(urlFilters.search_filter || "");
    setStartDate(urlFilters.start_date || defaultStartDate);
    setEndDate(urlFilters.end_date || defaultEndDate);
    setSelectedGateway(normalizeAggregatorFilter(urlFilters.gateway));
    setSelectedAccount(urlFilters.account || "All Accounts");
    setSelectedStatus(urlFilters.status || "All Statuses");
    setSelectedPaymentChannel(
      urlFilters.payment_channel || PAYMENT_CHANNEL_FILTER_ALL,
    );
    setSelectedPaymentMode(urlFilters.payment_mode || PAYMENT_MODE_FILTER_ALL);
    setSelectedAccountType(urlFilters.account_type || ACCOUNT_TYPE_FILTER_ALL);
    setIsDateRangeSelected(urlFilters.is_date_range_selected === "true");
    setCurrentPage(Number(urlFilters.page) || 1);
    setRowsPerPage(Number(urlFilters.limit) || 10);
    setSelectedInstitute(urlFilters.school_name || "All Institutes");
    setSelectedInstituteId(urlFilters.school_id || null);
  }, [
    urlFilters.search,
    urlFilters.search_filter,
    urlFilters.start_date,
    urlFilters.end_date,
    urlFilters.gateway,
    urlFilters.account,
    urlFilters.status,
    urlFilters.payment_channel,
    urlFilters.payment_mode,
    urlFilters.account_type,
    urlFilters.is_date_range_selected,
    urlFilters.page,
    urlFilters.limit,
    urlFilters.school_name,
    urlFilters.school_id,
  ]);

  // UNIFIED: Push all filter & pagination state changes back to URL parameters.
  // This replaces the two competing, conflicting useEffect blocks.
  useEffect(() => {
    setUrlFilters({
      search: searchTerm,
      search_filter: searchFilterBy,
      status: selectedStatus === "All Statuses" ? "" : selectedStatus,
      gateway: selectedGateway === GATEWAY_FILTER_ALL ? "" : selectedGateway,
      account: selectedAccount === "All Accounts" ? "" : selectedAccount,
      payment_channel:
        selectedPaymentChannel === PAYMENT_CHANNEL_FILTER_ALL
          ? ""
          : selectedPaymentChannel,
      payment_mode:
        selectedPaymentMode === PAYMENT_MODE_FILTER_ALL
          ? ""
          : selectedPaymentMode,
      account_type:
        selectedAccountType === ACCOUNT_TYPE_FILTER_ALL
          ? ""
          : selectedAccountType,
      start_date: isDateRangeSelected ? startDate : defaultStartDate,
      end_date: isDateRangeSelected ? endDate : defaultEndDate,
      page: currentPage,
      limit: rowsPerPage,
      is_date_range_selected: isDateRangeSelected ? "true" : "",
      school_name:
        selectedInstitute === "All Institutes" ? "" : selectedInstitute,
      school_id: selectedInstituteId,
    });
  }, [
    searchTerm,
    searchFilterBy,
    selectedStatus,
    selectedGateway,
    selectedAccount,
    selectedPaymentChannel,
    selectedPaymentMode,
    selectedAccountType,
    startDate,
    endDate,
    currentPage,
    rowsPerPage,
    isDateRangeSelected,
    selectedInstitute,
    selectedInstituteId,
  ]);

  // Main Apollo GraphQL Query
  const {
    data: refundData,
    loading,
    refetch,
  } = useQuery(SUBTRUSTEE_REFUND_REQUESTS, {
    variables: {
      page: currentPage,
      limit: rowsPerPage,
      startDate: queryStartDate,
      endDate: queryEndDate,
      status: selectedStatus === "All Statuses" ? null : selectedStatus,
      searchQuery,
      searchFilter: searchFilterBy || null,
      school_id: selectedInstituteId ? [selectedInstituteId] : undefined,
      ...refundMetaQueryVariables({
        paymentChannel: selectedPaymentChannel,
        paymentMode: selectedPaymentMode,
        accountType: selectedAccountType,
      }),
      gateway: toGatewayQueryValue(selectedGateway),
    },
  });

  // Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundData | null>(null);

  // Row inspection click
  const handleRowClick = (item: RefundData) => {
    setSelectedRefund(item);
    setIsDetailOpen(true);
  };

  // Row secondary actions
  const handleViewDetails = (item: RefundData) => {
    setSelectedRefund(item);
    setIsDetailOpen(true);
  };

  const refetchDateFetch = async ({
    start_date,
    end_date,
    status,

    search,
    page,
    limit,
  }: {
    start_date?: string | null;
    end_date?: string | null;
    status?: string;

    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const search1 =
      search !== undefined
        ? search
        : searchTerm.trim() !== ""
          ? searchTerm
          : null;
    const hasSearch = Boolean(String(search1 ?? "").trim());

    const startdate = hasSearch
      ? null
      : start_date !== undefined
        ? start_date
        : isDateRangeSelected
          ? startDate
          : defaultStartDate;

    const enddate = hasSearch
      ? null
      : end_date !== undefined
        ? end_date
        : isDateRangeSelected
          ? endDate
          : defaultEndDate;

    const refundStatus =
      status !== undefined
        ? status
        : selectedStatus === "All Statuses"
          ? null
          : selectedStatus;

    const current = page !== undefined ? page : currentPage;

    const pageLimit = limit !== undefined ? limit : rowsPerPage;
    const schoolId = selectedInstituteId ? [selectedInstituteId] : undefined;

    const res = await refetch({
      startDate: startdate,
      endDate: enddate,
      status: refundStatus,
      searchQuery: search1,
      searchFilter: searchFilterBy || null,
      page: current,
      limit: pageLimit,
      school_id: schoolId,
      gateway: toGatewayQueryValue(selectedGateway),
      ...refundMetaQueryVariables({
        paymentChannel: selectedPaymentChannel,
        paymentMode: selectedPaymentMode,
        accountType: selectedAccountType,
      }),
    });
  };

  // Query Refetch Sync
  useEffect(() => {
    refetchDateFetch({
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm || undefined,
      status: selectedStatus === "All Statuses" ? undefined : selectedStatus,
      start_date: isDateRangeSelected ? startDate : defaultStartDate,
      end_date: isDateRangeSelected ? endDate : defaultEndDate,
    });
  }, [
    currentPage,
    rowsPerPage,
    searchTerm,
    searchFilterBy,
    selectedStatus,
    startDate,
    endDate,
    isDateRangeSelected,
    selectedInstituteId,
    selectedGateway,
    selectedPaymentChannel,
    selectedPaymentMode,
    selectedAccountType,
  ]);

  const columns = [
    {
      key: "school_name",
      header: "Institute Name",
      sortable: true,
      width: "24%",
      className: "font-semibold text-[14px] text-[#505E8E]",
    },
    {
      key: "_id",
      header: "Refund ID",
      sortable: true,
      width: "12%",
    },
    {
      key: "custom_id",
      header: "Order ID",
      sortable: true,
      width: "12%",
    },
    {
      key: "order_id",
      header: "Edviron Order ID",
      sortable: true,
      width: "12%",
    },
    {
      key: "refund_arn",
      header: "ARN",
      sortable: true,
      className: "font-medium text-[#344054]",
      render: (item: any) => `${item?.refund_arn ?? "-"}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "11%",
      render: (item: any) => {
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRefundStatusBadgeClass(item.status)}`}
          >
            {formatRefundStatusLabel(item.status)}
          </span>
        );
      },
    },
    {
      key: "order_amount",
      header: "Order Amount",
      sortable: true,
      width: "20%",
      className: "font-medium text-[#344054]",
      render: (item: any) => `₹${item?.order_amount?.toLocaleString("en-IN")}`,
    },
    {
      key: "transaction_amount",
      header: "Transaction Amount",
      sortable: true,
      width: "20%",
      className: "font-medium text-[#344054]",
      render: (item: any) =>
        `₹${item?.transaction_amount?.toLocaleString("en-IN")}`,
    },
    {
      key: "convenience_fee",
      header: "Convenience Fee",
      sortable: false,
      width: "15%",
      className: "font-medium text-[#344054]",
      render: (item: any) =>
        formatConvenienceFee(item?.transaction_amount, item?.order_amount),
    },
    {
      key: "refund_amount",
      header: "Refund Amount",
      sortable: true,
      width: "15%",
      className: "font-bold text-[#101828]",
      render: (item: any) => `₹${item?.refund_amount?.toLocaleString("en-IN")}`,
    },
    {
      key: "createdAt",
      header: "Created On",
      sortable: true,
      width: "15%",
      className: "font-medium text-[#344054]",
      render: (item: any) => {
        return formatDateInDDMMYYYY(item?.createdAt);
      },
    },
    {
      key: "refund_stage",
      header: "Current Stage",
      sortable: false,
      width: "15%",
      className: "font-medium text-[#344054]",
      render: (item: any) => getRefundStage(item?.timeline, item?.status),
    },
    {
      key: "age",
      header: "Time Elapsed",
      sortable: true,
      width: "15%",
      className: "font-medium text-[#344054]",
      render: (item: any) => {
        const ageInMinutes: any = item?.processingTimeInMinutes;
        return formatMinutesToHours(ageInMinutes);
      },
    },
    {
      key: "batch_number",
      header: "Initiation Type",
      sortable: true,
      width: "12%",
      render: (item: any) => formatRefundInitiationType(item),
    },
    {
      key: "refund_origin",
      header: "Refund Source",
      sortable: false,
      width: "16%",
      className: "font-medium text-[#344054]",
      render: (item: any) => formatRefundOrigin(item?.refund_origin),
    },
    {
      key: "account_type",
      header: "Account Type",
      sortable: false,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatAccountType(item?.account_type),
    },
    {
      key: "refund_speed",
      header: "Refund Speed",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatRefundSpeed(item?.refund_speed),
    },
    {
      key: "reason",
      header: "Reason",
      sortable: true,
      width: "16%",
      className: "font-medium text-[#344054]",
      render: (item: any) => {
        const reason = item?.reason || "-";
        return (
          <span className="block max-w-[180px] truncate" title={reason}>
            {reason}
          </span>
        );
      },
    },
    {
      key: "gateway",
      header: "Aggregator",
      sortable: true,
      width: "15%",
      className: "font-medium text-[#344054]",
      render: (item: any) => formatRefundGateway(item?.gateway),
    },
    {
      key: "payment_channel",
      header: "Payment Channel",
      sortable: false,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatPaymentChannel(item?.payment_channel),
    },
    {
      key: "payment_mode",
      header: "Payment Mode",
      sortable: false,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatPaymentMode(item?.payment_mode),
    },
  ].map((col) => ({
    ...col,
    headerTooltip: REFUND_COLUMN_TOOLTIPS[col.key],
  }));

  const handlePageChange = (page: any) => {
    if (page == currentPage) {
      return;
    }
    setCurrentPage(page);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "totalRefunded":
        return (
          <IndianRupee strokeWidth={1.75} className="w-4 h-4 text-[#009966]" />
        );
      case "failedOrRejected":
        return (
          <TriangleAlert
            strokeWidth={1.75}
            className="w-4 h-4 text-[#FB5243]"
          />
        );
      case "pendingRefunds":
        return (
          <Hourglass strokeWidth={1.75} className="w-4 h-4 text-[#FB5243]" />
        );
      case "processToday":
        return (
          <CircleCheck strokeWidth={1.75} className="w-4 h-4 text-[#009966]" />
        );
      case "avgProcessingTimeInMinutes":
        return <Clock2 strokeWidth={1.75} className="w-4 h-4 text-[#009966]" />;
      default:
        return <IndianRupee className="w-4 h-4 text-[#009966]" />;
    }
  };

  return (
    <>
      <RefundReceiptModal
        isOpen={isDetailOpen}
        size="max"
        onClose={() => setIsDetailOpen(false)}
        data={selectedRefund}
      />

      <div className="w-full pb-4">
        <div className=" grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-4">
          <MetricsCard
            title={"Total Refunded"}
            value={
              "₹" +
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.TOTAL_REFUNDED
              ]?.amount.toLocaleString("en-IN")
            }
            subtext={`${
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.TOTAL_REFUNDED
              ]?.count
            } refunds`}
            subtextColor={"text-[#009966]"}
            icon={getIcon(RefundMetricsKeys.TOTAL_REFUNDED)}
            iconWrapClassName="bg-[#ECFDF5]"
            isLoading={refundMetricsLoading}
          />

          <MetricsCard
            title={"Processing Refunds"}
            value={
              "₹" +
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.PENDING_REFUNDS
              ]?.amount.toLocaleString("en-IN")
            }
            subtext={`${
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.PENDING_REFUNDS
              ]?.count
            } refunds`}
            subtextColor={"text-[#FB5243]"}
            icon={getIcon(RefundMetricsKeys.PENDING_REFUNDS)}
            iconWrapClassName="bg-[#FEF2F2]"
            isLoading={refundMetricsLoading}
          />
          <MetricsCard
            title={"Failed/Rejected"}
            value={
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.FAILED_OR_REJECTED
              ]?.amount
            }
            subtext={`${
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.FAILED_OR_REJECTED
              ]?.count
            } refunds`}
            subtextColor={"text-[#FB5243]"}
            icon={getIcon(RefundMetricsKeys.FAILED_OR_REJECTED)}
            iconWrapClassName="bg-[#FEF2F2]"
            isLoading={refundMetricsLoading}
          />
          <MetricsCard
            title={"Avg Processing Time"}
            value={formatMinutesToHours(
              refundMetrics?.getSubTrusteeRefundMetrics[
                RefundMetricsKeys.AVG_PROCESSING_TIME_IN_MINUTES
              ],
            )}
            subtextColor={"text-[#009966]"}
            icon={getIcon(RefundMetricsKeys.AVG_PROCESSING_TIME_IN_MINUTES)}
            iconWrapClassName="bg-[#ECFDF5]"
            isLoading={refundMetricsLoading}
          />
        </div>
        {/* <div className="flex justify-end items-center mb-2">
          <RowsPerPage
            dropdownPlacement="bottom"
            currentLimit={rowsPerPage}
            setLimit={setRowsPerPage}
          />
        </div> */}
        <NewTable
          isRowPerPage={
            <RowsPerPage
              dropdownPlacement="bottom"
              currentLimit={rowsPerPage}
              setLimit={setRowsPerPage}
            />
          }
          data={refundData?.getSubTrusteeRefundRequests?.refund}
          serialNumber={true}
          isLoading={loading || isRefreshing}
          copyItemKeys={["_id", "order_id", "custom_id"]}
          header={
            <>
              <AllInOneFilters
                search={{
                  value: searchTerm,
                  onChange: setSearchTerm,
                  filterBy: searchFilterBy,
                  searchFilterBy: REFUND_SEARCH_FILTER_BY,
                  onFilterByChange: setSearchFilterBy,
                }}
                dateRange={{
                  startDate,
                  endDate,
                  action: (start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  },
                  isDateRangeSelected,
                  onDateRangeSelectedChange: setIsDateRangeSelected,
                }}
                gateway={{
                  options: GATEWAY_FILTER_OPTIONS,
                  value: selectedGateway,
                  onChange: setSelectedGateway,
                  defaultLabel: GATEWAY_FILTER_ALL,
                  placeholder: "Aggregator",
                  chipLabel: "Aggregator",
                }}
                paymentChannel={{
                  options: PAYMENT_CHANNEL_FILTER_OPTIONS,
                  value: selectedPaymentChannel,
                  onChange: setSelectedPaymentChannel,
                }}
                paymentMode={{
                  options: PAYMENT_MODE_FILTER_OPTIONS,
                  value: selectedPaymentMode,
                  onChange: setSelectedPaymentMode,
                }}
                accountType={{
                  options: ACCOUNT_TYPE_FILTER_OPTIONS,
                  value: selectedAccountType,
                  onChange: setSelectedAccountType,
                }}
                institute={{
                  value: selectedInstitute,
                  action: setSelectedInstitute,
                  setSchoolId: setSelectedInstituteId,
                }}
                status={{
                  statusOption: [
                    "All Statuses",
                    "INITIATED",
                    "REJECTED",
                    "APPROVED",
                    "DELETED BY USER",
                  ],
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                }}
              />
            </>
          }
          columns={columns}
          virtualized={isVirtualizedMode}
          rowHeight={64}
          viewportHeight={550}
          onRowClick={handleRowClick}
          onView={handleViewDetails}
          stickyActionColumn
          heading="Refunds"
          exportBtn={true}
          footer={
            refundData?.getSubTrusteeRefundRequests?.refund?.length > 0 && (
              <NewPagination
                currentPage={
                  refundData?.getSubTrusteeRefundRequests?.currentPage
                }
                totalPages={refundData?.getSubTrusteeRefundRequests?.totalPages}
                onPageChange={handlePageChange}
              />
            )
          }
        />
      </div>
    </>
  );
}

export default NewRefundTable;
