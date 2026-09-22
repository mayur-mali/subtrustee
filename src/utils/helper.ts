//Updated regex checking

export function extractRemainingPart(str: string): string {
  return Array.from(str)
    .reverse()
    .join("")
    .replace(/[^a-zA-Z ,()]/, "|")
    .split("|")[0]
    .split("")
    .reverse()
    .join("")
    .trim();
}

interface RefundSummary {
  refundedAmount: number;
  remainingAmount: number;
  refundedPercentage: number;
  remainingPercentage: number;
}

export const getRefundSummary = (
  totalAmount: number,
  remainingAmount: number,
): RefundSummary => {
  if (totalAmount <= 0) {
    return {
      refundedAmount: 0,
      remainingAmount,
      refundedPercentage: 0,
      remainingPercentage: 0,
    };
  }

  const refundedAmount = Math.max(0, totalAmount - remainingAmount);

  return {
    refundedAmount,
    remainingAmount,
    refundedPercentage: Number(
      ((refundedAmount / totalAmount) * 100).toFixed(2),
    ),
    remainingPercentage: Number(
      ((remainingAmount / totalAmount) * 100).toFixed(2),
    ),
  };
};

/**
 * Returns the total refund amount that was refunded
 * before the current refund.
 */
export const getPreviousRefundAmount = (
  currentRefundId: string,
  refunds: Array<{
    _id: string;
    createdAt: string;
    refund_amount: number;
  }>,
): number => {
  if (!currentRefundId || !Array.isArray(refunds)) return 0;

  const currentRefund = refunds.find(
    (refund) => refund._id === currentRefundId,
  );

  if (!currentRefund) return 0;

  const currentDate = new Date(currentRefund.createdAt).getTime();

  return refunds
    .filter(
      (refund) =>
        refund._id !== currentRefundId &&
        new Date(refund.createdAt).getTime() < currentDate,
    )
    .reduce((total, refund) => total + (refund.refund_amount || 0), 0);
};
