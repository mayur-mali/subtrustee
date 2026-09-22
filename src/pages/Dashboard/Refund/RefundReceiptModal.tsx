import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BaseModal from "../../../components/NewFilters/BaseModal";
import type { ModalProps } from "../../../components/NewFilters/BaseModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  X,
  Copy,
  Check,
  Printer,
  Download,
  Info,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  MoveRight,
  LoaderCircle,
} from "lucide-react";
import { useQuery } from "@apollo/client";
import {
  GET_SUBTRUSTEE_REFUND_RECEIPT,
  GET_SCHOOL_DETAILS_FOR_REFUND,
} from "../../../Qurries";
import { motion, AnimatePresence } from "motion/react";
import RefundTimeline from "./RefundTimeline";
import {
  displayOrDash,
  findTransactionVendor,
  formatRefundGateway,
  formatPaymentChannel,
  formatPaymentDetailLabel,
  formatPaymentMode,
  formatReceiptAmount,
  formatReceiptDate,
  getRefundCompletedAt,
  formatRefundStatusLabel,
  getRefundStatusBadgeClass,
  getRefundVendorId,
} from "../../../utils/refundDisplay";
import {
  getPreviousRefundAmount,
  getRefundSummary,
} from "../../../utils/helper";
import { pdf } from "@react-pdf/renderer";
import { RefundReceiptDocument } from "./RefundReceiptDocument";

export const formatMinutesToHours = (minutes: number): string => {
  const hrs = minutes / 60;
  if (hrs < 1) {
    return `${Math.floor(minutes)} mins`;
  }
  return `${Math.floor(hrs)} hrs`;
};

export default function RefundReceiptModal({
  isOpen,
  onClose,
  title,
  description,
  size,
  closeOnOverlayClick,
  showCloseButton,
  footer,
  id,
  className,
  data,
}: ModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeductions, setShowDeductions] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [clipTip, setClipTip] = useState<{
    text: string;
    top: number;
    left: number;
  } | null>(null);

  const showClipTip = (event: React.MouseEvent) => {
    const el = (event.target as HTMLElement).closest(
      ".truncate",
    ) as HTMLElement | null;
    if (!el) {
      setClipTip((prev) => (prev ? null : prev));
      return;
    }
    const text = el.textContent?.replace(/\s+/g, " ").trim() || "";
    if (!text || text === "-" || el.scrollWidth <= el.clientWidth + 1) {
      setClipTip((prev) => (prev ? null : prev));
      return;
    }
    const rect = el.getBoundingClientRect();
    const maxWidth = 320;
    const next = {
      text,
      top: rect.top - 8,
      left: Math.min(Math.max(8, rect.left), window.innerWidth - maxWidth - 8),
    };
    setClipTip((prev) =>
      prev &&
      prev.text === next.text &&
      Math.abs(prev.top - next.top) < 1 &&
      Math.abs(prev.left - next.left) < 1
        ? prev
        : next,
    );
  };
  const {
    loading: refundReceiptLoading,
    error: refundReceiptError,
    data: refundReceiptData,
  } = useQuery(GET_SUBTRUSTEE_REFUND_RECEIPT, {
    variables: {
      order_id: data?.order_id,
      refund_id: data?._id,
    },
    skip: !data?.order_id || !data?._id,
    fetchPolicy: "network-only", // Always fetch fresh data from the server
  });

  const originalRefund =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.refundRequests?.filter(
      (refund: any) => refund._id === data?._id,
    )[0];
  const transactionDetails =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.transaction;
  const paymentDetails = transactionDetails?.details
    ? JSON.parse(transactionDetails?.details)
    : null;

  const keysToShow =
    transactionDetails?.payment_method === "upi"
      ? ["upi_id"]
      : transactionDetails?.payment_method === "credit_card" ||
          transactionDetails?.payment_method === "debit_card"
        ? ["card_bank_name", "card_number", "card_type"]
        : transactionDetails?.payment_method === "net_banking"
          ? ["netbanking_bank_name"]
          : transactionDetails?.payment_method === "wallet"
            ? ["provider", "upi_id"]
            : [];

  const paymentInfo = keysToShow.map((key) => ({
    key,
    value:
      paymentDetails?.upi?.[
        key as keyof NonNullable<typeof paymentDetails>["upi"]
      ] ||
      paymentDetails?.card?.[
        key as keyof NonNullable<typeof paymentDetails>["card"]
      ] ||
      paymentDetails?.netbanking?.[
        key as keyof NonNullable<typeof paymentDetails>["netbanking"]
      ] ||
      paymentDetails?.wallet?.[
        key as keyof NonNullable<typeof paymentDetails>["app"]
      ] ||
      null,
    method: transactionDetails?.payment_method,
  }));

  const chargesDetails =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.charges;

  const settlementDetails =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.settlement;
  const adjustedSettlement =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.adjustedSettlement;
  const refundTimeline = originalRefund?.timeline;
  const requestedBy = refundTimeline?.[0];
  const approvedBy = refundTimeline?.[1];
  const refundCompleteTimeline = refundTimeline?.find(
    (event: any) =>
      String(event?.event || "")
        .trim()
        .toLowerCase() === "refund completed",
  );
  const refundCompletedAt = getRefundCompletedAt(refundTimeline);

  const previousRefundAmount = getPreviousRefundAmount(
    originalRefund?._id,
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.refundRequests,
  );

  const {
    loading: schoolDetailsLoading,
    error: schoolDetailsError,
    data: schoolDetailsData,
  } = useQuery(GET_SCHOOL_DETAILS_FOR_REFUND, {
    variables: {
      searchQuery:
        transactionDetails?.school_name || transactionDetails?.school_id,
      page: 1,
      limit: 1,
    },
    skip: !transactionDetails?.school_id && !transactionDetails?.school_name,
    fetchPolicy: "network-only",
  });

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const totalRefunded =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.refundRequests
      ?.filter((refund: any) => refund.status.toLowerCase() === "approved")
      .reduce((acc: number, refund: any) => {
        return acc + (refund.refund_amount || 0);
      }, 0);

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
      (acc: number, refund: any) => acc + (Number(refund.refund_amount) || 0),
      0,
    );
  const orderAmountValue = Number(transactionDetails?.order_amount) || 0;
  const transactionAmountValue =
    Number(transactionDetails?.transaction_amount) || 0;
  const convenienceFeeAmount = transactionAmountValue - orderAmountValue;
  const remainingAmountValue = orderAmountValue - successfulRefundTotal;
  const amountRetainedValue = transactionAmountValue - successfulRefundTotal;

  const SCHOOL_DETAILS = schoolDetailsData?.getSubTrusteeSchools?.schools?.[0];
  const merchantAccount =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.merchantAccount;
  const vendorAccount =
    refundReceiptData?.getSubtrusteeRefundRequestReceipt?.vendorAccount;
  const merchantBank = merchantAccount?.bank_details;
  const destinationPaymentInfo = paymentInfo.filter((info) =>
    Boolean(info?.value && String(info.value).trim()),
  );
  const instituteName = displayOrDash(
    transactionDetails?.school_name || SCHOOL_DETAILS?.school_name,
  );
  const instituteEmail = displayOrDash(SCHOOL_DETAILS?.email);
  const instituteCode = displayOrDash(
    transactionDetails?.school_id || SCHOOL_DETAILS?.school_id,
  );
  const institutePhone = displayOrDash(SCHOOL_DETAILS?.phone_number);
  const refundVendorId = getRefundVendorId(originalRefund || data);
  const transactionVendor = findTransactionVendor(
    transactionDetails?.vendors_info,
    vendorAccount?.vendor_id || refundVendorId,
  );
  const isVendorRefundedFrom = Boolean(
    vendorAccount?.vendor_id || refundVendorId,
  );
  const sourceAccountTitle = isVendorRefundedFrom
    ? "Vendor Account (Refunded From)"
    : "Merchant Account (Refunded From)";
  const sourceNameLabel = isVendorRefundedFrom
    ? "Vendor Name"
    : "Merchant Name";
  const sourceIdLabel = isVendorRefundedFrom ? "Vendor ID" : "Merchant ID";
  const sourceName = isVendorRefundedFrom
    ? displayOrDash(vendorAccount?.name || transactionVendor?.name)
    : displayOrDash(
        merchantAccount?.name ||
          SCHOOL_DETAILS?.school_name ||
          transactionDetails?.school_name,
      );
  const sourceId = isVendorRefundedFrom
    ? displayOrDash(vendorAccount?.vendor_id || refundVendorId)
    : displayOrDash(
        merchantAccount?.merchant_id ||
          SCHOOL_DETAILS?.merchantId ||
          transactionDetails?.school_id,
      );
  const sourceBank = isVendorRefundedFrom
    ? vendorAccount?.bank_details
    : merchantBank;

  const receiptPdfDocument = useMemo(
    () => (
      <RefundReceiptDocument
        originalRefund={originalRefund}
        totalRefunded={totalRefunded}
        transactionDetails={transactionDetails}
        previousRefundAmount={previousRefundAmount}
        chargesDetails={chargesDetails}
        settlementDetails={settlementDetails}
        adjustedSettlement={adjustedSettlement}
        refundReceiptData={refundReceiptData}
        requestedBy={requestedBy}
        approvedBy={approvedBy}
        SCHOOL_DETAILS={SCHOOL_DETAILS}
        merchantAccount={merchantAccount}
        vendorAccount={vendorAccount}
        isVendorRefundedFrom={isVendorRefundedFrom}
        sourceAccountTitle={sourceAccountTitle}
        sourceNameLabel={sourceNameLabel}
        sourceIdLabel={sourceIdLabel}
        sourceName={sourceName}
        sourceId={sourceId}
        sourceBank={sourceBank}
        refundCompleteTimeline={refundCompleteTimeline}
        refundTimeline={refundTimeline}
        paymentInfo={destinationPaymentInfo}
      />
    ),
    [
      originalRefund,
      totalRefunded,
      transactionDetails,
      previousRefundAmount,
      chargesDetails,
      settlementDetails,
      adjustedSettlement,
      refundReceiptData,
      requestedBy,
      approvedBy,
      SCHOOL_DETAILS,
      merchantAccount,
      vendorAccount,
      isVendorRefundedFrom,
      sourceAccountTitle,
      sourceNameLabel,
      sourceIdLabel,
      sourceName,
      sourceId,
      sourceBank,
      refundCompleteTimeline,
      refundTimeline,
      destinationPaymentInfo,
    ],
  );

  const handleDownloadPdf = async () => {
    if (pdfDownloading) return;
    setPdfDownloading(true);
    try {
      const blob = await pdf(receiptPdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `Refund-Receipt-${originalRefund?._id || data?._id || "ORD"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfDownloading(false);
    }
  };

  const handlePrint = async (elem: any) => {
    const element: any = document.getElementById("receipt-modal-body");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;

    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    // First page
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      position,
      contentWidth,
      contentHeight,
    );

    heightLeft -= pageHeight - margin * 2;

    // Additional pages
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;

      pdf.addPage();

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        position,
        contentWidth,
        contentHeight,
      );

      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save("refund_receipt.pdf");
  };

  return (
    <div>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        isModal
        size={size || "max"}
        title={title}
        description={
          <div
            className="flex items-center justify-between py-5   print:border-b-2"
            id="receipt-modal-header"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-[500] text-[#1A1A1A] tracking-tight">
                  Refunds Receipt
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRefundStatusBadgeClass(originalRefund?.status)}`}
                >
                  {formatRefundStatusLabel(originalRefund?.status)}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#6A7282] mt-1  tracking-wide uppercase">
                {originalRefund?._id || "------"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfDownloading}
                className="flex items-center gap-2  border border-[#CBD5E1] px-4 py-2 rounded-lg text-sm font-normal text-[#1B163B] cursor-pointer transition-colors disabled:cursor-wait"
                id="pdf-receipt-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{pdfDownloading ? "Generating..." : "Download PDF"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-[#EDF1F4] rounded-lg text-[#99A1AF] hover:text-[#1A1A1A] cursor-pointer transition-colors"
                id="close-receipt-btn"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        }
        closeOnOverlayClick={closeOnOverlayClick}
        showCloseButton={false}
        footer={footer}
        id={id}
        className="!max-w-[min(1440px,92vw)] !w-[min(1440px,92vw)]"
        bodyClassName="!p-6 !w-full"
      >
        {/* Scrollable Body - Two Columns Grid */}

        {refundReceiptLoading ? (
          <div className="w-full flex justify-center items-center min-h-[70vh]">
            <LoaderCircle strokeWidth={1.75} className="animate-spin" />
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto min-h-0 w-full !font-poppins space-y-6 "
            id="receipt-modal-body"
            onMouseOver={showClipTip}
            onMouseLeave={() => setClipTip(null)}
            onScroll={() => setClipTip(null)}
          >
            {clipTip &&
              createPortal(
                <span
                  className="pointer-events-none fixed z-[10050] max-w-xs break-all -translate-y-full rounded-xl border border-[#EAECF0] bg-white px-3 py-2 text-sm font-medium leading-relaxed text-[#344054] shadow-xl"
                  style={{ top: clipTip.top, left: clipTip.left }}
                >
                  {clipTip.text}
                </span>,
                document.body,
              )}
            <div className="grid w-full sm:grid-cols-1 lg:grid-cols-3 gap-6 items-start min-w-0">
              {/* ================= LEFT SIDE COLUMN (LG: Col-span-2) ================= */}
              <div className="lg:col-span-2 w-full space-y-6 min-w-0 overflow-hidden">
                {/* PANEL 1: TRANSACTION BREAKUP */}
                <div
                  className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs relative print-break-inside-avoid"
                  id="transaction-breakup-card"
                >
                  <h3 className="text-xs font-normal text-[#99A1AF] capitalize tracking-wider mb-4">
                    Transaction Breakup
                  </h3>

                  <div className="space-y-4 text-sm font-medium text-[#1A1A1A]">
                    {/* Original Payment */}
                    <div className="space-y-2">
                      <div className="text-xs font-normal text-[#1A1A1A] uppercase tracking-wide">
                        Original Payment
                      </div>
                      <div className="flex justify-between items-center pl-3">
                        <span className="text-[#99A1AF] text-sm font-normal">
                          Order Amount
                        </span>
                        <span className="font-normal text-[#1A1A1A]">
                          ₹
                          {transactionDetails?.order_amount.toLocaleString(
                            "en-IN",
                          ) ?? "0"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pl-3">
                        <span className="text-[#99A1AF] text-sm font-normal">
                          Convenience Fee
                        </span>
                        <span className="font-normal text-[#FB5243]">
                          {formatReceiptAmount(
                            transactionDetails?.order_amount &&
                              transactionDetails?.transaction_amount
                              ? transactionDetails.order_amount -
                                  transactionDetails.transaction_amount
                              : 0,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Line Separator */}
                    <div className="border-t border-[#CBD5E1]" />

                    {/* Transaction Amount */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#1A1A1A] font-bold">
                          Transaction Amount
                        </span>
                      </div>
                      <span className="font-bold text-[#1A1A1A]">
                        ₹
                        {transactionDetails?.transaction_amount.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>

                    {/* Refund Calculation Block */}
                    <div className="bg-[#F9FAFB] p-4 rounded-xl space-y-2.5 text-xs text-[#1A1A1A]">
                      <div className="flex justify-between text-[#6A7282]">
                        <span>Refund Calculation</span>
                      </div>
                      <div className="flex text-sm justify-between font-normal text-[#99A1AF]">
                        <span>Order Amount</span>
                        <span>
                          ₹
                          {transactionDetails?.order_amount?.toLocaleString(
                            "en-IN",
                          ) ?? 0}
                        </span>
                      </div>
                      <div className="flex text-sm  font-normal justify-between text-[#99A1AF]">
                        <span>Refund previous</span>
                        <span>
                          ₹{previousRefundAmount?.toLocaleString("en-IN") ?? 0}
                        </span>
                      </div>
                      <div className="flex text-sm justify-between text-[#99A1AF] items-center">
                        <span className="flex items-center gap-1 font-normal">
                          <span>Amount Retained</span>
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() => setShowDeductions(!showDeductions)}
                              className="p-1 hover:bg-[#EDF1F4] rounded text-[#99A1AF] hover:text-[#1A1A1A] cursor-pointer transition-colors"
                              title="View non-refundable deductions"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>

                            {/* Deductions Popover Card */}
                            <AnimatePresence>
                              {showDeductions && (
                                <>
                                  {/* Popover Backdrop click catcher */}
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowDeductions(false)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                    className="absolute left-0 mt-2 bg-white border border-[#CBD5E1] rounded-xl shadow-xl p-4 z-50 min-w-[240px] text-xs space-y-3"
                                    id="deductions-popover-card"
                                  >
                                    <h4 className="font-bold text-[#1A1A1A]">
                                      Amount Retained
                                    </h4>
                                    <div className="space-y-2 text-[#6A7282]">
                                      <div className="flex justify-between gap-4">
                                        <span>Remaining Order Amount</span>
                                        <span className="font-semibold text-[#1A1A1A]">
                                          {formatReceiptAmount(
                                            remainingAmountValue,
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between gap-4">
                                        <span>Convenience Fee</span>
                                        <span className="font-semibold text-[#1A1A1A]">
                                          {formatReceiptAmount(
                                            convenienceFeeAmount,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </span>
                        <span className="font-normal text-[#FB5243]">
                          {formatReceiptAmount(amountRetainedValue)}
                        </span>
                      </div>
                      {/* Refund to Customer */}
                      <div className="flex justify-between border-t border-[#6A7282] pt-1.5 items-center">
                        <span className="text-base font-normal text-[#1A1A1A]">
                          Refund to Customer
                        </span>
                        <span className="text-base font-normal text-[#1A1A1A]">
                          ₹{totalRefunded?.toLocaleString("en-IN") ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL 2: ORDER & PAYMENT DETAILS */}
                <div
                  className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="order-details-card"
                >
                  <h3 className="text-xs font-normal text-[#99A1AF] capitalize tracking-wider mb-4">
                    Order & Payment Details
                  </h3>

                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 min-w-0">
                    {/* Left Block */}
                    <div className="space-y-3.5 min-w-0 overflow-hidden">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Order ID
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {transactionDetails?.custom_order_id ?? "-"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Edviron Order ID
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                            {transactionDetails?.collect_id ?? "-"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                transactionDetails?.collect_id ?? "-",
                                "txn",
                              )
                            }
                            className="p-1 hover:bg-[#EDF1F4] text-[#99A1AF] hover:text-[#1A1A1A] rounded cursor-pointer transition-colors shrink-0"
                          >
                            {copiedField === "txn" ? (
                              <Check className="w-3.5 h-3.5 text-[#009966]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Fee Type
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          Tuition Fee
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Account Type
                        </span>

                        <div className="px-2 mt-6 w-fit font-normal py-0.5 bg-[#6687FF] text-white text-xs  rounded border border-[#CBD5E1]">
                          {originalRefund?.account_type
                            ? originalRefund.account_type
                                .charAt(0)
                                .toUpperCase() +
                              originalRefund.account_type.slice(1)
                            : "Merchant"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Auto Refund
                        </span>
                        {transactionDetails?.isAutoRefund ? (
                          <div className="px-2.5 w-fit mt-6 py-0.5 bg-[#009966]  text-white rounded text-xs font-normal">
                            Yes
                          </div>
                        ) : (
                          <div className="px-2.5 w-fit mt-6 py-0.5 bg-[#FF0000]  text-white rounded text-xs font-normal">
                            No
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Refund Age/TAT
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {(originalRefund?.processingTimeInMinutes &&
                            formatMinutesToHours(
                              originalRefund?.processingTimeInMinutes,
                            )) ||
                            "0"}
                        </span>
                      </div>
                    </div>

                    {/* Right Block */}
                    <div className="space-y-3.5 min-w-0 overflow-hidden">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Payment ID
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {transactionDetails?.payment_id ?? "pay_LJYTWDANJ"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          ARN Number
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-sm text-[#009966] block min-w-0 truncate">
                            {originalRefund?.refund_arn ?? "-"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                originalRefund?.refund_arn ?? "ARN48291000",
                                "arn",
                              )
                            }
                            className="p-1 hover:bg-[#EDF1F4] text-[#99A1AF] hover:text-[#1A1A1A] rounded cursor-pointer transition-colors shrink-0"
                          >
                            {copiedField === "arn" ? (
                              <Check className="w-3.5 h-3.5 text-[#009966]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Gateway
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {formatRefundGateway(transactionDetails?.gateway)}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Payment Channel
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {formatPaymentChannel(
                            originalRefund?.payment_channel ||
                              transactionDetails?.payment_channel,
                          )}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                          Payment Mode
                        </span>
                        <span className="font-semibold text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {formatPaymentMode(
                            originalRefund?.payment_mode ||
                              transactionDetails?.payment_method,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL 3: PARTIAL REFUND DETAILS */}
                <div
                  className="bg-white rounded-[14px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="partial-refund-card"
                >
                  <h3 className="text-xs font-normal text-[#99A1AF] capitalize tracking-wider mb-4">
                    Partial Refund Details
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 min-w-0 [&>div]:min-w-0 [&>div]:overflow-hidden">
                    <div className="bg-[#F9FAFB] p-3.5 rounded-[10px] ">
                      <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                        Original Order Amount
                      </span>
                      <span className="text-sm font-bold text-[#1A1A1A] mt-1 block">
                        ₹
                        {transactionDetails?.order_amount?.toLocaleString(
                          "en-IN",
                        ) ?? "0"}
                      </span>
                    </div>
                    <div className="bg-[#F9FAFB] p-3.5 rounded-[10px] ">
                      <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                        Total Refunded Till Date
                      </span>
                      <span className="text-sm font-bold text-[#1A1A1A] mt-1 block">
                        ₹{totalRefunded?.toLocaleString("en-IN") ?? "0"}
                      </span>
                    </div>
                    <div className="bg-[#F9FAFB] p-3.5 rounded-[10px] ">
                      <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                        Current Refund Amount
                      </span>
                      <span className="text-sm font-bold text-[#1A1A1A] mt-1 block">
                        ₹
                        {originalRefund?.refund_amount?.toLocaleString(
                          "en-IN",
                        ) ?? "0"}
                      </span>
                    </div>
                    <div className="bg-[#F9FAFB] p-3.5 rounded-[10px] ">
                      <span className="block text-xs font-normal text-[#99A1AF] capitalize tracking-wider">
                        Remaining Refundable
                      </span>
                      <span className="text-sm font-bold text-[#1A1A1A] mt-1 block">
                        ₹
                        {(transactionDetails?.order_amount &&
                          transactionDetails?.order_amount - totalRefunded &&
                          (
                            transactionDetails?.order_amount - totalRefunded
                          )?.toLocaleString("en-IN")) ||
                          "0"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs font-normal text-[#99A1AF]">
                      <span>
                        Refunded:{" "}
                        {
                          getRefundSummary(
                            transactionDetails?.order_amount,
                            transactionDetails?.order_amount - totalRefunded,
                          )?.refundedPercentage
                        }
                        %
                      </span>
                      <span className="text-[#99A1AF]">
                        Remaining:{" "}
                        {transactionDetails?.order_amount &&
                          getRefundSummary(
                            transactionDetails?.order_amount,
                            transactionDetails?.order_amount - totalRefunded,
                          )?.remainingPercentage}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-[#EDF1F4] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6687FF] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${getRefundSummary(transactionDetails?.order_amount, transactionDetails?.order_amount - totalRefunded)?.refundedPercentage}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between  pt-0.5">
                      <span className="text-[#6687FF] text-xs font-normal">
                        ₹{totalRefunded?.toLocaleString("en-IN") ?? "0"}{" "}
                        refunded
                      </span>
                      <span className="text-[#009966] text-xs font-normal">
                        ₹
                        {(
                          transactionDetails?.order_amount - totalRefunded
                        )?.toLocaleString("en-IN") ?? "0"}{" "}
                        remaining
                      </span>
                    </div>
                  </div>

                  {/* Refund History (Same Order) Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-normal text-[#1A1A1A]">
                      Refund History (Same Order)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed text-left text-xs text-[#1A1A1A]">
                        <thead className="  text-[#99A1AF] uppercase border-b border-[#CBD5E1]">
                          <tr>
                            <th className="w-12 px-2 py-2.5 text-xs font-normal">
                              Seq
                            </th>
                            <th className="px-4 py-2.5 text-xs font-normal">
                              Refund ID
                            </th>
                            <th className="w-28 px-4 py-2.5 text-xs font-normal">
                              Date
                            </th>
                            <th className="w-24 px-4 py-2.5 text-xs font-normal">
                              Account
                            </th>
                            <th className="w-28 px-4 py-2.5 text-xs font-normal">
                              Amount
                            </th>
                            <th className="w-36 px-4 py-2.5 text-xs font-normal">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CBD5E1] font-normal">
                          {refundReceiptData?.getSubtrusteeRefundRequestReceipt?.refundRequests.map(
                            (refund: any, index: number) => {
                              return (
                                <tr
                                  key={refund?._id}
                                  className="hover:bg-[#F9FAFB]"
                                >
                                  <td className="w-12 px-2 py-3 text-sm text-[#99A1AF] whitespace-nowrap">
                                    #{index + 1}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-[#009966] truncate">
                                    {refund?._id}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-[#99A1AF]">
                                    {new Date(
                                      refund?.createdAt,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-[#99A1AF]">
                                    Vendor
                                  </td>
                                  <td className="px-4 py-3 text-sm  text-[#6687FF]">
                                    ₹
                                    {refund?.refund_amount?.toLocaleString(
                                      "en-IN",
                                    ) ?? "0"}
                                  </td>
                                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span
                                      className={`inline-flex whitespace-nowrap px-2 py-1 rounded text-xs font-normal border ${getRefundStatusBadgeClass(refund?.status)}`}
                                    >
                                      {formatRefundStatusLabel(refund?.status)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* PANEL 4: REFUND REASON */}
                <div
                  className="bg-white rounded-[14px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="refund-reason-card"
                >
                  <h3 className="text-xs font-normal text-[#99A1AF] capitalize tracking-wider mb-2">
                    Refund Reason
                  </h3>
                  <p className="text-sm font-normal text-[#1A1A1A] leading-relaxed mb-4">
                    {originalRefund?.reason ?? "-"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-t border-[#CBD5E1] pt-3 text-xs min-w-0 [&>div]:min-w-0 [&>div]:overflow-hidden">
                    <div>
                      <span className="block text-xs font-normal text-[#6A7282] tracking-wider">
                        Requested By
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {requestedBy?.role || "-"} -{" "}
                        {requestedBy?.triggered_by || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#6A7282] tracking-wider">
                        Approved By
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {approvedBy?.role || "-"} -{" "}
                        {approvedBy?.triggered_by || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PANEL 5: SETTLEMENT IMPACT */}
                <div
                  className="bg-white rounded-[14px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="settlement-impact-card"
                >
                  <h3 className="text-[10px] font-[500px] text-[#99A1AF] capitalize tracking-wider mb-4">
                    Settlement Impact
                  </h3>

                  {/* Settlement Grid */}
                  <div className="flex flex-col gap-6 mb-4">
                    {/* Original Payment */}
                    <div className="space-y-2">
                      <div className="text-xs font-normal text-black">
                        Original Payment
                      </div>
                      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 min-w-0 [&>div]:min-w-0 [&>div]:overflow-hidden">
                        <div className="flex flex-col justify-between ">
                          <span className="text-[#99A1AF] font-normal mb-1 text-xs ">
                            Settlement UTR
                          </span>
                          <span className="font-normal text-sm text-[#009966]">
                            {settlementDetails?.utrNumber ?? "-"}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between ">
                          <span className="text-[#99A1AF] font-normal mb-1 text-xs ">
                            Settlement Date
                          </span>
                          <span className="font-normal text-sm text-black">
                            {settlementDetails?.settlementDate
                              ? new Date(
                                  settlementDetails?.settlementDate,
                                ).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between ">
                          <span className="text-[#99A1AF] font-normal mb-1 text-xs ">
                            Settlement Amount
                          </span>
                          <span className="font-normal text-sm text-[#009966]">
                            {formatReceiptAmount(
                              settlementDetails?.settlementAmount,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex item-center gap-4">
                      <div className="flex flex-col justify-between">
                        <span className="text-[#99A1AF] font-normal mb-1 text-xs">
                          Original Settlement
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {settlementDetails?.utrNumber ?? "-"}
                        </span>
                        <span className="font-normal text-sm text-[#6A7282]">
                          {settlementDetails?.settlementDate
                            ? new Date(
                                settlementDetails?.settlementDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <MoveRight strokeWidth={1} className="text-[#9898B8]" />
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-[#99A1AF] font-normal mb-1 text-xs">
                          Refund Initiated
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {originalRefund?._id ?? "-"}
                        </span>
                        <span className="font-normal text-sm text-[#6A7282]">
                          {formatReceiptAmount(originalRefund?.refund_amount)}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <MoveRight strokeWidth={1} className="text-[#9898B8]" />
                      </div>
                      <div className="flex flex-col justify-between">
                        <span className="text-[#99A1AF] font-normal mb-1 text-xs">
                          Adjusted From Settlement
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {adjustedSettlement?.utrNumber ?? "-"}
                        </span>
                        <span className="font-normal text-sm text-[#6A7282]">
                          {adjustedSettlement?.settlementDate
                            ? new Date(
                                adjustedSettlement?.settlementDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Refund Adjusted */}
                    <div className="space-y-2 bg-[#F9FAFB] p-4 rounded-[10px] grid md:grid-cols-2 gap-2">
                      <div className="text-xs font-normal text-[#1A1A1A] col-span-2">
                        Refund Adjusted
                      </div>
                      <div className="flex flex-col justify-between ">
                        <span className="text-[#99A1AF] mb-1 text-xs font-normal ">
                          Adjusted From Settlement
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {adjustedSettlement?.utrNumber ?? "-"}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between ">
                        <span className="text-[#99A1AF] mb-1 text-xs font-normal ">
                          Settlement Date
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {adjustedSettlement?.settlementDate
                            ? new Date(
                                adjustedSettlement?.settlementDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between ">
                        <span className="text-[#99A1AF] mb-1 text-xs font-normal ">
                          Adjusted Amount
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {formatReceiptAmount(adjustedSettlement?.adjustment)}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between ">
                        <span className="text-[#99A1AF] mb-1 text-xs font-normal ">
                          Adjustment Date
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] block min-w-0 truncate">
                          {adjustedSettlement?.settlementDate
                            ? new Date(
                                adjustedSettlement?.settlementDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT SIDE COLUMN (LG: Col-span-1) ================= */}
              <div className="w-full space-y-6 min-w-0 overflow-hidden">
                <div
                  className="bg-white rounded-[16px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="institute-details-card"
                >
                  <h3 className="text-xs font-[500px] text-[#6A7282] uppercase tracking-wider mb-3">
                    Institute Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs min-w-0 [&>div]:min-w-0 [&>div]:overflow-hidden">
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Institute Name
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {instituteName}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Email ID
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {instituteEmail}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Institute Code
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {instituteCode}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Mobile Number
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {institutePhone}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-white rounded-[16px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="merchant-account-card"
                >
                  <h3 className="text-xs font-[500px] text-[#6A7282] uppercase tracking-wider mb-3">
                    {sourceAccountTitle}
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        {sourceNameLabel}
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {sourceName}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        {sourceIdLabel}
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {sourceId}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Account Holder
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(sourceBank?.account_holder_name)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Bank
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(
                          sourceBank?.beneficiary_bank_and_address,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Account Number
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(sourceBank?.account_number)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        IFSC Code
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(sourceBank?.ifsc_code)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="bg-white rounded-[16px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="refund-destination-card"
                >
                  <h3 className="text-xs font-[500px] text-[#6A7282] uppercase tracking-wider mb-3">
                    Refund Destination (Source Payment)
                  </h3>
                  <div className="bg-[#F9FAFB] p-3 rounded-xl text-[10px] font-normal text-[#6A7282] text-center mb-4">
                    Refund will be credited to the original payment source
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Payment Mode
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {formatPaymentMode(
                          originalRefund?.payment_mode ||
                            transactionDetails?.payment_method,
                        )}
                      </span>
                    </div>
                    {destinationPaymentInfo.map((info) => (
                      <div key={info.key}>
                        <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                          {formatPaymentDetailLabel(info.key)}
                        </span>
                        <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                          {displayOrDash(info.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="bg-white rounded-[16px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="student-details-card"
                >
                  <h3 className="text-xs font-[500px] text-[#6A7282] uppercase tracking-wider mb-3">
                    Student Details
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Name
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(transactionDetails?.student_name)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Student ID
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(transactionDetails?.student_id)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Class
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(transactionDetails?.class_name)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Email
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(transactionDetails?.student_email)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Phone
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {displayOrDash(transactionDetails?.student_phone)}
                      </span>
                    </div>
                  </div>
                </div>

                <RefundTimeline
                  events={refundTimeline}
                  refundStatus={originalRefund?.status}
                />

                <div
                  className="bg-white rounded-[16px] border border-[#CBD5E1] p-5 shadow-xs print-break-inside-avoid"
                  id="important-dates-card"
                >
                  <h3 className="text-xs font-[500px] text-[#6A7282] uppercase tracking-wider mb-3">
                    Important Dates
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Refund Initiated
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {formatReceiptDate(originalRefund?.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-normal text-[#99A1AF] tracking-wider">
                        Refund Completed
                      </span>
                      <span className="font-normal text-sm text-[#1A1A1A] mt-0.5 block min-w-0 truncate">
                        {formatReceiptDate(refundCompletedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
