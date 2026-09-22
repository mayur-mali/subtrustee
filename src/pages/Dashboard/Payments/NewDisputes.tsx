import React, { useEffect, useState } from "react";
import { getStartAndEndOfMonth } from "../../../utils/getStartAndEndOfMonth";
import { useTransactionFilters } from "../../../hooks/useTransactionFilters";
import {
  GET_SUBTRUSTEE_DISPUTE_METRICS,
  GET_SUBTRUSTEE_DISPUTES,
} from "../../../Qurries";
import { useQuery } from "@apollo/client";
import { MetricsCard } from "../../../components/MatricsCard";
import { NewTable, RowsPerPage } from "../../../components/NewTable";
import { NewPagination } from "../../../components/NewFilters/NewPagination";
import { AllInOneFilters } from "../../../components/NewFilters/Filters";
import {
  CircleCheck,
  Hourglass,
  IndianRupee,
  TriangleAlert,
} from "lucide-react";
import DisputeReceiptModal from "./DisputeReceiptModal";
import {
  DISPUTE_COLUMN_TOOLTIPS,
  DISPUTE_SEARCH_FILTER_BY,
  DISPUTE_STATUS_FILTER_ALL,
  DISPUTE_STATUS_FILTER_OPTIONS,
  DISPUTE_TYPE_FILTER_ALL,
  DISPUTE_TYPE_FILTER_OPTIONS,
  GATEWAY_FILTER_ALL,
  GATEWAY_FILTER_OPTIONS,
  formatDisputeAmount,
  formatDisputeDate,
  formatDisputeMetricAmount,
  formatDisputeType,
  formatDisputeStatus,
  formatPaymentChannel,
  formatPaymentMode,
  formatDisputeGateway,
  getDisputeSlaMeta,
  getDisputeStatusBadgeClass,
  matchesDisputeGatewayFilter,
  matchesDisputeStatusFilter,
  matchesDisputeTypeFilter,
  normalizeAggregatorFilter,
  toDisputeStatusQueryValue,
} from "../../../utils/disputeDisplay";

const ChargebacksMetricsKeys = {
  TOTAL_CHARGEBACKS: "totalChargebacks",
  PENDING_RESPONSE: "pendingResponse",
  WON_DISPUTES: "wonDisputes",
  LOST_DISPUTES: "lostDisputes",
} as const;

function NewDisputes() {
  const { startDate: defaultStartDate, endDate: defaultEndDate } =
    getStartAndEndOfMonth();
  const [urlFilters, setUrlFilters] = useTransactionFilters();
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
  const [isDateRangeSelected, setIsDateRangeSelected] = useState(
    () => urlFilters.is_date_range_selected === "true",
  );
  const [selectedStatus, setSelectedStatus] = useState(
    () => urlFilters.status || DISPUTE_STATUS_FILTER_ALL,
  );
  const [selectedGateway, setSelectedGateway] = useState(() =>
    normalizeAggregatorFilter(urlFilters.gateway),
  );
  const [selectedType, setSelectedType] = useState(
    () => urlFilters.dispute_type || DISPUTE_TYPE_FILTER_ALL,
  );
  const [selectedInstitute, setSelectedInstitute] = useState(
    () => urlFilters.school_name || "All Institutes",
  );
  const [selectedInstituteId, setSelectedInstituteId] = useState(
    () => urlFilters.school_id || null,
  );
  const [currentPage, setCurrentPage] = useState(
    () => Number(urlFilters.page) || 1,
  );
  const [rowsPerPage, setRowsPerPage] = useState(
    () => Number(urlFilters.limit) || 10,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);

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
  const disputeStatus = toDisputeStatusQueryValue(selectedStatus);
  const schoolId = selectedInstituteId ? [selectedInstituteId] : undefined;
  const collect_id =
    searchQuery && searchFilterBy === "order_id" ? searchQuery : null;
  const custom_id =
    searchQuery && (searchFilterBy === "custom_id" || !searchFilterBy)
      ? searchQuery
      : null;
  const dispute_id =
    searchQuery && searchFilterBy === "dispute_id" ? searchQuery : null;

  const handleRowClick = (item: any) => {
    setSelectedDispute(item);
    setIsDetailOpen(true);
  };

  const handleViewDetails = (item: any) => {
    setSelectedDispute(item);
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setSelectedDispute(null);
  };

  useEffect(() => {
    setSearchTerm(urlFilters.search);
    setSearchFilterBy(urlFilters.search_filter || "");
    setStartDate(urlFilters.start_date || defaultStartDate);
    setEndDate(urlFilters.end_date || defaultEndDate);
    setSelectedStatus(urlFilters.status || DISPUTE_STATUS_FILTER_ALL);
    setSelectedGateway(normalizeAggregatorFilter(urlFilters.gateway));
    setSelectedType(urlFilters.dispute_type || DISPUTE_TYPE_FILTER_ALL);
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
    urlFilters.status,
    urlFilters.gateway,
    urlFilters.dispute_type,
    urlFilters.is_date_range_selected,
    urlFilters.page,
    urlFilters.limit,
    urlFilters.school_name,
    urlFilters.school_id,
  ]);

  useEffect(() => {
    setUrlFilters({
      search: searchTerm,
      search_filter: searchFilterBy,
      status:
        selectedStatus === DISPUTE_STATUS_FILTER_ALL ? "" : selectedStatus,
      gateway: selectedGateway === GATEWAY_FILTER_ALL ? "" : selectedGateway,
      dispute_type:
        selectedType === DISPUTE_TYPE_FILTER_ALL ? "" : selectedType,
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
    selectedType,
    startDate,
    endDate,
    currentPage,
    rowsPerPage,
    isDateRangeSelected,
    selectedInstitute,
    selectedInstituteId,
  ]);

  const { data: disputeMetricsData, loading: loadingMatrics } = useQuery(
    GET_SUBTRUSTEE_DISPUTE_METRICS,
    {
      variables: {
        page: currentPage,
        limit: rowsPerPage,
        school_id: schoolId,
        collect_id,
        custom_id,
        dispute_id,
        startDate: queryStartDate,
        endDate: queryEndDate,
        dispute_status: disputeStatus,
      },
    },
  );

  const {
    data: disputeData,
    loading,
    refetch,
  } = useQuery(GET_SUBTRUSTEE_DISPUTES, {
    variables: {
      page: currentPage,
      limit: rowsPerPage,
      school_id: schoolId,
      collect_id,
      custom_id,
      dispute_id,
      startDate: queryStartDate,
      endDate: queryEndDate,
      dispute_status: disputeStatus,
    },
    fetchPolicy: "network-only",
  });

  const refetchDateFetch = async ({
    start_date,
    end_date,
    dispute_status,
    search,
    page,
    limit,
    searchFilter,
  }: {
    start_date?: string | null;
    end_date?: string | null;
    dispute_status?: string;
    search?: string;
    page?: number;
    limit?: number;
    searchFilter?: string;
  }) => {
    const search1 =
      search !== undefined
        ? search
        : searchTerm.trim() !== ""
          ? searchTerm
          : null;
    const hasSearch = Boolean(String(search1 ?? "").trim());
    const activeFilter =
      searchFilter !== undefined ? searchFilter : searchFilterBy;

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

    const statusValue =
      dispute_status !== undefined
        ? dispute_status
        : toDisputeStatusQueryValue(selectedStatus);

    const current = page !== undefined ? page : currentPage;
    const pageLimit = limit !== undefined ? limit : rowsPerPage;
    const querySearch = String(search1 ?? "").trim() || null;

    await refetch({
      startDate: startdate,
      endDate: enddate,
      dispute_status: statusValue,
      page: current,
      limit: pageLimit,
      school_id: selectedInstituteId ? [selectedInstituteId] : undefined,
      collect_id:
        querySearch && activeFilter === "order_id" ? querySearch : null,
      custom_id:
        querySearch && (activeFilter === "custom_id" || !activeFilter)
          ? querySearch
          : null,
      dispute_id:
        querySearch && activeFilter === "dispute_id" ? querySearch : null,
    });
  };

  useEffect(() => {
    refetchDateFetch({
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm || undefined,
      searchFilter: searchFilterBy,
      dispute_status: toDisputeStatusQueryValue(selectedStatus),
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
  ]);

  const columns = [
    {
      key: "school_name",
      header: "Institute Name",
      sortable: true,
      width: "18%",
      className: "font-semibold text-[14px] text-[#505E8E]",
    },
    {
      key: "dispute_created_date",
      header: "Created Date",
      sortable: true,
      width: "11%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatDisputeDate(item?.dispute_created_date),
    },
    {
      key: "dispute_amount",
      header: "Chargeback Amount",
      sortable: true,
      width: "13%",
      className: "font-semibold text-[#101828] text-left",
      render: (item: any) => formatDisputeAmount(item?.dispute_amount),
    },
    {
      key: "bank_reference",
      header: "Bank Reference No.",
      sortable: true,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "dispute_type",
      header: "Type",
      sortable: true,
      width: "11%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) =>
        formatDisputeType(item?.dispute_type, item?.dispute_status),
    },
    {
      key: "dispute_id",
      header: "Chargeback ID",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "dispute_status",
      header: "Status",
      sortable: true,
      width: "11%",
      render: (item: any) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDisputeStatusBadgeClass(item.dispute_status)}`}
        >
          {formatDisputeStatus(item.dispute_status, item.dispute_type)}
        </span>
      ),
    },
    {
      key: "dispute_respond_by_date",
      header: "SLA",
      sortable: true,
      width: "12%",
      render: (item: any) => {
        const sla = getDisputeSlaMeta(
          item?.dispute_respond_by_date,
          item?.dispute_status,
        );
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${sla.dotClass}`} />
            <div className="min-w-0">
              <div className={`text-xs font-semibold ${sla.titleClass}`}>
                {sla.title}
              </div>
              {sla.subtitle ? (
                <div className="text-[11px] text-[#667085]">{sla.subtitle}</div>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      key: "respond_by",
      header: "Respond by",
      sortable: true,
      width: "11%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatDisputeDate(item?.dispute_respond_by_date),
    },
    {
      key: "custom_order_id",
      header: "Order ID",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "collect_id",
      header: "Edviron Order ID",
      sortable: true,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "order_amount",
      header: "Order Amount",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatDisputeAmount(item?.order_amount),
    },
    {
      key: "payment_amount",
      header: "Transaction Amount",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) =>
        formatDisputeAmount(item?.payment_amount ?? item?.order_amount),
    },
    {
      key: "student_name",
      header: "Student Name",
      sortable: true,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "student_id",
      header: "Student ID",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "student_phone",
      header: "Phone Number",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "gateway",
      header: "Aggregator",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => {
        const name = formatDisputeGateway(item?.gateway);
        if (!name || name === "-") return "-";
        return <span className="inline-flex items-center gap-1.5">{name}</span>;
      },
    },
    {
      key: "payment_channel",
      header: "Payment Channel",
      sortable: true,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatPaymentChannel(item?.payment_channel),
    },
    {
      key: "payment_mode",
      header: "Payment Mode",
      sortable: true,
      width: "12%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => formatPaymentMode(item?.payment_mode),
    },
    {
      key: "remarks",
      header: "Recent Remark",
      sortable: true,
      width: "16%",
      className: "font-medium text-[#344054] text-left",
      render: (item: any) => {
        const remark = item?.remarks || item?.dispute_remark || "-";
        return (
          <span className="block max-w-[180px] truncate" title={remark}>
            {remark}
          </span>
        );
      },
    },
    {
      key: "settlement_id",
      header: "Settlement Impacted",
      sortable: true,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
    },
    {
      key: "dispute_deduction_settlement_utr",
      header: "Settlement Adjusted",
      sortable: true,
      width: "14%",
      className: "font-medium text-[#344054] text-left",
    },
  ].map((col) => ({
    ...col,
    headerTooltip: DISPUTE_COLUMN_TOOLTIPS[col.key],
  }));

  const tableRows = (disputeData?.getSubTrusteeDisputes?.disputes || []).filter(
    (item: any) =>
      matchesDisputeGatewayFilter(item?.gateway, selectedGateway) &&
      matchesDisputeTypeFilter(
        item?.dispute_type,
        selectedType,
        item?.dispute_status,
      ) &&
      matchesDisputeStatusFilter(
        item?.dispute_status,
        selectedStatus,
        item?.dispute_type,
      ),
  );

  const handlePageChange = (page: any) => {
    if (page == currentPage) {
      return;
    }
    setCurrentPage(page);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case ChargebacksMetricsKeys.TOTAL_CHARGEBACKS:
        return (
          <IndianRupee strokeWidth={1.75} className="w-4 h-4 text-[#009966]" />
        );
      case ChargebacksMetricsKeys.PENDING_RESPONSE:
        return (
          <Hourglass strokeWidth={1.75} className="w-4 h-4 text-[#FB5243]" />
        );
      case ChargebacksMetricsKeys.WON_DISPUTES:
        return (
          <CircleCheck strokeWidth={1.75} className="w-4 h-4 text-[#009966]" />
        );
      case ChargebacksMetricsKeys.LOST_DISPUTES:
        return (
          <TriangleAlert
            strokeWidth={1.75}
            className="w-4 h-4 text-[#FB5243]"
          />
        );
      default:
        return <IndianRupee className="w-4 h-4 text-[#009966]" />;
    }
  };

  const metrics = disputeMetricsData?.getSubTrusteeDisputeMetrics;

  return (
    <>
      <DisputeReceiptModal
        isOpen={isDetailOpen}
        size="6xl"
        onClose={handleCloseDetails}
        data={selectedDispute}
      />
      <div className="w-full pb-4">
        <div className=" grid xl:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-4">
          <MetricsCard
            title={"Total Disputes"}
            value={formatDisputeMetricAmount(
              metrics?.[ChargebacksMetricsKeys.TOTAL_CHARGEBACKS]?.sum,
            )}
            subtext={`${metrics?.[ChargebacksMetricsKeys.TOTAL_CHARGEBACKS]?.count || 0} disputes`}
            subtextColor={"text-[#009966]"}
            icon={getIcon(ChargebacksMetricsKeys.TOTAL_CHARGEBACKS)}
            iconWrapClassName="bg-[#F8FAFC]"
            isLoading={loadingMatrics}
          />

          <MetricsCard
            title={"Pending Response"}
            value={formatDisputeMetricAmount(
              metrics?.[ChargebacksMetricsKeys.PENDING_RESPONSE]?.sum,
            )}
            subtext={`${metrics?.[ChargebacksMetricsKeys.PENDING_RESPONSE]?.count || 0} requests`}
            subtextColor={"text-[#FB5243]"}
            icon={getIcon(ChargebacksMetricsKeys.PENDING_RESPONSE)}
            iconWrapClassName="bg-[#F8FAFC]"
            isLoading={loadingMatrics}
          />
          <MetricsCard
            title={"Won Disputes"}
            value={formatDisputeMetricAmount(
              metrics?.[ChargebacksMetricsKeys.WON_DISPUTES]?.sum,
            )}
            subtext={`${metrics?.[ChargebacksMetricsKeys.WON_DISPUTES]?.count || 0} Disputes`}
            subtextColor={"text-[#009966]"}
            icon={getIcon(ChargebacksMetricsKeys.WON_DISPUTES)}
            iconWrapClassName="bg-[#F8FAFC]"
            isLoading={loadingMatrics}
          />
          <MetricsCard
            title={"Lost Disputes"}
            value={formatDisputeMetricAmount(
              metrics?.[ChargebacksMetricsKeys.LOST_DISPUTES]?.sum,
            )}
            subtext={`${metrics?.[ChargebacksMetricsKeys.LOST_DISPUTES]?.count || 0} Disputes`}
            subtextColor={"text-[#FB5243]"}
            icon={getIcon(ChargebacksMetricsKeys.LOST_DISPUTES)}
            iconWrapClassName="bg-[#F8FAFC]"
            isLoading={loadingMatrics}
          />
        </div>
        <NewTable
          data={tableRows}
          serialNumber={true}
          isLoading={loading}
          copyItemKeys={[
            "bank_reference",
            "dispute_id",
            "custom_order_id",
            "collect_id",
            "student_id",
          ]}
          isRowPerPage={
            <RowsPerPage
              dropdownPlacement="bottom"
              currentLimit={rowsPerPage}
              setLimit={setRowsPerPage}
            />
          }
          header={
            <>
              <AllInOneFilters
                singleRow
                search={{
                  value: searchTerm,
                  onChange: setSearchTerm,
                  filterBy: searchFilterBy,
                  searchFilterBy: DISPUTE_SEARCH_FILTER_BY,
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
                institute={{
                  value: selectedInstitute,
                  action: setSelectedInstitute,
                  setSchoolId: setSelectedInstituteId,
                }}
                type={{
                  options: DISPUTE_TYPE_FILTER_OPTIONS,
                  value: selectedType,
                  onChange: setSelectedType,
                  defaultLabel: DISPUTE_TYPE_FILTER_ALL,
                  placeholder: "Type",
                  chipLabel: "Type",
                }}
                status={{
                  statusOption: DISPUTE_STATUS_FILTER_OPTIONS,
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                }}
              />
            </>
          }
          columns={columns}
          rowHeight={64}
          viewportHeight={550}
          onRowClick={handleRowClick}
          onView={handleViewDetails}
          stickyActionColumn
          heading="Disputes"
          exportBtn={true}
          footer={
            tableRows.length > 0 && (
              <NewPagination
                currentPage={currentPage}
                totalPages={Math.max(
                  Number(disputeData?.getSubTrusteeDisputes?.totalPages) || 1,
                  1,
                )}
                onPageChange={handlePageChange}
              />
            )
          }
        />
      </div>
    </>
  );
}

export default NewDisputes;
