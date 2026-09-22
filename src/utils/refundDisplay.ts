import {
  EMPTY_GATEWAY_FILTERS,
  gatewayName,
} from "./transactions/transactionMaps";

const GATEWAY_CODE_ALIASES: Record<string, keyof typeof gatewayName> = {
  CASHFREE: "EDVIRON_PG",
  EDVIRON_CASHFREE: "EDVIRON_PG",
  EASEBUZZ: "EDVIRON_EASEBUZZ",
  RAZORPAY: "EDVIRON_RAZORPAY",
  PAY_U: "EDVIRON_PAY_U",
  PAYU: "EDVIRON_PAY_U",
  CCAVENUE: "EDVIRON_CCAVENUE",
  SMARTGATEWAY: "EDVIRON_SMARTGATEWAY",
  NTTDATA: "EDVIRON_NTTDATA",
  WORLDLINE: "EDVIRON_WORLDLINE",
  GATEPAY: "EDVIRON_GATEPAY",
  HDFC_RAZORPAY: "EDVIRON_HDFC_RAZORPAY",
  RAZORPAY_SEAMLESS: "EDVIRON_RAZORPAY_SEAMLESS",
};

export function formatRefundGateway(value?: string | null): string {
  if (value == null || String(value).trim() === "") return "-";
  const key = String(value).trim().toUpperCase();
  const mappedKey = (GATEWAY_CODE_ALIASES[key] ||
    key) as keyof typeof gatewayName;
  const name = gatewayName[mappedKey];
  if (!name || name === "Pending") return "-";
  return name;
}

export function getRefundVendorId(
  refund?: {
    vendor_id?: string | null;
    split_refund_details?: Array<{ vendor_id?: string | null }> | null;
  } | null,
): string | null {
  const splitId = refund?.split_refund_details?.find(
    (line) => line?.vendor_id,
  )?.vendor_id;
  const value = String(refund?.vendor_id || splitId || "").trim();
  return value || null;
}

export function findTransactionVendor(
  vendors?: Array<{
    vendor_id?: string | null;
    edv_vendor_id?: string | null;
    name?: string | null;
  }> | null,
  vendorId?: string | null,
) {
  if (!vendorId || !vendors?.length) return null;
  return (
    vendors.find(
      (vendor) =>
        vendor.vendor_id === vendorId || vendor.edv_vendor_id === vendorId,
    ) || null
  );
}

export function formatReceiptAmount(value?: number | null): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

export function toGatewayQueryValue(
  label?: string | null,
): string[] | undefined {
  if (!label || /^all (gateways|aggregators)$/i.test(label.trim())) {
    return undefined;
  }
  const needle = String(label).trim().toLowerCase();
  const keys = (Object.entries(gatewayName) as [string, string][])
    .filter(([, display]) => display.toLowerCase() === needle)
    .map(([code]) => code);
  if (keys.length) {
    const extras = (Object.entries(GATEWAY_CODE_ALIASES) as [string, string][])
      .filter(([, mapped]) => keys.includes(mapped))
      .map(([alias]) => alias);
    return Array.from(new Set([...keys, ...extras]));
  }
  const key = String(label).trim().toUpperCase();
  const aliased = GATEWAY_CODE_ALIASES[key] || key;
  if (gatewayName[aliased as keyof typeof gatewayName]) {
    return Array.from(new Set([aliased, key]));
  }
  return [key];
}

export const GATEWAY_FILTER_ALL = "All Aggregators";

export const GATEWAY_FILTER_OPTIONS = [
  GATEWAY_FILTER_ALL,
  ...Array.from(
    new Set(
      Object.keys(EMPTY_GATEWAY_FILTERS)
        .map((code) => formatRefundGateway(code))
        .filter((name) => name && name !== "-"),
    ),
  ),
];

export function normalizeAggregatorFilter(value?: string | null): string {
  if (!value || /^all (gateways|aggregators)$/i.test(value.trim())) {
    return GATEWAY_FILTER_ALL;
  }
  const mapped = formatRefundGateway(value);
  return mapped === "-" ? value : mapped;
}

export function formatPaymentChannel(value?: string | null): string {
  if (!value) return "-";
  if (value === "Normal_Payment") return "Online";
  return value.replace(/_/g, " ");
}

const PAYMENT_MODE_DISPLAY: Record<string, string> = {
  cardless_emi: "Cardless EMI",
  cash: "Cash",
  cc: "Credit Card",
  cheque: "Cheque",
  credit_card: "Credit Card",
  creditcard: "Credit Card",
  credit_card_emi: "Credit Card EMI",
  dc: "Debit Card",
  debit_card: "Debit Card",
  debitcard: "Debit Card",
  debit_card_emi: "Debit Card EMI",
  demand_draft: "Demand Draft",
  dqr: "DQR",
  emi: "EMI",
  nb: "Net Banking",
  net_banking: "Net Banking",
  netbanking: "Net Banking",
  pay_later: "Pay Later",
  paylater: "Pay Later",
  pos_credit_card: "POS Credit Card",
  pos_debit_card: "POS Debit Card",
  pos_qr: "POS QR",
  prepaid_card: "Prepaid Card",
  qr: "QR",
  upi: "UPI",
  upi_credit_card: "Credit Card on UPI",
  upi_credit_line: "Credit Line on UPI",
  upi_ppi: "UPI PPI",
  upicc: "UPI Credit Card",
  upippi: "UPI PPI",
  vba: "VBA",
  wallet: "Wallet",
};

export function formatPaymentMode(value?: string | null): string {
  if (!value) return "-";
  const raw = String(value).trim();
  if (!raw) return "-";
  const key = raw.toLowerCase().replace(/[\s-]+/g, "_");
  if (PAYMENT_MODE_DISPLAY[key]) return PAYMENT_MODE_DISPLAY[key];
  if (PAYMENT_MODE_DISPLAY[raw]) return PAYMENT_MODE_DISPLAY[raw];
  return raw.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasDisplayValue(value?: string | null): boolean {
  return Boolean(value && String(value).trim());
}

export function getPaymentChannelDisplay(
  channel?: string | null,
  mode?: string | null,
) {
  const hasChannel = hasDisplayValue(channel);
  const hasMode = hasDisplayValue(mode);
  if (!hasChannel && !hasMode) {
    return { singleDash: true, channel: "-", mode: "" };
  }
  return {
    singleDash: false,
    channel: hasChannel ? formatPaymentChannel(channel) : "-",
    mode: hasMode ? formatPaymentMode(mode) : "-",
  };
}

export const formatPaymentSource = formatPaymentChannel;

export function formatRefundStatusLabel(status?: string | null): string {
  const raw = String(status || "").trim();
  if (!raw) return "-";
  if (raw.toLowerCase() === "pending") return "Processing";
  return raw;
}

export function formatTimelineEventLabel(event?: string | null): string {
  const raw = String(event || "").trim();
  if (!raw) return "-";
  if (raw === "Gateway Processing" || raw === "Gateway/Bank Processing") {
    return "Gateway/Bank Processing";
  }
  return raw;
}

function isPendingTimelineStatus(status?: string | null): boolean {
  return (
    String(status || "")
      .trim()
      .toLowerCase() === "pending"
  );
}

function isBankProcessingEvent(event?: string | null): boolean {
  return (
    String(event || "")
      .trim()
      .toLowerCase() === "bank processing"
  );
}

export function getVisibleRefundTimeline<
  T extends { event?: string | null; status?: string | null },
>(timeline?: T[] | null, refundStatus?: string | null): T[] {
  const events = Array.isArray(timeline)
    ? timeline.filter((item) => !isBankProcessingEvent(item?.event))
    : [];
  const visible = isDeletedRefundStatus(refundStatus)
    ? (() => {
        const pendingIndex = events.findIndex((item) =>
          isPendingTimelineStatus(item?.status),
        );
        return pendingIndex === -1 ? events : events.slice(0, pendingIndex);
      })()
    : events;

  return visible.map((item) => ({
    ...item,
    event: formatTimelineEventLabel(item?.event),
  }));
}

export function getRefundStage(
  timeline?: Array<{ event?: string | null; status?: string | null }> | null,
  refundStatus?: string | null,
): string {
  if (isDeletedRefundStatus(refundStatus)) return "Refund Deleted";
  const events = getVisibleRefundTimeline(timeline, refundStatus);
  if (!events.length) return "-";
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const status = String(events[i]?.status || "")
      .trim()
      .toLowerCase();
    if (status && status !== "pending") {
      return formatTimelineEventLabel(events[i]?.event);
    }
  }
  return "-";
}

const DEFAULT_REFUND_STATUS_BADGE =
  "bg-[#D4E9E2] text-[#009966] border border-[#ABEFC6]";

const REFUND_STATUS_BADGE_CLASSES: Record<string, string> = {
  processed: "bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]",
  "processed/approved": "bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]",
  approved: "bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]",
  failed: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  "deleted by user": "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  deleted: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  pending: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  initiated: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  processing: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  scheduled: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  executing: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  auto_refund_initiated: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  rejected: "bg-[#F2F4F7] text-[#344054] border border-[#EAECF0]",
  expired: "bg-[#F2F4F7] text-[#344054] border border-[#EAECF0]",
};

export function getRefundStatusBadgeClass(status?: string | null): string {
  const key = String(status || "")
    .trim()
    .toLowerCase();
  return REFUND_STATUS_BADGE_CLASSES[key] || DEFAULT_REFUND_STATUS_BADGE;
}

export function isDeletedRefundStatus(status?: string | null): boolean {
  const key = String(status || "")
    .trim()
    .toLowerCase();
  return key === "deleted by user" || key === "deleted";
}

export function formatRefundInitiationType(item?: {
  isAutoRedund?: boolean | null;
  batch_number?: string | null;
}): string {
  if (item?.isAutoRedund) return "Auto";
  if (item?.batch_number) return `Batch(${item.batch_number})`;
  return "Single";
}

export function formatRefundSpeed(value?: string | null): string {
  if (!value) return "-";
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "INSTANT") return "Instant";
  if (normalized === "STANDARD") return "Standard";
  return value;
}

export function formatAccountType(value?: string | null): string {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function displayOrDash(value?: string | null): string {
  const formatted = value == null ? "" : String(value).trim();
  return formatted || "-";
}

export function formatReceiptDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getRefundCompletedAt(
  timeline?: Array<{
    event?: string | null;
    triggered_at?: string | Date | null;
  }> | null,
): string | Date | null {
  if (!Array.isArray(timeline)) return null;
  const completed = timeline.find(
    (item) =>
      String(item?.event || "")
        .trim()
        .toLowerCase() === "refund completed",
  );
  return completed?.triggered_at || null;
}

export function formatPaymentDetailLabel(key?: string | null): string {
  if (!key) return "-";
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatRefundOrigin(value?: string | null): string {
  if (!value) return "-";
  const normalized = String(value).trim().toLowerCase().replace(/_/g, " ");
  if (normalized.includes("partner")) return "Partner Dashboard";
  if (normalized.includes("merchant")) return "Merchant Dashboard";
  if (normalized.includes("api") || normalized.includes("edviron")) {
    return "Edviron API";
  }
  return value;
}

export const REFUND_COLUMN_TOOLTIPS: Record<string, string> = {
  school_name: "Name of the institute associated with this refund.",
  _id: "Unique ID generated for this refund request.",
  custom_id: "Order ID associated with the original payment.",
  order_id: "Internal Edviron/ClearN order reference linked to the payment.",
  refund_arn:
    "Acquirer Reference Number used to trace card refunds through the banking/card network.",
  status: "Current processing status of the refund.",
  order_amount: "Total amount of the original order.",
  transaction_amount: "Amount successfully paid in the original transaction.",
  convenience_fee:
    "PG MDR plus ERP commission charged on the original payment.",
  refund_amount: "Amount requested to be returned to the payer.",
  createdAt: "Date and time the refund request was created.",
  refund_stage: "Current stage of the refund processing lifecycle.",
  age: "Time passed since the refund request was initiated.",
  batch_number:
    "How the refund was initiated: Auto, a bulk Batch, or a Single request.",
  refund_origin: "Source from which the refund amount is funded or adjusted.",
  account_type:
    "Type of account associated with the transaction, such as Merchant or Vendor.",
  refund_speed: "Processing speed of the refund, such as Instant or Standard.",
  reason: "Reason provided for initiating the refund.",
  gateway:
    "Payment aggregator or gateway responsible for processing the transaction or refund.",
  payment_channel:
    "Channel through which the original payment was collected, such as Payment Form, Online, Offline, or AutoDebit.",
  payment_mode:
    "Payment rail used for the original transaction, such as UPI, Card, Net Banking, or Wallet.",
};

export const REFUND_SEARCH_FILTER_BY = {
  searchFilterBy: [
    { label: "Refund ID", value: "refund_id" },
    { label: "Edviron Order ID", value: "order_id" },
    { label: "Order ID", value: "custom_id" },
  ],
};

export function formatConvenienceFee(
  transactionAmount?: number | null,
  orderAmount?: number | null,
): string {
  if (transactionAmount == null || orderAmount == null) return "-";
  const fee = Number(transactionAmount) - Number(orderAmount);
  if (!Number.isFinite(fee)) return "-";
  return `₹${fee.toLocaleString("en-IN")}`;
}

export const PAYMENT_CHANNEL_FILTER_ALL = "All Payment Channels";
export const PAYMENT_CHANNEL_FILTER_OPTIONS = [
  PAYMENT_CHANNEL_FILTER_ALL,
  "Payment Form",
  "AutoDebit Payment",
  "Online",
  "Offline",
  "Fee Financing",
];

const PAYMENT_CHANNEL_VALUES: Record<string, string> = {
  "Payment Form": "Payment_Form",
  "AutoDebit Payment": "AutoDebit_Payment",
  Online: "Online",
  Offline: "Offline",
  "Fee Financing": "Fee_Financing",
};

export const PAYMENT_MODE_FILTER_ALL = "All Payment Modes";
export const PAYMENT_MODE_FILTER_OPTIONS = [
  PAYMENT_MODE_FILTER_ALL,
  "UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Wallet",
  "Pay Later",
  "Cardless EMI",
  "Credit Card EMI",
  "Debit Card EMI",
  "EMI",
  "QR",
  "DQR",
  "POS Credit Card",
  "POS Debit Card",
  "POS QR",
  "Prepaid Card",
  "Credit Card on UPI",
  "Credit Line on UPI",
  "UPI PPI",
  "UPI Credit Card",
  "VBA",
  "Demand Draft",
  "Cash",
  "Cheque",
];

const PAYMENT_MODE_VALUES: Record<string, string> = {
  UPI: "upi",
  "Credit Card": "credit_card",
  "Debit Card": "debit_card",
  "Net Banking": "net_banking",
  Wallet: "wallet",
  "Pay Later": "pay_later",
  "Cardless EMI": "cardless_emi",
  "Credit Card EMI": "credit_card_emi",
  "Debit Card EMI": "debit_card_emi",
  EMI: "emi",
  QR: "qr",
  DQR: "dqr",
  "POS Credit Card": "pos_credit_card",
  "POS Debit Card": "pos_debit_card",
  "POS QR": "pos_qr",
  "Prepaid Card": "prepaid_card",
  "Credit Card on UPI": "upi_credit_card",
  "Credit Line on UPI": "upi_credit_line",
  "UPI PPI": "upi_ppi",
  "UPI Credit Card": "upicc",
  VBA: "vba",
  "Demand Draft": "demand_draft",
  Cash: "cash",
  Cheque: "cheque",
};

export const ACCOUNT_TYPE_FILTER_ALL = "All Account Types";
export const ACCOUNT_TYPE_FILTER_OPTIONS = [
  ACCOUNT_TYPE_FILTER_ALL,
  "Merchant",
  "Vendor",
];

const ACCOUNT_TYPE_VALUES: Record<string, string> = {
  Merchant: "merchant",
  Vendor: "vendor",
};

function toSingleFilter(
  label: string,
  allValue: string,
  map: Record<string, string>,
): string | undefined {
  if (!label || label === allValue) return undefined;
  return map[label] || label;
}

export function toPaymentChannelFilter(label: string): string | undefined {
  return toSingleFilter(
    label,
    PAYMENT_CHANNEL_FILTER_ALL,
    PAYMENT_CHANNEL_VALUES,
  );
}

export function toPaymentModeFilter(label: string): string | undefined {
  return toSingleFilter(label, PAYMENT_MODE_FILTER_ALL, PAYMENT_MODE_VALUES);
}

export function toAccountTypeFilter(label: string): string | undefined {
  return toSingleFilter(label, ACCOUNT_TYPE_FILTER_ALL, ACCOUNT_TYPE_VALUES);
}

export function refundMetaQueryVariables(filters: {
  paymentChannel: string;
  paymentMode: string;
  accountType: string;
}) {
  const payment_channel = toPaymentChannelFilter(filters.paymentChannel);
  const payment_mode = toPaymentModeFilter(filters.paymentMode);
  const account_type = toAccountTypeFilter(filters.accountType);
  return {
    payment_channel: payment_channel ? [payment_channel] : undefined,
    payment_mode: payment_mode ? [payment_mode] : undefined,
    account_type: account_type ? [account_type] : undefined,
  };
}
