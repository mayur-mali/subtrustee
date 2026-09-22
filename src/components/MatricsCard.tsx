import React from "react";
import { motion } from "motion/react";

export interface MetricsCardProps {
  /**
   * React key for list rendering
   */
  key?: React.Key;
  /**
   * Title / label of the metric card (e.g., "Total Refunded", "Active Users")
   */
  title: string;
  /**
   * Main display value (e.g., "₹42.8 L", "2.4 hrs", "847")
   */
  value: React.ReactNode;
  /**
   * Supporting descriptive text or badges at the bottom of the card
   */
  subtext?: React.ReactNode;
  /**
   * Color class for the subtext (e.g., "text-[#12B76A]" for green, "text-[#F04438]" for red)
   * @default 'text-[#667085]'
   */
  subtextColor?: string;
  /**
   * Icon component to display on the bottom-right of the card
   */
  icon?: React.ReactNode;
  /**
   * Controls the loading skeleton state of the card
   * @default false
   */
  isLoading?: boolean;
  /**
   * Custom ID for DOM target reference
   */
  id?: string;
  /**
   * Additional tailwind classes to apply to the card container
   */
  className?: string;
  /**
   * Extra classes for the circular icon wrapper
   */
  iconWrapClassName?: string;
}

export function MetricsCard({
  title,
  value,
  subtext,
  subtextColor = "text-[#667085]",
  icon,
  isLoading = false,
  id,
  className = "",
  iconWrapClassName = "bg-[#F8F9FC]",
}: MetricsCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 280, damping: 24 },
    },
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[145px] relative overflow-hidden ${className}`}
        id={id ? `${id}-skeleton` : undefined}
      >
        {/* Shimmer loading gradient animation overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[#F9FAFB]/60 to-transparent" />

        {/* Top title skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-[#F2F4F7] rounded-md w-24 animate-pulse" />
          {/* Main big value skeleton */}
          <div className="h-9 bg-[#F2F4F7] rounded-lg w-32 animate-pulse mt-1" />
        </div>

        {/* Bottom info row skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-[#F2F4F7] rounded-md w-16 animate-pulse" />
          {/* Circular icon container skeleton */}
          <div className="w-11 h-11 bg-[#F2F4F7] rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      className={`bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-[#D0D5DD] transition-all flex flex-col justify-between relative min-h-[135px] ${className}`}
      id={id}
    >
      {/* Title / Label */}
      <div className="space-y-2">
        <span className="text-[12px] capitalize font-medium text-[#475569] block">
          {title?.toLowerCase() ?? ""}
        </span>
        <span className="text-[36px] font-semibold text-[#1E293B] tracking-tight block leading-none">
          {value === undefined || value === null ? 0 : value}
        </span>
      </div>

      {/* Subtext and circular icon at the bottom */}
      <div className="flex items-center justify-between mt-3">
        <div className={`text-xs font-semibold ${subtextColor}`}>{subtext}</div>

        {icon && (
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconWrapClassName}`}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
