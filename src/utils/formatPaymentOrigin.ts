export interface PaymentOriginInfo {
  label: string;
  value: string;
}

export const formatPaymentOrigin = (origin?: string): PaymentOriginInfo => {
  const normalizedOrigin = origin?.toLowerCase().trim();

  switch (normalizedOrigin) {
    case "form payment":
      return { label: "Form Payment", value: "form_payment" };
    case "auto debit":
      return { label: "Auto Debit (Subscription/Plan)", value: "auto_debit" };
    case "collect now":
      return { label: "Collect Now", value: "collect_now" };
    case "Na":
      return { label: "NA", value: "na" };
    default:
      return { label: "NA", value: "na" };
  }
};
