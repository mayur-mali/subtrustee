import React from "react";
import { Download, Plus, X } from "lucide-react";
import { SearchFilter } from "./SearchFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { GatewayFilter } from "./GatewayFilter";
import { AccountFilter } from "./AccountFilter";
import { StatusFilter } from "./StatusFilter";
import { getStartAndEndOfMonth } from "../../utils/getStartAndEndOfMonth";
import InstituteFilterGraphql from "./InstituteFilterGraphql";
import { SelectFilter } from "./SelectFilter";

export interface SearchFilterConfig {
  value?: string;
  searchTerm?: string;
  onChange?: (val: string) => void;
  action?: (val: string) => void;
  placeholder?: string;
  searchFilterBy?: SearchFilterBy;
  onFilterByChange?: (val: string) => void;
  filterBy?: string;
  debounce?: boolean;
}

export interface MultiInstituteFilterConfig {
  selectedInstituteIds?: string[];
  onInstituteIdsChange?: (ids: string[]) => void;
}

export interface MultiStatusFilterConfig {
  selectedStatuses?: string[];
  onStatusesChange?: (statuses: string[]) => void;
  onChange?: (statuses: string[]) => void;
  statusesList?: { label: string; value: string }[] | string[];
  options?: { label: string; value: string }[] | string[];
  placeholder?: string;
}

export interface DateRangeFilterConfig {
  startDate?: string | null;
  endDate?: string | null;
  onChange?: (start: string, end: string) => void;
  action?: (start: string, end: string) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
  isDateRangeSelected?: boolean;
  onDateRangeSelectedChange?: (selected: boolean) => void;
}

export interface DropdownFilterConfig {
  value?: string;
  selectedGateway?: string;
  selectedAccount?: string;
  selectedStatus?: string;
  gateway?: string;
  account?: string;
  status?: string;

  onChange?: (val: string) => void;
  action?: (val: string) => void;

  options?: string[];
  gatewaysList?: string[];
  accountsList?: string[];
  statusesList?: string[];
  statusOption?: string[];

  defaultLabel?: string;
  placeholder?: string;
  chipLabel?: string;
  setSchoolId?: (id: string | null) => void;
}

export type SearchFilterBy = {
  searchFilterBy: Record<string, string>[];
};

export interface FiltersProps {
  // Grouped configuration props
  search?: SearchFilterConfig;
  dateRange?: DateRangeFilterConfig;
  gateway?: DropdownFilterConfig;
  account?: DropdownFilterConfig;
  status?: DropdownFilterConfig;
  institute?: DropdownFilterConfig;
  type?: DropdownFilterConfig;
  multiInstitute?: MultiInstituteFilterConfig;
  multiStatus?: MultiStatusFilterConfig;
  paymentChannel?: DropdownFilterConfig;
  paymentMode?: DropdownFilterConfig;
  accountType?: DropdownFilterConfig;

  /** Search and dropdowns on one row, matching the Disputes toolbar. */
  singleRow?: boolean;

  // Global actions
  onExport?: () => void;
  createBtn?: {
    createLable?: string;
    createLabel?: string;
    action: () => void;
  };

  // Backwards compatibility for flat parameters
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  startDate?: string | null;
  endDate?: string | null;
  onDateChange?: (start: string, end: string) => void;
  selectedGateway?: string;
  onGatewayChange?: (val: string) => void;
  selectedAccount?: string;
  onAccountChange?: (val: string) => void;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  onCreateRefund?: () => void;
  createButtonLabel?: string;
  selectedInstitute?: string;
  onInstituteChange?: (val: string) => void;

  gatewaysList?: string[];
  accountsList?: string[];
  statusesList?: string[];
}

const { startDate: calculatedDefaultStart, endDate: calculatedDefaultEnd } =
  getStartAndEndOfMonth();

export function AllInOneFilters(props: FiltersProps) {
  // --- 1. RESOLVING SEARCH CONFIG ---
  const searchVal =
    props.search?.value ?? props.search?.searchTerm ?? props.searchTerm ?? "";
  const searchChange =
    props.search?.onChange ?? props.search?.action ?? props.onSearchChange;
  const searchPlaceholder = props.search?.placeholder ?? "Search";

  // --- 2. RESOLVING DATE RANGE CONFIG ---
  // --- 2. RESOLVING DATE RANGE CONFIG ---
  const dateStart =
    props.dateRange?.startDate ?? props.startDate ?? calculatedDefaultStart;
  const dateEnd =
    props.dateRange?.endDate ?? props.endDate ?? calculatedDefaultEnd;
  const dateChange =
    props.dateRange?.onChange ?? props.dateRange?.action ?? props.onDateChange;
  const defStart = props.dateRange?.defaultStartDate ?? calculatedDefaultStart;
  const defEnd = props.dateRange?.defaultEndDate ?? calculatedDefaultEnd;

  // --- 3. RESOLVING GATEWAY CONFIG ---
  const gatewayVal =
    props.gateway?.value ??
    props.gateway?.selectedGateway ??
    props.gateway?.gateway ??
    props.selectedGateway ??
    "All Gateways";
  const gatewayChange =
    props.gateway?.onChange ?? props.gateway?.action ?? props.onGatewayChange;
  const gatewayOptions = props.gateway?.options ??
    props.gateway?.gatewaysList ??
    props.gatewaysList ?? [
      "All Gateways",
      "Razorpay",
      "PayU",
      "Cashfree",
      "Stripe",
    ];
  const gatewayDefLabel =
    props.gateway?.defaultLabel ?? gatewayOptions[0] ?? "All Gateways";
  const gatewayPlaceholder = props.gateway?.placeholder ?? "Gateways";
  const gatewayChipLabel = props.gateway?.chipLabel ?? "Gateway";

  // --- 4. RESOLVING ACCOUNT CONFIG ---
  const accountVal =
    props.account?.value ??
    props.account?.selectedAccount ??
    props.account?.account ??
    props.selectedAccount ??
    "All Accounts";
  const accountChange =
    props.account?.onChange ?? props.account?.action ?? props.onAccountChange;
  const accountOptions = props.account?.options ??
    props.account?.accountsList ??
    props.accountsList ?? [
      "All Accounts",
      "Primary HDFC",
      "Secondary ICICI",
      "Sponsor Account",
    ];
  const accountDefLabel =
    props.account?.defaultLabel ?? accountOptions[0] ?? "All Accounts";

  // --- 5. RESOLVING STATUS CONFIG ---
  const statusVal =
    props.status?.value ??
    props.status?.selectedStatus ??
    props.status?.status ??
    props.selectedStatus ??
    "All Statuses";
  const statusChange =
    props.status?.onChange ?? props.status?.action ?? props.onStatusChange;
  const statusOptions = props.status?.options ??
    props.status?.statusesList ??
    props.status?.statusOption ??
    props.statusesList ?? [
      "All Statuses",
      "Processed",
      "Failed",
      "Pending",
      "Rejected",
      "Initiated",
    ];
  const statusDefLabel =
    props.status?.defaultLabel ?? statusOptions[0] ?? "All Statuses";

  // --- 6. RESOLVING INSTITUTE CONFIG ---
  const instituteVal =
    props.institute?.value ??
    props.institute?.selectedStatus ??
    props.institute?.status ??
    props.selectedInstitute ??
    "All Institutes";
  const instituteChange =
    props.institute?.onChange ??
    props.institute?.action ??
    props.onInstituteChange;
  const instituteDefLabel = props.institute?.defaultLabel ?? "All Institutes";

  const multiInstituteIds = props.multiInstitute?.selectedInstituteIds ?? [];
  const multiInstituteChange = props.multiInstitute?.onInstituteIdsChange;

  const paymentChannelVal =
    props.paymentChannel?.value ?? "All Payment Channels";
  const paymentChannelChange =
    props.paymentChannel?.onChange ?? props.paymentChannel?.action;
  const paymentChannelOptions = props.paymentChannel?.options ?? [
    "All Payment Channels",
    "Payment Form",
    "AutoDebit Payment",
    "Online",
    "Offline",
    "Fee Financing",
  ];
  const paymentChannelDefLabel =
    props.paymentChannel?.defaultLabel ??
    paymentChannelOptions[0] ??
    "All Payment Channels";

  const paymentModeVal = props.paymentMode?.value ?? "All Payment Modes";
  const paymentModeChange =
    props.paymentMode?.onChange ?? props.paymentMode?.action;
  const paymentModeOptions = props.paymentMode?.options ?? [
    "All Payment Modes",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Wallet",
    "Pay Later",
    "Cardless EMI",
    "QR",
  ];
  const paymentModeDefLabel =
    props.paymentMode?.defaultLabel ??
    paymentModeOptions[0] ??
    "All Payment Modes";

  const accountTypeVal = props.accountType?.value ?? "All Account Types";
  const accountTypeChange =
    props.accountType?.onChange ?? props.accountType?.action;
  const accountTypeOptions = props.accountType?.options ?? [
    "All Account Types",
    "Merchant",
    "Vendor",
  ];
  const accountTypeDefLabel =
    props.accountType?.defaultLabel ??
    accountTypeOptions[0] ??
    "All Account Types";

  const typeVal = props.type?.value ?? "All Types";
  const typeChange = props.type?.onChange ?? props.type?.action;
  const typeOptions = props.type?.options ?? ["All Types"];
  const typeDefLabel =
    props.type?.defaultLabel ?? typeOptions[0] ?? "All Types";
  const typePlaceholder = props.type?.placeholder ?? "Type";
  const typeChipLabel = props.type?.chipLabel ?? "Type";

  // --- Helpers for Display ---
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const hasActiveFilters =
    (searchChange && searchVal !== "") ||
    (gatewayChange && gatewayVal !== gatewayDefLabel) ||
    (accountChange && accountVal !== accountDefLabel) ||
    (statusChange && statusVal !== statusDefLabel) ||
    (instituteChange && instituteVal !== instituteDefLabel) ||
    (multiInstituteChange && multiInstituteIds.length > 0) ||
    (paymentChannelChange && paymentChannelVal !== paymentChannelDefLabel) ||
    (paymentModeChange && paymentModeVal !== paymentModeDefLabel) ||
    (accountTypeChange && accountTypeVal !== accountTypeDefLabel) ||
    (typeChange && typeVal !== typeDefLabel) ||
    (dateChange && (dateStart !== defStart || dateEnd !== defEnd));

  const handleResetFilters = () => {
    if (searchChange) searchChange("");
    if (gatewayChange) gatewayChange(gatewayDefLabel);
    if (accountChange) accountChange(accountDefLabel);
    if (statusChange) statusChange(statusDefLabel);
    if (instituteChange) instituteChange(instituteDefLabel);
    if (multiInstituteChange) multiInstituteChange([]);
    if (paymentChannelChange) paymentChannelChange(paymentChannelDefLabel);
    if (paymentModeChange) paymentModeChange(paymentModeDefLabel);
    if (accountTypeChange) accountTypeChange(accountTypeDefLabel);
    if (typeChange) typeChange(typeDefLabel);
    if (dateChange) dateChange(defStart, defEnd);
    if (props.institute?.setSchoolId) {
      props.institute.setSchoolId(null);
    }
    if (props.dateRange?.onDateRangeSelectedChange) {
      props.dateRange.onDateRangeSelectedChange(false);
    }
  };
  const hasAnyControl = !!(
    searchChange ||
    dateChange ||
    gatewayChange ||
    accountChange ||
    statusChange ||
    instituteChange ||
    multiInstituteChange ||
    paymentChannelChange ||
    paymentModeChange ||
    accountTypeChange ||
    typeChange ||
    props.onExport ||
    props.onCreateRefund ||
    props.createBtn
  );

  if (!hasAnyControl) return null;

  return (
    <div className="space-y-4 font-sans z-50" id="filters-panel">
      {/* Search and Filters Controls Container */}
      <div className="space-y-3 bg-white p-1 rounded-xl" id="controls-row">
        <div
          className={
            props.singleRow
              ? "flex items-center gap-3 min-w-0"
              : "flex items-center justify-between gap-3"
          }
        >
          {searchChange && (
            <div className={props.singleRow ? "flex-1 min-w-0" : undefined}>
              <SearchFilter
                value={searchVal}
                onChange={searchChange}
                placeholder={searchPlaceholder}
                searchFilterBy={props.search?.searchFilterBy}
                onFilterByChange={props.search?.onFilterByChange}
                selectedFilter={props.search?.filterBy}
              />
            </div>
          )}
          {(props.createBtn || props.onCreateRefund) && (
            <button
              onClick={
                props.createBtn ? props.createBtn.action : props.onCreateRefund
              }
              className="flex items-center gap-2 ml-auto shrink-0 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
              id="create-refund-button"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>
                {props.createBtn
                  ? props.createBtn.createLable ||
                    props.createBtn.createLabel ||
                    "Create"
                  : props.createButtonLabel || "Create Refund"}
              </span>
            </button>
          )}
          {props.singleRow ? (
            <div
              className="flex items-center gap-2 ml-auto shrink-0"
              id="filter-dropdowns-group"
            >
              {dateChange && (
                <DateRangeFilter
                  startDate={dateStart}
                  endDate={dateEnd}
                  onDateChange={dateChange}
                  isDateRangeSelected={props.dateRange?.isDateRangeSelected}
                  onDateRangeSelectedChange={
                    props.dateRange?.onDateRangeSelectedChange
                  }
                />
              )}
              {gatewayChange && (
                <GatewayFilter
                  selectedGateway={gatewayVal}
                  onGatewayChange={gatewayChange}
                  gatewaysList={gatewayOptions}
                  allValue={gatewayDefLabel}
                  placeholder={gatewayPlaceholder}
                />
              )}
              {instituteChange && (
                <InstituteFilterGraphql
                  selectedInstitute={instituteVal}
                  onInstituteChange={instituteChange}
                  setSchoolId={props.institute?.setSchoolId}
                />
              )}
              {accountChange && (
                <AccountFilter
                  selectedAccount={accountVal}
                  onAccountChange={accountChange}
                  accountsList={accountOptions}
                />
              )}
              {paymentChannelChange && (
                <SelectFilter
                  selected={paymentChannelVal}
                  onChange={paymentChannelChange}
                  options={paymentChannelOptions}
                  allValue={paymentChannelDefLabel}
                  shortLabel="Payment Channel"
                  id="payment-channel-filter"
                />
              )}
              {paymentModeChange && (
                <SelectFilter
                  selected={paymentModeVal}
                  onChange={paymentModeChange}
                  options={paymentModeOptions}
                  allValue={paymentModeDefLabel}
                  shortLabel="Payment Mode"
                  id="payment-mode-filter"
                />
              )}
              {accountTypeChange && (
                <SelectFilter
                  selected={accountTypeVal}
                  onChange={accountTypeChange}
                  options={accountTypeOptions}
                  allValue={accountTypeDefLabel}
                  shortLabel="Account Type"
                  id="account-type-filter"
                />
              )}
              {typeChange && (
                <SelectFilter
                  selected={typeVal}
                  onChange={typeChange}
                  options={typeOptions}
                  allValue={typeDefLabel}
                  shortLabel={typePlaceholder}
                  id="dispute-type-filter"
                />
              )}
              {statusChange && (
                <StatusFilter
                  selectedStatus={statusVal}
                  onStatusChange={statusChange}
                  statusesList={statusOptions}
                />
              )}
              {props.onExport && (
                <button
                  onClick={props.onExport}
                  className="flex items-center gap-2 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer"
                  title="Export CSV"
                  id="export-button"
                >
                  <Download className="w-4 h-4 text-[#475467]" />
                  <span>Export</span>
                </button>
              )}
            </div>
          ) : null}
        </div>

        {props.singleRow ? null : (
          <div
            className="flex flex-wrap items-center gap-2"
            id="filter-dropdowns-group"
          >
            {/* Custom Date Range Picker Dropdown (Independent component) */}
            {dateChange && (
              <DateRangeFilter
                startDate={dateStart}
                endDate={dateEnd}
                onDateChange={dateChange}
                isDateRangeSelected={props.dateRange?.isDateRangeSelected}
                onDateRangeSelectedChange={
                  props.dateRange?.onDateRangeSelectedChange
                }
              />
            )}

            {/* Gateways Filter Dropdown (Independent component) */}
            {gatewayChange && (
              <GatewayFilter
                selectedGateway={gatewayVal}
                onGatewayChange={gatewayChange}
                gatewaysList={gatewayOptions}
                allValue={gatewayDefLabel}
                placeholder={gatewayPlaceholder}
              />
            )}

            {/* Institute Filter Dropdown */}
            {instituteChange && (
              <InstituteFilterGraphql
                selectedInstitute={instituteVal}
                onInstituteChange={instituteChange}
                setSchoolId={props.institute?.setSchoolId}
              />
            )}

            {/* Accounts Filter Dropdown (Independent component) */}
            {accountChange && (
              <AccountFilter
                selectedAccount={accountVal}
                onAccountChange={accountChange}
                accountsList={accountOptions}
              />
            )}

            {/* Status Filter Dropdown (Independent component) */}
            {paymentChannelChange && (
              <SelectFilter
                selected={paymentChannelVal}
                onChange={paymentChannelChange}
                options={paymentChannelOptions}
                allValue={paymentChannelDefLabel}
                shortLabel="Payment Channel"
                id="payment-channel-filter"
              />
            )}

            {paymentModeChange && (
              <SelectFilter
                selected={paymentModeVal}
                onChange={paymentModeChange}
                options={paymentModeOptions}
                allValue={paymentModeDefLabel}
                shortLabel="Payment Mode"
                id="payment-mode-filter"
              />
            )}

            {accountTypeChange && (
              <SelectFilter
                selected={accountTypeVal}
                onChange={accountTypeChange}
                options={accountTypeOptions}
                allValue={accountTypeDefLabel}
                shortLabel="Account Type"
                id="account-type-filter"
              />
            )}

            {typeChange && (
              <SelectFilter
                selected={typeVal}
                onChange={typeChange}
                options={typeOptions}
                allValue={typeDefLabel}
                shortLabel={typePlaceholder}
                id="dispute-type-filter"
              />
            )}

            {statusChange && (
              <StatusFilter
                selectedStatus={statusVal}
                onStatusChange={statusChange}
                statusesList={statusOptions}
              />
            )}

            {/* Export Button */}
            {props.onExport && (
              <button
                onClick={props.onExport}
                className="flex items-center gap-2 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer"
                title="Export CSV"
                id="export-button"
              >
                <Download className="w-4 h-4 text-[#475467]" />
                <span>Export</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div
          className="flex flex-wrap items-center gap-2"
          id="active-filters-row"
        >
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider mr-1">
            Active filters:
          </span>

          {searchChange && searchVal && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Search: "{searchVal}"
              <button
                onClick={() => searchChange("")}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {dateChange && props.dateRange?.isDateRangeSelected && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Date: {formatDateDisplay(dateStart)} -{" "}
              {formatDateDisplay(dateEnd)}
              <button
                onClick={() => {
                  dateChange(defStart, defEnd);
                  if (props.dateRange?.onDateRangeSelectedChange) {
                    props.dateRange.onDateRangeSelectedChange(false);
                  }
                }}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {gatewayChange && gatewayVal !== gatewayDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              {gatewayChipLabel}: {gatewayVal}
              <button
                onClick={() => gatewayChange(gatewayDefLabel)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountChange && accountVal !== accountDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Account: {accountVal}
              <button
                onClick={() => accountChange(accountDefLabel)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {statusChange && statusVal !== statusDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Status: {statusVal}
              <button
                onClick={() => statusChange(statusDefLabel)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {instituteChange && instituteVal !== instituteDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Institute: {instituteVal}
              <button
                onClick={() => {
                  instituteChange(instituteDefLabel);
                  props.institute?.setSchoolId &&
                    props.institute.setSchoolId(null);
                }}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {multiInstituteChange && multiInstituteIds.length > 0 && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Institutes: {multiInstituteIds.length} selected
              <button
                onClick={() => multiInstituteChange([])}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {paymentChannelChange &&
            paymentChannelVal !== paymentChannelDefLabel && (
              <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
                Payment Channel: {paymentChannelVal}
                <button
                  onClick={() => paymentChannelChange(paymentChannelDefLabel)}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

          {paymentModeChange && paymentModeVal !== paymentModeDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Payment Mode: {paymentModeVal}
              <button
                onClick={() => paymentModeChange(paymentModeDefLabel)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {accountTypeChange && accountTypeVal !== accountTypeDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              Account Type: {accountTypeVal}
              <button
                onClick={() => accountTypeChange(accountTypeDefLabel)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {typeChange && typeVal !== typeDefLabel && (
            <span className="inline-flex items-center gap-1 bg-[#F2F4F7] border border-[#E4E7EC] text-xs font-medium text-[#344054] px-2.5 py-1 rounded-full">
              {typeChipLabel}: {typeVal}
              <button
                onClick={() => typeChange(typeDefLabel)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors ml-1 underline cursor-pointer"
            id="clear-all-filters-btn"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
