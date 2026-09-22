import React, { useState, useEffect } from "react";
import BaseModal from "../../../components/NewFilters/BaseModal";
import type { ModalProps } from "../../../components/NewFilters/BaseModal";
import {
  Copy,
  Check,
  Download,
  FileText,
  Info,
  X,
  LoaderCircle,
} from "lucide-react";
import { useLazyQuery } from "@apollo/client";
import { GET_SUBTRUSTEE_SINGLE_DISPUTES } from "../../../Qurries";
import {
  formatDisputeAmount,
  formatDisputeDate,
  formatDisputeGateway,
  formatDisputeStatus,
  formatDisputeType,
  formatPaymentChannel,
  formatPaymentMode,
  getDisputeStatusBadgeClass,
} from "../../../utils/disputeDisplay";

const DISPUTE_MODAL_FRAME =
  "!max-w-[1200px] !w-[min(1200px,calc(100vw-32px))] !h-[min(971px,calc(100vh-32px))] !max-h-[min(971px,92vh)] !rounded-lg !bg-[#F9FAFB] !border-[#CBD5E1]";

function formatTimelineDate(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimelineTime(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatEventTitle(status?: string | null) {
  const raw = String(status || "").trim();
  if (!raw) return "-";
  return raw
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DisputeReceiptModal({
  isOpen,
  onClose,
  size,
  closeOnOverlayClick = true,
  className = "",
  data,
}: ModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "settlement">(
    "details",
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [
    getSingleDispute,
    { data: singleDisputeData, loading: singleDisputeLoading },
  ] = useLazyQuery(GET_SUBTRUSTEE_SINGLE_DISPUTES);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
      setCopiedField(null);
      if (data?.dispute_id || data?.collect_id) {
        getSingleDispute({
          variables: {
            dispute_id: data?.dispute_id,
            collect_id: data?.collect_id,
          },
        });
      }
    }
  }, [isOpen, data?.dispute_id, data?.collect_id, getSingleDispute]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const detail = singleDisputeData?.getSubTrusteeSingleDisputes || data;
  const disputeId = detail?.dispute_id || "-";
  const disputeStatus = detail?.dispute_status || "-";
  const disputeAmount = formatDisputeAmount(detail?.dispute_amount);
  const orderId = detail?.custom_order_id || detail?.collect_id || "-";
  const chargebackId = detail?.dispute_id || detail?.case_id || "-";
  const edvironId = detail?.collect_id || "-";
  const transactionId = detail?.case_id || detail?.bank_reference || "-";
  const reason = detail?.reason_description || "-";
  const orderAmount = formatDisputeAmount(detail?.order_amount);
  const transactionAmount = formatDisputeAmount(
    detail?.payment_amount || detail?.order_amount,
  );
  const chargebackAmt = formatDisputeAmount(detail?.dispute_amount);
  const disputeType = formatDisputeType(
    detail?.dispute_type,
    detail?.dispute_status,
  );
  const issuingBank = detail?.issuing_bank || "-";
  const network = detail?.card_network || detail?.network || "-";
  const paymentChannel = formatPaymentChannel(detail?.payment_channel);
  const paymentMode = formatPaymentMode(detail?.payment_mode);
  const gateway = formatDisputeGateway(detail?.gateway);
  const createdDate = formatDisputeDate(detail?.dispute_created_date);
  const respondBy = formatDisputeDate(detail?.dispute_respond_by_date);
  const bankRef = detail?.bank_reference || "-";
  const institute = detail?.school_name || "-";
  const studentName = detail?.student_name || "-";
  const studentId = detail?.student_id || "-";
  const classSection = detail?.class_section || detail?.student_class || "-";
  const phoneNumber = detail?.student_phone || detail?.phone || "-";
  const recentRemarks = detail?.remarks || detail?.dispute_remark || "-";
  const settlementImpacted = detail?.settlement_id || "-";
  const settlementImpactedAt = formatDateTime(detail?.dispute_settled_date);
  const settlementAdjusted =
    detail?.dispute_deduction_settlement_utr || detail?.utr_number || "-";
  const settlementAdjustedAt = formatDateTime(
    detail?.dispute_resolved_at_date || detail?.dispute_updated_date,
  );
  const eventSteps = (singleDisputeData?.getSubTrusteeSingleDisputes
    ?.event_steps ||
    data?.event_steps ||
    []) as Array<{
    status?: string;
    remark?: string;
    settlement_id?: string;
    utr_no?: string;
    event_date?: string;
  }>;
  const previousDocuments =
    singleDisputeData?.getSubTrusteeSingleDisputes?.documents ||
    data?.documents ||
    [];

  const renderCopyableField = (
    label: string,
    value: string,
    fieldKey: string,
  ) => (
    <div className="pt-4 min-w-0">
      <div className="text-[10px] text-[#4A5565] uppercase tracking-[0.5px] leading-[15px]">
        {label}
      </div>
      <div className="flex items-center gap-1.5 mt-0.5 text-sm text-[#1A1A1A] leading-5">
        <span className="truncate">{value}</span>
        <button
          onClick={() => handleCopy(value, fieldKey)}
          className="text-[#98A2B3] hover:text-[#475467] transition-colors p-0.5 cursor-pointer shrink-0"
          title="Copy value"
        >
          {copiedField === fieldKey ? (
            <Check className="w-3 h-3 text-[#079455]" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );

  const renderStandardField = (label: string, value: string) => (
    <div className="pt-4 min-w-0">
      <div className="text-[10px] text-[#4A5565] uppercase tracking-[0.5px] leading-[15px]">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-[#1A1A1A] leading-5 truncate">
        {value}
      </div>
    </div>
  );

  const renderPayerCard = (
    label: string,
    value: React.ReactNode,
    opts?: { info?: string; className?: string },
  ) => (
    <div
      className={`bg-[#F9FAFB] rounded-lg p-3 min-h-[63px] ${opts?.className || ""}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-[#4A5565] leading-[15px]">
          {label}
        </span>
        {opts?.info ? (
          <span title={opts.info}>
            <Info className="w-3.5 h-3.5 text-[#98A2B3]" />
          </span>
        ) : null}
      </div>
      <div className="mt-0.5 text-sm font-medium text-[#1A1A1A] leading-5 break-words">
        {value}
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      isModal
      size={size}
      description={
        <div className="w-full font-sans">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-[5px]">
              <div className="flex items-center gap-3.5">
                <h2 className="text-lg font-semibold text-[#1A1A1A] leading-normal">
                  Dispute ID
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getDisputeStatusBadgeClass(detail?.dispute_status)}`}
                >
                  {formatDisputeStatus(disputeStatus)}
                </span>
              </div>
              <span className="text-sm font-normal text-[#6A7282] tracking-[-0.084px]">
                {disputeId}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-[#EAECEF] rounded-lg text-[#98A2B3] hover:text-[#475467] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-10 text-xs font-medium pt-4">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 pt-2.5 pb-3 transition-all cursor-pointer ${
                activeTab === "details"
                  ? "text-black border-b-[1.6px] border-black"
                  : "text-[#6A7282] hover:text-[#1A1A1A] border-b-[1.6px] border-transparent"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("settlement")}
              className={`px-4 pt-2.5 pb-3 transition-all cursor-pointer ${
                activeTab === "settlement"
                  ? "text-black border-b-[1.6px] border-black"
                  : "text-[#6A7282] hover:text-[#1A1A1A] border-b-[1.6px] border-transparent"
              }`}
            >
              Settlement Impact
            </button>
          </div>
        </div>
      }
      closeOnOverlayClick={closeOnOverlayClick}
      showCloseButton={false}
      headerBorder={false}
      className={`${DISPUTE_MODAL_FRAME} ${className}`}
      bodyClassName="!p-0 !overflow-hidden flex-1 min-h-0 flex flex-col"
    >
      <div className="h-full min-h-0 font-sans text-[#1A1A1A] bg-[#F9FAFB] px-10 pb-6 overflow-y-auto custom-scrollbar">
        {activeTab === "details" && (
          <div className="bg-white rounded-lg p-5 min-h-full">
            <div className="flex items-start gap-8">
              <section className="flex w-1/2 min-w-0 flex-col">
                <div className="bg-[#F9FAFB] rounded-lg p-5 flex items-start justify-between gap-4">
                  <p className="text-[32px] font-semibold text-[#FB5243] leading-[48px]">
                    {disputeAmount}
                  </p>
                  <p className="text-xs text-[#6A7282] leading-4 pt-1 shrink-0">
                    Disputed Amount
                  </p>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-6">
                  <div className="flex flex-col">
                    {renderCopyableField("order ID", orderId, "orderId")}
                    {renderCopyableField(
                      "dispute ID",
                      chargebackId,
                      "disputeId",
                    )}
                    {renderCopyableField("edviron id", edvironId, "edvironId")}
                    {renderCopyableField(
                      "transaction id",
                      transactionId,
                      "transactionId",
                    )}
                    {renderStandardField("dispute Reason", reason)}
                    {renderStandardField("order amount", orderAmount)}
                    {renderStandardField("dispute amount", chargebackAmt)}
                    {renderStandardField("dispute type", disputeType)}
                  </div>
                  <div className="flex flex-col">
                    {renderStandardField("issuing bank", issuingBank)}
                    {renderStandardField("network", network)}
                    {renderStandardField("payment channel", paymentChannel)}
                    {renderStandardField("payment mode", paymentMode)}
                    {renderStandardField("payment gateway", gateway)}
                    {renderStandardField("created date", createdDate)}
                    {renderStandardField(
                      "transaction amount",
                      transactionAmount,
                    )}
                    {renderStandardField("Respond by", respondBy)}
                    {renderStandardField("Bank Reference Number", bankRef)}
                  </div>
                </div>
              </section>

              <section className="flex w-1/2 min-w-0 flex-col">
                <p className="text-[10px] text-[#6A7282] uppercase tracking-[1px] leading-[15px]">
                  Payer Information
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    {renderPayerCard("Institute", institute)}
                    {renderPayerCard("Student Name", studentName)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {renderPayerCard("Student ID", studentId)}
                    {renderPayerCard("Class / Section", classSection)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-stretch">
                    <div className="flex flex-col gap-2">
                      {renderPayerCard("Phone Number", phoneNumber)}
                      {renderPayerCard(
                        "Settlement Impacted",
                        <>
                          <p>{settlementImpacted}</p>
                          {settlementImpactedAt ? (
                            <p className="text-xs font-normal text-[#1A1A1A]">
                              {settlementImpactedAt}
                            </p>
                          ) : null}
                        </>,
                        {
                          info: "Settlement that originally paid out this transaction.",
                          className: "min-h-[89px]",
                        },
                      )}
                      {renderPayerCard(
                        "Settlement Adjusted",
                        <>
                          <p>{settlementAdjusted}</p>
                          {settlementAdjustedAt ? (
                            <p className="text-xs font-normal text-[#1A1A1A]">
                              {settlementAdjustedAt}
                            </p>
                          ) : null}
                        </>,
                        {
                          info: "Settlement where the dispute amount was adjusted.",
                          className: "min-h-[89px]",
                        },
                      )}
                    </div>
                    {renderPayerCard(
                      "Recent Remarks from Bank/Payment Gateway",
                      recentRemarks,
                      { className: "h-full min-h-[256px]" },
                    )}
                  </div>
                </div>
              </section>
            </div>

            {previousDocuments.length > 0 && (
              <div className="mt-6 border-t border-[#EAECF0] pt-5">
                <h4 className="text-sm font-medium text-[#1A1A1A] mb-3">
                  Documents
                </h4>
                <div className="space-y-3">
                  {previousDocuments.map((doc: any, index: number) => (
                    <div
                      key={`${doc.name}-${index}`}
                      className="p-4 rounded-xl border border-[#EAECF0] bg-[#F9FAFB]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <FileText className="w-6 h-6 text-[#98A2B3] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#1A1A1A] truncate">
                              {doc.name}
                            </div>
                            <div className="text-[11px] text-[#98A2B3] mt-0.5">
                              {doc.document_type || "Document"}
                            </div>
                          </div>
                        </div>
                        {doc?.file_url ? (
                          <a
                            href={doc.file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 h-[30px] px-3 rounded-lg border border-[#EAECF0] text-xs font-medium text-[#344054] bg-white hover:bg-gray-50 transition-colors shrink-0"
                          >
                            <Download className="w-3 h-3 text-[#667085]" />
                            Download
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="bg-white rounded-lg p-6 min-h-full">
            {singleDisputeLoading && eventSteps.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <LoaderCircle strokeWidth={1.5} className="animate-spin" />
              </div>
            ) : eventSteps.length === 0 ? (
              <p className="text-sm text-[#6A7282] py-10 text-center">
                No settlement timeline events yet.
              </p>
            ) : (
              <div>
                {[...eventSteps].reverse().map((step, index, steps) => {
                  const showSettlementCard = Boolean(
                    step?.settlement_id ||
                    step?.utr_no ||
                    /won|loss|settled|raised|initiated/i.test(
                      String(step?.status || ""),
                    ),
                  );
                  return (
                    <div
                      key={`${step?.status}-${step?.event_date}-${index}`}
                      className="grid grid-cols-[88px_24px_minmax(0,1fr)] gap-3"
                    >
                      <div className="pt-0.5 text-right">
                        <div className="text-[11px] font-medium text-[#1A1A1A]">
                          {formatTimelineDate(step?.event_date)}
                        </div>
                        <div className="text-[10px] text-[#6A7282]">
                          {formatTimelineTime(step?.event_date)}
                        </div>
                      </div>
                      <div className="relative flex flex-col items-center">
                        <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#1A1A1A] z-10 shrink-0" />
                        {index < steps.length - 1 ? (
                          <div className="absolute top-4 bottom-0 w-px bg-[#E5E7EB]" />
                        ) : null}
                      </div>
                      <div className="pb-8 min-w-0">
                        <h4 className="text-sm font-semibold text-[#1A1A1A]">
                          {formatEventTitle(step?.status)}
                        </h4>
                        {step?.remark ? (
                          <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                            {step.remark}
                          </p>
                        ) : null}
                        {showSettlementCard ? (
                          <div className="mt-3 bg-[#F9FAFB] rounded-lg p-3.5 border border-[#EAECF0] text-xs space-y-2 max-w-[420px]">
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[#98A2B3]">
                                Settlement Date
                              </span>
                              <span className="font-medium text-[#1A1A1A]">
                                {formatDisputeDate(step?.event_date)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[#98A2B3]">Amount Due</span>
                              <span className="font-medium text-[#1A1A1A]">
                                {chargebackAmt}
                              </span>
                            </div>
                            {step?.settlement_id || step?.utr_no ? (
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[#98A2B3]">
                                  Settlement ID
                                </span>
                                <span className="font-medium text-[#1A1A1A] truncate">
                                  {step?.settlement_id || step?.utr_no}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
