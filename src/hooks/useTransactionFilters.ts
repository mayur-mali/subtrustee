import { useSearchParams } from "react-router-dom";

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlFilters = {
    tab: searchParams.get("tab") || "transactions",
    payment_modes: searchParams.get("payment_modes") || "",
    gateway: searchParams.get("gateway") || "",
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
    school_id: searchParams.get("school_id") || "",
    school_name: searchParams.get("school_name") || "",
    status: searchParams.get("status") || "",
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    vendor_id: searchParams.get("vendor_id") || "",
    vendor_name: searchParams.get("vendor_name") || "",
    search: searchParams.get("search") || "",
    search_filter: searchParams.get("search_filter") || "",
    utr: searchParams.get("utr") || "",
    days: searchParams.get("days") || "",
    date_filter_type: searchParams.get("date_filter_type") || "",
  };

  function setUrlFilters(newFilters: any) {
    const updated = { ...urlFilters, ...newFilters };
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    setSearchParams(params, { replace: true });
  }

  return [urlFilters, setUrlFilters] as const;
}

export const usePaymentFilters = useTransactionFilters;
