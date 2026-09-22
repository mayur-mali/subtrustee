import React from "react";
import { Check } from "lucide-react";
import {
  getVisibleRefundTimeline,
  isDeletedRefundStatus,
} from "../../../utils/refundDisplay";

export interface TimelineEvent {
  event: string | null;
  status: string | null;
  triggered_by: string | null;
  user_id: string | null;
  role: string | null;
  triggered_at: string | null;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  remarks: string | null;
}

/**
 * Format: 10:30 AM
 */
export const formatTime = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format: YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const defaultEvents: TimelineEvent[] = [
  {
    event: "Refund Requested",
    status: "",
    triggered_by: "",
    user_id: "user1",
    role: "owner",
    triggered_at: "",
    ipAddress: "",
    browser: "",
    os: "Windows 11",
    location: null,
    remarks: "Refund requested for duplicate payment",
  },
  {
    event: "Refund Approved",
    status: "",
    triggered_by: "System",
    user_id: null,
    role: "EDviron PG",
    triggered_at: "",
    ipAddress: null,
    browser: null,
    os: null,
    location: null,
    remarks: null,
  },
  {
    event: "Sent to Gateway",
    status: "",
    triggered_by: "System",
    user_id: null,
    role: "SYSTEM",
    triggered_at: "",
    ipAddress: null,
    browser: null,
    os: null,
    location: null,
    remarks: null,
  },
  {
    event: "Gateway/Bank Processing",
    status: "",
    triggered_by: "Cashfree",
    user_id: null,
    role: "GATEWAY",
    triggered_at: "",
    ipAddress: null,
    browser: null,
    os: null,
    location: null,
    remarks: null,
  },
  {
    event: "Refund Completed",
    status: "",
    triggered_by: "Gateway",
    user_id: null,
    role: "GATEWAY",
    triggered_at: "",
    ipAddress: null,
    browser: null,
    os: null,
    location: null,
    remarks: null,
  },
];

interface DetailCellProps {
  label: string | null;
  value?: string | null;
}

const DetailCell = ({ label, value }: DetailCellProps) => (
  <div className="min-w-0">
    <p className="mb-1 text-[9px] font-normal leading-[13.5px] text-[#99A1AF]">
      {label}
    </p>

    <p className="truncate text-[10px] font-[500] leading-[15px] text-[#1A1A1A]">
      {value || "-"}
    </p>
  </div>
);

interface TimelineNodeProps {
  event: TimelineEvent;
  isLast: boolean;
}

const TimelineNode = ({ event, isLast }: TimelineNodeProps) => {
  const {
    event: eventLabel,
    status,
    triggered_by,
    user_id,
    role,
    triggered_at,
    ipAddress,
    browser,
    os,
    location,
    remarks,
  } = event;

  return (
    <div className="flex gap-3.5">
      {/* Timeline */}
      <div className="flex w-[22px] shrink-0 flex-col items-center">
        {status?.toLowerCase() === "completed" ? (
          <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#6687FF]">
            <Check size={10} strokeWidth={3} className="text-white" />
          </div>
        ) : (
          <div className="mt-1 h-[14px] w-[14px] rounded-full border-2 border-[#D2DCF6] " />
        )}

        {!isLast && (
          <div className="mt-1 min-h-[68px] w-[2px] flex-1 bg-[#D2DCF6]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-7">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-[10px] leading-[15px] font-normal text-[#6687FF]">
            {eventLabel}
          </h3>

          <span className="text-[10px] font-normal leading-[15px] text-[#99A1AF]">
            {formatTime(triggered_at) ?? "-"}
          </span>
        </div>

        <p className="mt-0.5 text-[10.5px] font-normal leading-[14px] text-[#1A1A1A]">
          {formatDateTime(triggered_at) ?? "-"}
          {location && ` | ${location}`}
        </p>

        <div className="mt-2.5 grid grid-cols-3 gap-3 rounded-[10px] bg-[#F9FAFB] p-3.5">
          <DetailCell label="By" value={triggered_by} />
          <DetailCell label="IP" value={ipAddress} />
          <DetailCell label="Browser" value={browser} />
        </div>
      </div>
    </div>
  );
};

interface RefundTimelineProps {
  events?: TimelineEvent[];
  heading?: string;
  refundStatus?: string | null;
}

const RefundTimeline = ({
  events,
  heading = "Planning Schedule",
  refundStatus,
}: RefundTimelineProps) => {
  const visibleEvents = getVisibleRefundTimeline(
    Array.isArray(events) ? events : defaultEvents,
    refundStatus,
  );
  const showDeletedBanner = isDeletedRefundStatus(refundStatus);

  return (
    <div className="w-full rounded-[20px] border border-[#D2DCF6] bg-white px-[22px] pt-[22px] pb-[6px] shadow-sm">
      <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.05px] text-[#6A7282]">
        {heading}
      </h2>

      <div>
        {visibleEvents.map((event, index) => (
          <TimelineNode
            key={index * 200}
            event={event}
            isLast={index === visibleEvents.length - 1 && !showDeletedBanner}
          />
        ))}
        {showDeletedBanner && (
          <div className="mb-5 rounded-2xl bg-[#FEF3F2] px-6 py-5 text-center text-sm font-medium text-[#F04438]">
            Refund request is deleted by user
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundTimeline;
