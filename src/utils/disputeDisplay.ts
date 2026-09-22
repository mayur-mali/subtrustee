import {
  GATEWAY_FILTER_ALL,
  GATEWAY_FILTER_OPTIONS,
  PAYMENT_CHANNEL_FILTER_ALL,
  PAYMENT_CHANNEL_FILTER_OPTIONS,
  PAYMENT_MODE_FILTER_ALL,
  PAYMENT_MODE_FILTER_OPTIONS,
  formatPaymentChannel,
  formatPaymentMode,
  formatRefundGateway,
  normalizeAggregatorFilter,
  toPaymentChannelFilter,
  toPaymentModeFilter,
} from "./refundDisplay";

export { formatRefundGateway as formatDisputeGateway };
export {
  GATEWAY_FILTER_ALL,
  GATEWAY_FILTER_OPTIONS,
  PAYMENT_CHANNEL_FILTER_ALL,
  PAYMENT_CHANNEL_FILTER_OPTIONS,
  PAYMENT_MODE_FILTER_ALL,
  PAYMENT_MODE_FILTER_OPTIONS,
  formatPaymentChannel,
  formatPaymentMode,
  normalizeAggregatorFilter,
};

export function disputeMetaQueryVariables(filters: {
  paymentChannel: string;
  paymentMode: string;
}) {
  const payment_channel = toPaymentChannelFilter(filters.paymentChannel);
  const payment_mode = toPaymentModeFilter(filters.paymentMode);
  return {
    payment_channel: payment_channel ? [payment_channel] : undefined,
    payment_mode: payment_mode ? [payment_mode] : undefined,
  };
}

export const DISPUTE_STATUS_FILTER_ALL = "All Statuses";

export const DISPUTE_STATUS_FILTER_OPTIONS = [
  DISPUTE_STATUS_FILTER_ALL,
  "Open",
  "Won",
  "Lost",
  "Under Review",
  "Accepted",
];

export const DISPUTE_TYPE_FILTER_ALL = "All Types";

export const DISPUTE_TYPE_FILTER_OPTIONS = [
  DISPUTE_TYPE_FILTER_ALL,
  "Dispute",
  "Chargeback",
  "Pre-Arbitration",
  "Arbitration",
];

export const DISPUTE_SEARCH_FILTER_BY = {
  searchFilterBy: [
    { label: "By Order ID", value: "custom_id" },
    { label: "By Edviron Order ID", value: "order_id" },
    { label: "By Dispute ID", value: "dispute_id" },
  ],
};

const DEFAULT_DISPUTE_STATUS_BADGE =
  "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]";

export function formatDisputeAmount(value?: number | null): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDisputeMetricAmount(value?: number | null): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  if (amount >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(1)} Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)} L`;
  }
  return formatDisputeAmount(amount);
}

export function formatDisputeDate(value?: string | Date | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDisputeType(
  type?: string | null,
  status?: string | null,
): string {
  return resolveDisputeLabels(status, type).type;
}

export function formatDisputeStatus(
  status?: string | null,
  type?: string | null,
): string {
  return resolveDisputeLabels(status, type).status;
}

type DisputeKind =
  | "Dispute"
  | "Chargeback"
  | "Pre-Arbitration"
  | "Arbitration"
  | "-";

type DisputeStatusLabel =
  | "Open"
  | "Won"
  | "Lost"
  | "Under Review"
  | "Accepted"
  | "-";

const DISPUTE_ENUM_MAP: Record<
  string,
  { type: DisputeKind; status: DisputeStatusLabel }
> = {
  DISPUTE_MERCHANT_LOST: { type: "Dispute", status: "Lost" },
  PRE_ARBITRATION_MERCHANT_ACCEPTED: {
    type: "Pre-Arbitration",
    status: "Accepted",
  },
  OPEN: { type: "Dispute", status: "Open" },
  CHARGEBACK_CREATED: { type: "Chargeback", status: "Open" },
  DISPUTE_CREATED: { type: "Dispute", status: "Open" },
  PRE_ARBITRATION_MERCHANT_LOST: { type: "Pre-Arbitration", status: "Lost" },
  DISPUTE_OPEN: { type: "Dispute", status: "Open" },
  CHARGEBACK_DOCS_RECEIVED: { type: "Chargeback", status: "Under Review" },
  DISPUTE_DOCS_RECEIVED: { type: "Dispute", status: "Under Review" },
  PRE_ARBITRATION_CREATED: { type: "Pre-Arbitration", status: "Open" },
  ARBITRATION_MERCHANT_WON: { type: "Arbitration", status: "Won" },
  DISPUTE_MERCHANT_WON: { type: "Dispute", status: "Won" },
  PRE_ARBITRATION_MERCHANT_WON: { type: "Pre-Arbitration", status: "Won" },
  LOST: { type: "Dispute", status: "Lost" },
  CHARGEBACK_MERCHANT_LOST: { type: "Chargeback", status: "Lost" },
  REQUEST_INITIATED: { type: "Dispute", status: "Open" },
  CHARGEBACK_WON: { type: "Chargeback", status: "Won" },
  CHARGEBACK_MERCHANT_WON: { type: "Chargeback", status: "Won" },
};

function normalizeDisputeEnum(value?: string | null): string {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

export function resolveDisputeLabels(
  status?: string | null,
  type?: string | null,
): { type: DisputeKind; status: DisputeStatusLabel } {
  const statusKey = normalizeDisputeEnum(status);
  const mapped = DISPUTE_ENUM_MAP[statusKey];
  if (mapped) return mapped;

  const typeKey = normalizeDisputeEnum(type);
  const source = `${typeKey}_${statusKey}`;

  let kind: DisputeKind = "-";
  if (source.includes("PRE_ARBITRATION") || source.includes("PREARBITRATION")) {
    kind = "Pre-Arbitration";
  } else if (source.includes("ARBITRATION")) {
    kind = "Arbitration";
  } else if (source.includes("CHARGEBACK")) {
    kind = "Chargeback";
  } else if (
    source.includes("DISPUTE") ||
    statusKey === "OPEN" ||
    statusKey === "LOST"
  ) {
    kind = "Dispute";
  } else if (typeKey) {
    kind = String(type)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) as DisputeKind;
  }

  let statusLabel: DisputeStatusLabel = "-";
  if (!statusKey) statusLabel = "-";
  else if (statusKey.includes("ACCEPT")) statusLabel = "Accepted";
  else if (statusKey.includes("WON")) statusLabel = "Won";
  else if (statusKey.includes("LOST") || statusKey.includes("LOSS")) {
    statusLabel = "Lost";
  } else if (
    statusKey.includes("DOCS") ||
    statusKey.includes("REVIEW") ||
    statusKey.includes("EVIDENCE")
  ) {
    statusLabel = "Under Review";
  } else if (
    statusKey.includes("OPEN") ||
    statusKey.includes("CREATED") ||
    statusKey.includes("INITIATED")
  ) {
    statusLabel = "Open";
  } else {
    statusLabel = String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) as DisputeStatusLabel;
  }

  return { type: kind || "-", status: statusLabel };
}

export function getDisputeStatusBadgeClass(status?: string | null): string {
  const label = formatDisputeStatus(status).toLowerCase();
  if (!label || label === "-") return DEFAULT_DISPUTE_STATUS_BADGE;
  if (label === "won" || label === "accepted") {
    return "bg-[#E6F7F0] text-[#009966] border border-[#A3E6CD]";
  }
  if (label === "lost") {
    return "bg-[#FEE2E2] text-[#FB5243] border border-[#FECACA]";
  }
  if (label === "under review") {
    return "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]";
  }
  if (label === "open") {
    return "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]";
  }
  return DEFAULT_DISPUTE_STATUS_BADGE;
}

export function toDisputeStatusQueryValue(
  _label?: string | null,
): string | undefined {
  return undefined;
}

export function matchesDisputeTypeFilter(
  type?: string | null,
  selectedType?: string | null,
  status?: string | null,
): boolean {
  if (!selectedType || selectedType === DISPUTE_TYPE_FILTER_ALL) return true;
  return (
    formatDisputeType(type, status).toLowerCase() === selectedType.toLowerCase()
  );
}

export function matchesDisputeStatusFilter(
  status?: string | null,
  selectedStatus?: string | null,
  type?: string | null,
): boolean {
  if (!selectedStatus || selectedStatus === DISPUTE_STATUS_FILTER_ALL) {
    return true;
  }
  return (
    formatDisputeStatus(status, type).toLowerCase() ===
    selectedStatus.toLowerCase()
  );
}

export function matchesDisputeGatewayFilter(
  gateway?: string | null,
  selectedGateway?: string | null,
): boolean {
  if (!selectedGateway || selectedGateway === GATEWAY_FILTER_ALL) return true;
  return (
    formatRefundGateway(gateway).toLowerCase() ===
    normalizeAggregatorFilter(selectedGateway).toLowerCase()
  );
}

export type DisputeSlaMeta = {
  title: string;
  subtitle: string;
  tone: "closed" | "ok" | "risk" | "high" | "overdue" | "empty";
  dotClass: string;
  titleClass: string;
};

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function calendarDaysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfLocalDay(to).getTime() - startOfLocalDay(from).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function formatRelativeRespondDate(respondBy: Date): string {
  const days = calendarDaysBetween(new Date(), respondBy);
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  if (days > 1) return `${days} days left`;
  if (days === -1) return "1 day ago";
  return `${Math.abs(days)} days ago`;
}

export function isDisputeWonOrLost(status?: string | null): boolean {
  const label = formatDisputeStatus(status).toLowerCase();
  return label === "won" || label === "lost" || label === "accepted";
}

export function isDisputeDocsReceived(status?: string | null): boolean {
  const statusKey = normalizeDisputeEnum(status);
  return (
    statusKey.includes("DOCS_RECEIVED") ||
    statusKey.includes("DOCS_RECEIVE") ||
    formatDisputeStatus(status).toLowerCase() === "under review"
  );
}

export function getDisputeSlaMeta(
  respondBy?: string | Date | null,
  status?: string | null,
): DisputeSlaMeta {
  if (isDisputeWonOrLost(status)) {
    return {
      title: "Closed",
      subtitle: "",
      tone: "closed",
      dotClass: "bg-[#94A3B8]",
      titleClass: "text-[#64748B]",
    };
  }

  if (isDisputeDocsReceived(status)) {
    return {
      title: "On Track",
      subtitle: "",
      tone: "ok",
      dotClass: "bg-[#12B76A]",
      titleClass: "text-[#027A48]",
    };
  }

  if (!respondBy) {
    return {
      title: "-",
      subtitle: "",
      tone: "empty",
      dotClass: "bg-[#CBD5E1]",
      titleClass: "text-[#667085]",
    };
  }

  const due = new Date(respondBy);
  if (Number.isNaN(due.getTime())) {
    return {
      title: "-",
      subtitle: "",
      tone: "empty",
      dotClass: "bg-[#CBD5E1]",
      titleClass: "text-[#667085]",
    };
  }

  const daysRemaining = calendarDaysBetween(new Date(), due);
  const subtitle = formatRelativeRespondDate(due);

  if (daysRemaining < 0) {
    return {
      title: "Overdue",
      subtitle,
      tone: "overdue",
      dotClass: "bg-[#FB5243]",
      titleClass: "text-[#FB5243]",
    };
  }

  if (daysRemaining > 3) {
    return {
      title: "On Track",
      subtitle,
      tone: "ok",
      dotClass: "bg-[#FDB022]",
      titleClass: "text-[#D97706]",
    };
  }

  if (daysRemaining > 1) {
    return {
      title: "At Risk",
      subtitle,
      tone: "risk",
      dotClass: "bg-[#FDB022]",
      titleClass: "text-[#D97706]",
    };
  }

  return {
    title: "At High Risk",
    subtitle,
    tone: "high",
    dotClass: "bg-[#FB5243]",
    titleClass: "text-[#FB5243]",
  };
}

export function formatDisputeSla(
  respondBy?: string | Date | null,
  status?: string | null,
): string {
  const sla = getDisputeSlaMeta(respondBy, status);
  if (sla.tone === "empty") return "-";
  return sla.subtitle ? `${sla.title} · ${sla.subtitle}` : sla.title;
}

export const DISPUTE_COLUMN_TOOLTIPS: Record<string, string> = {
  school_name: "Name of the institute associated with this dispute.",
  dispute_created_date: "Date the dispute or chargeback was created.",
  dispute_amount: "Amount disputed or claimed as a chargeback.",
  bank_reference: "Bank reference number for the original transaction.",
  dispute_type: "Type of dispute raised against the transaction.",
  dispute_id: "Unique chargeback or dispute ID from the aggregator.",
  dispute_status: "Current status of the dispute.",
  dispute_respond_by_date:
    "Deadline to respond before the dispute is auto-decided.",
  respond_by: "Date by which a response must be submitted.",
  custom_order_id: "Order ID associated with the original payment.",
  collect_id: "Internal Edviron order reference linked to the payment.",
  order_amount: "Total amount of the original order.",
  payment_amount: "Amount actually paid in the original transaction.",
  student_name: "Student name linked to the original payment.",
  student_id: "Student ID linked to the original payment.",
  student_phone: "Student or payer phone number.",
  payment_channel: "Channel used to collect the original payment.",
  gateway: "Payment aggregator that processed the original transaction.",
  payment_mode: "Mode used to collect the original payment.",
  remarks: "Latest remark from the bank or payment gateway.",
  settlement_id: "Settlement that originally paid out this transaction.",
  dispute_deduction_settlement_utr:
    "Settlement used to adjust the disputed amount.",
};
