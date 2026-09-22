import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  displayOrDash,
  findTransactionVendor,
  formatRefundGateway,
  formatPaymentChannel,
  formatPaymentDetailLabel,
  formatPaymentMode,
  formatRefundStatusLabel,
  formatTimelineEventLabel,
  getRefundCompletedAt,
  getRefundVendorId,
  getVisibleRefundTimeline,
  isDeletedRefundStatus,
} from "../../../utils/refundDisplay";

// Helper formatting functions
export const formatCurrency = (amount?: number | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return "Rs. 0";
  return `Rs. ${amount.toLocaleString("en-IN")}`;
};

export const formatDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  } catch {
    return "-";
  }
};

export const formatMinutesToHours = (minutes?: number): string => {
  if (!minutes && minutes !== 0) return "0 hrs";
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
};

// Styles for React PDF Document
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
    lineHeight: 1.35,
  },
  // Top Header Banner
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 8.5,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#009966",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeDeleted: {
    backgroundColor: "#B42318",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  // 2-Column Grid Layout
  mainGrid: {
    flexDirection: "row",
    gap: 12,
  },
  leftCol: {
    width: "60%",
  },
  rightCol: {
    width: "40%",
  },
  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    marginBottom: 10,
  },
  cardHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  // Rows
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginVertical: 6,
  },
  dividerStrong: {
    borderTopWidth: 1,
    borderTopColor: "#94A3B8",
    marginVertical: 6,
  },
  label: {
    fontSize: 8,
    color: "#64748B",
  },
  value: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1E293B",
  },
  valueBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  valueGreen: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#009966",
  },
  valueRed: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#FB5243",
  },
  valueBlue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
  },
  // Sub Block / Inset Box
  insetBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  // Metrics Grid
  metricsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricLabel: {
    fontSize: 7,
    color: "#64748B",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  // Progress Bar
  progressContainer: {
    marginVertical: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#64748B",
    marginBottom: 3,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  // Table
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  th: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  td: {
    fontSize: 7.5,
    color: "#1E293B",
  },
  col1: { width: "12%" },
  col2: { width: "30%" },
  col3: { width: "22%" },
  col4: { width: "20%" },
  col5: { width: "16%" },
  // Timeline list
  timelineItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  timelineBullet: {
    width: 14,
    alignItems: "center",
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#009966",
    marginTop: 2,
  },
  bulletLine: {
    width: 1,
    backgroundColor: "#CBD5E1",
    flex: 1,
    marginVertical: 1,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 4,
  },
  timelineTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  timelineDate: {
    fontSize: 7,
    color: "#64748B",
  },
  timelineDesc: {
    fontSize: 7.5,
    color: "#475569",
    marginTop: 1,
  },
  // Flow pipeline
  flowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  flowStep: {
    flex: 1,
  },
  flowArrow: {
    fontSize: 10,
    color: "#94A3B8",
    paddingHorizontal: 4,
  },
  // Small badge
  tagBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  tagBadgeText: {
    color: "#1D4ED8",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  // Footer
  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#CBD5E1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7.5,
    color: "#94A3B8",
  },
});

export const RefundReceiptDocument: React.FC<any> = ({
  transactionDetails,
  previousRefundAmount = 0,
  chargesDetails,
  totalRefunded = 0,
  originalRefund,
  settlementDetails,
  adjustedSettlement,
  refundReceiptData,
  requestedBy,
  approvedBy,
  SCHOOL_DETAILS,
  merchantAccount,
  vendorAccount,
  isVendorRefundedFrom: isVendorRefundedFromProp,
  sourceAccountTitle,
  sourceNameLabel,
  sourceIdLabel,
  sourceName,
  sourceId,
  sourceBank,
  paymentInfo = [],
  refundTimeline = [],
  refundCompleteTimeline,
}) => {
  const orderAmount = transactionDetails?.order_amount || 0;
  const transactionAmount = transactionDetails?.transaction_amount || 0;
  const successfulRefundTotal = (
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.refundRequests || []
  )
    .filter((refund: any) => {
      const status = String(refund?.status || "")
        .trim()
        .toLowerCase();
      return (
        status === "approved" ||
        status === "processed" ||
        status === "processed/approved"
      );
    })
    .reduce(
      (sum: number, refund: any) => sum + (Number(refund.refund_amount) || 0),
      0,
    );
  const serviceCharge =
    orderAmount && transactionAmount ? orderAmount - transactionAmount : 0;
  const convenienceFeeAmount =
    (Number(transactionAmount) || 0) - (Number(orderAmount) || 0);
  const remainingAmountValue =
    (Number(orderAmount) || 0) - successfulRefundTotal;
  const retainedDeductions =
    (Number(transactionAmount) || 0) - successfulRefundTotal;

  const refundedPercentage =
    orderAmount > 0
      ? Math.min(100, Math.round((totalRefunded / orderAmount) * 100))
      : 0;
  const remainingRefundable = Math.max(0, orderAmount - totalRefunded);
  const remainingPercentage = Math.max(0, 100 - refundedPercentage);
  const refundVendorId = getRefundVendorId(originalRefund);
  const transactionVendor = findTransactionVendor(
    transactionDetails?.vendors_info,
    vendorAccount?.vendor_id || refundVendorId,
  );
  const isVendorRefundedFrom =
    isVendorRefundedFromProp ??
    Boolean(vendorAccount?.vendor_id || refundVendorId);
  const resolvedSourceTitle =
    sourceAccountTitle ||
    (isVendorRefundedFrom
      ? "Vendor Account (Refunded From)"
      : "Merchant Account (Refunded From)");
  const resolvedSourceNameLabel =
    sourceNameLabel || (isVendorRefundedFrom ? "Vendor Name" : "Merchant Name");
  const resolvedSourceIdLabel =
    sourceIdLabel || (isVendorRefundedFrom ? "Vendor ID" : "Merchant ID");
  const resolvedSourceName =
    sourceName ||
    (isVendorRefundedFrom
      ? displayOrDash(vendorAccount?.name || transactionVendor?.name)
      : displayOrDash(
          merchantAccount?.name ||
            SCHOOL_DETAILS?.school_name ||
            transactionDetails?.school_name,
        ));
  const resolvedSourceId =
    sourceId ||
    (isVendorRefundedFrom
      ? displayOrDash(vendorAccount?.vendor_id || refundVendorId)
      : displayOrDash(
          merchantAccount?.merchant_id ||
            SCHOOL_DETAILS?.merchantId ||
            transactionDetails?.school_id,
        ));
  const resolvedSourceBank =
    sourceBank ||
    (isVendorRefundedFrom
      ? vendorAccount?.bank_details
      : merchantAccount?.bank_details);
  const refundCompletedAt =
    refundCompleteTimeline?.triggered_at ||
    getRefundCompletedAt(refundTimeline);

  const refundRequests =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.refundRequests || [];

  return (
    <Document title={`Refund-Receipt-${originalRefund?._id || "Statement"}`}>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              Refund & Settlement Statement
            </Text>
            <Text style={styles.headerSubtitle}>
              Order Ref: {transactionDetails?.custom_order_id || "-"} | Refund
              ID: {originalRefund?._id || "-"}
            </Text>
          </View>
          <View
            style={
              isDeletedRefundStatus(originalRefund?.status)
                ? styles.statusBadgeDeleted
                : styles.statusBadge
            }
          >
            <Text style={styles.statusBadgeText}>
              {formatRefundStatusLabel(originalRefund?.status) === "-"
                ? "Completed"
                : formatRefundStatusLabel(originalRefund?.status)}
            </Text>
          </View>
        </View>

        {/* ================= 2-COLUMN MAIN CONTENT ================= */}
        <View style={styles.mainGrid}>
          {/* ================= LEFT COLUMN ================= */}
          <View style={styles.leftCol}>
            {/* PANEL 1: TRANSACTION BREAKUP */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Transaction Breakup</Text>

              {/* Original Payment */}
              <View style={{ marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 7.5,
                    color: "#475569",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  Original Payment
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Order Amount</Text>
                  <Text style={styles.value}>
                    {formatCurrency(transactionDetails?.order_amount)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Convenience Fee</Text>
                  <Text style={styles.valueRed}>
                    {serviceCharge !== 0
                      ? formatCurrency(serviceCharge)
                      : "Rs. 0"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Transaction Amount */}
              <View style={styles.rowBetween}>
                <Text style={styles.valueBold}>Transaction Amount</Text>
                <Text style={styles.valueBold}>
                  {formatCurrency(transactionDetails?.transaction_amount)}
                </Text>
              </View>

              {/* Refund Calculation Box */}
              <View style={styles.insetBox}>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontFamily: "Helvetica-Bold",
                    color: "#475569",
                    marginBottom: 4,
                  }}
                >
                  Refund Calculation
                </Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Order Amount</Text>
                  <Text style={styles.value}>
                    {formatCurrency(transactionDetails?.order_amount)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Previous Refunds</Text>
                  <Text style={styles.value}>
                    {formatCurrency(previousRefundAmount)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Amount Retained</Text>
                  <Text style={styles.valueRed}>
                    {formatCurrency(retainedDeductions)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Remaining Order Amount</Text>
                  <Text style={styles.value}>
                    {formatCurrency(remainingAmountValue)}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Convenience Fee</Text>
                  <Text style={styles.value}>
                    {formatCurrency(convenienceFeeAmount)}
                  </Text>
                </View>
                <View style={styles.dividerStrong} />
                <View style={styles.rowBetween}>
                  <Text style={styles.valueBold}>Refund to Customer</Text>
                  <Text style={styles.valueBold}>
                    {formatCurrency(totalRefunded)}
                  </Text>
                </View>
              </View>
            </View>

            {/* PANEL 2: ORDER & PAYMENT DETAILS */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Order & Payment Details</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.valueBold}>
                  {transactionDetails?.custom_order_id || "-"}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Edviron Order ID</Text>
                <Text style={styles.value}>
                  {transactionDetails?.collect_id || "-"}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Payment ID</Text>
                <Text style={styles.value}>
                  {transactionDetails?.payment_id || "-"}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>ARN Number</Text>
                <Text style={styles.valueGreen}>
                  {originalRefund?.refund_arn || "-"}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Payment Channel</Text>
                <Text style={styles.value}>
                  {formatPaymentChannel(
                    originalRefund?.payment_channel ||
                      transactionDetails?.payment_channel,
                  )}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Gateway / Mode</Text>
                <Text style={styles.value}>
                  {formatRefundGateway(transactionDetails?.gateway)} (
                  {formatPaymentMode(
                    originalRefund?.payment_mode ||
                      transactionDetails?.payment_method,
                  )}
                  )
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Fee Type</Text>
                <Text style={styles.value}>
                  {transactionDetails?.fee_type || "Tuition Fee"}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Refund Age / TAT</Text>
                <Text style={styles.value}>
                  {formatMinutesToHours(
                    originalRefund?.processingTimeInMinutes,
                  )}
                </Text>
              </View>
            </View>

            {/* PANEL 3: PARTIAL REFUND METRICS & TABLE */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Partial Refund Details</Text>

              {/* 4 Stat Boxes */}
              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Order Amount</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(orderAmount)}
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Total Refunded</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(totalRefunded)}
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Current Refund</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(originalRefund?.refund_amount)}
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Remaining</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(remainingRefundable)}
                  </Text>
                </View>
              </View>

              {/* Progress visual */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <Text>Refunded: {refundedPercentage}%</Text>
                  <Text>Remaining: {remainingPercentage}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${refundedPercentage}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Refund History Table */}
              <Text
                style={{
                  fontSize: 7.5,
                  fontFamily: "Helvetica-Bold",
                  color: "#334155",
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                Refund History (Same Order)
              </Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, styles.col1]}>Seq</Text>
                  <Text style={[styles.th, styles.col2]}>Refund ID</Text>
                  <Text style={[styles.th, styles.col3]}>Date</Text>
                  <Text style={[styles.th, styles.col4]}>Amount</Text>
                  <Text style={[styles.th, styles.col5]}>Status</Text>
                </View>
                {refundRequests.length > 0 ? (
                  refundRequests.map((refund: any, index: number) => (
                    <View
                      key={refund._id || index}
                      style={
                        index === refundRequests.length - 1
                          ? styles.tableRowLast
                          : styles.tableRow
                      }
                    >
                      <Text style={[styles.td, styles.col1]}>#{index + 1}</Text>
                      <Text
                        style={[styles.td, styles.col2, { color: "#009966" }]}
                      >
                        {refund._id}
                      </Text>
                      <Text style={[styles.td, styles.col3]}>
                        {formatDate(refund.createdAt)}
                      </Text>
                      <Text
                        style={[
                          styles.td,
                          styles.col4,
                          { color: "#2563EB", fontFamily: "Helvetica-Bold" },
                        ]}
                      >
                        {formatCurrency(refund.refund_amount)}
                      </Text>
                      <Text style={[styles.td, styles.col5]}>
                        {formatRefundStatusLabel(refund.status) === "-"
                          ? "Completed"
                          : formatRefundStatusLabel(refund.status)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRowLast}>
                    <Text style={[styles.td, { color: "#94A3B8" }]}>
                      No previous refunds recorded
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* PANEL 4: REFUND REASON & APPROVALS */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>
                Refund Reason & Authorization
              </Text>
              <Text style={{ fontSize: 8, color: "#334155", marginBottom: 6 }}>
                {originalRefund?.reason ||
                  "Standard verified administrative refund."}
              </Text>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Requested By</Text>
                  <Text style={styles.value}>
                    {requestedBy?.role || "Admin"} (
                    {requestedBy?.triggered_by || "-"})
                  </Text>
                </View>
                <View>
                  <Text style={styles.label}>Approved By</Text>
                  <Text style={styles.value}>
                    {approvedBy?.role || "Finance"} (
                    {approvedBy?.triggered_by || "-"})
                  </Text>
                </View>
              </View>
            </View>

            {/* PANEL 5: SETTLEMENT IMPACT */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Settlement Impact</Text>
              <View style={styles.flowContainer}>
                <View style={styles.flowStep}>
                  <Text style={styles.label}>Original Settlement</Text>
                  <Text style={styles.valueBold}>
                    {settlementDetails?.utrNumber || "-"}
                  </Text>
                  <Text style={styles.label}>
                    {formatDate(settlementDetails?.settlementDate)}
                  </Text>
                </View>
                <Text style={styles.flowArrow}>&gt;</Text>
                <View style={styles.flowStep}>
                  <Text style={styles.label}>Refund Initiated</Text>
                  <Text style={styles.valueRed}>
                    {formatCurrency(originalRefund?.refund_amount)}
                  </Text>
                  <Text style={styles.label}>{originalRefund?._id || "-"}</Text>
                </View>
                <Text style={styles.flowArrow}>&gt;</Text>
                <View style={styles.flowStep}>
                  <Text style={styles.label}>Adjusted In Settlement</Text>
                  <Text style={styles.valueBold}>
                    {adjustedSettlement?.utrNumber || "-"}
                  </Text>
                  <Text style={styles.label}>
                    {formatDate(adjustedSettlement?.settlementDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ================= RIGHT COLUMN ================= */}
          <View style={styles.rightCol}>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Institute Details</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Institute Name</Text>
                <Text style={styles.valueBold}>
                  {displayOrDash(
                    transactionDetails?.school_name ||
                      SCHOOL_DETAILS?.school_name,
                  )}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Email ID</Text>
                <Text style={styles.value}>
                  {displayOrDash(SCHOOL_DETAILS?.email)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Institute Code</Text>
                <Text style={styles.value}>
                  {displayOrDash(
                    transactionDetails?.school_id || SCHOOL_DETAILS?.school_id,
                  )}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Mobile Number</Text>
                <Text style={styles.value}>
                  {displayOrDash(SCHOOL_DETAILS?.phone_number)}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>{resolvedSourceTitle}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>{resolvedSourceNameLabel}</Text>
                <Text style={styles.value}>{resolvedSourceName}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>{resolvedSourceIdLabel}</Text>
                <Text style={styles.value}>{resolvedSourceId}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Account Holder</Text>
                <Text style={styles.value}>
                  {displayOrDash(resolvedSourceBank?.account_holder_name)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Bank</Text>
                <Text style={styles.value}>
                  {displayOrDash(
                    resolvedSourceBank?.beneficiary_bank_and_address,
                  )}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Account Number</Text>
                <Text style={styles.value}>
                  {displayOrDash(resolvedSourceBank?.account_number)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>IFSC Code</Text>
                <Text style={styles.value}>
                  {displayOrDash(resolvedSourceBank?.ifsc_code)}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>
                Refund Destination (Source Payment)
              </Text>
              <View style={styles.insetBox}>
                <Text
                  style={{ fontSize: 7, color: "#475569", textAlign: "center" }}
                >
                  Refund will be credited to the original payment source
                </Text>
              </View>
              <View style={{ marginTop: 4 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Payment Mode</Text>
                  <Text style={styles.value}>
                    {formatPaymentMode(
                      originalRefund?.payment_mode ||
                        transactionDetails?.payment_method,
                    )}
                  </Text>
                </View>
                {paymentInfo.map((info: any) => (
                  <View key={info.key} style={styles.rowBetween}>
                    <Text style={styles.label}>
                      {formatPaymentDetailLabel(info.key)}
                    </Text>
                    <Text style={styles.value}>
                      {displayOrDash(info.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>Student Details</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.valueBold}>
                  {displayOrDash(transactionDetails?.student_name)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Student ID</Text>
                <Text style={styles.value}>
                  {displayOrDash(transactionDetails?.student_id)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Class</Text>
                <Text style={styles.value}>
                  {displayOrDash(transactionDetails?.class_name)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                  {displayOrDash(transactionDetails?.student_email)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>
                  {displayOrDash(transactionDetails?.student_phone)}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>Refund Timeline</Text>
              {refundTimeline && refundTimeline.length > 0 ? (
                getVisibleRefundTimeline(
                  refundTimeline,
                  originalRefund?.status,
                ).map((item: any, idx: number, visible: any[]) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineBullet}>
                      <View style={styles.bulletDot} />
                      {idx < visible.length - 1 && (
                        <View style={styles.bulletLine} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>
                        {formatTimelineEventLabel(item.event || item.title)}
                      </Text>
                      <Text style={styles.timelineDate}>
                        {item.date || item.status}
                      </Text>
                      {item.description && (
                        <Text style={styles.timelineDesc}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.label}>No timeline events recorded</Text>
              )}
              {isDeletedRefundStatus(originalRefund?.status) && (
                <Text
                  style={{
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: "#FEF3F2",
                    color: "#F04438",
                    textAlign: "center",
                    fontSize: 8,
                  }}
                >
                  Refund request is deleted by user
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>Important Dates</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Refund Initiated</Text>
                <Text style={styles.value}>
                  {formatDate(originalRefund?.createdAt)}
                </Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Refund Completed</Text>
                <Text style={styles.value}>
                  {formatDate(refundCompletedAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= FOOTER ================= */}
        <View style={styles.footer}>
          <Text>
            Generated automatically by School ERP Payment Gateway Module
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default RefundReceiptDocument;
