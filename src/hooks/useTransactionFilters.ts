import { useSearchParams } from "react-router-dom";

const FILTER_KEYS = [
  "tab",
  "payment_modes",
  "payment_channel",
  "payment_mode",
  "account_type",
  "gateway",
  "start_date",
  "end_date",
  "school_id",
  "school_name",
  "status",
  "page",
  "limit",
  "vendor_id",
  "vendor_name",
  "search",
  "search_filter",
  "utr",
  "days",
  "date_filter_type",
  "capture_status",
  "account",
  "is_date_range_selected",
  "dispute_type",
] as const;

export type TransactionUrlFilters = {
  tab: string;
  payment_modes: string;
  payment_channel: string;
  payment_mode: string;
  account_type: string;
  gateway: string;
  start_date: string;
  end_date: string;
  school_id: string;
  school_name: string;
  status: string;
  page: string;
  limit: string;
  vendor_id: string;
  vendor_name: string;
  search: string;
  search_filter: string;
  utr: string;
  days: string;
  date_filter_type: string;
  capture_status: string;
  account?: string;
  is_date_range_selected?: string;
  dispute_type?: string;
};

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlFilters: TransactionUrlFilters = {
    tab: searchParams.get("tab") || "transactions",
    payment_modes: searchParams.get("payment_modes") || "",
    payment_channel: searchParams.get("payment_channel") || "",
    payment_mode: searchParams.get("payment_mode") || "",
    account_type: searchParams.get("account_type") || "",
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
    capture_status: searchParams.get("capture_status") || "",
    account: searchParams.get("account") || "",
    is_date_range_selected: searchParams.get("is_date_range_selected") || "",
    dispute_type: searchParams.get("dispute_type") || "",
  };

  function setUrlFilters(newFilters: Record<string, any>) {
    const updated: Record<string, any> = { ...urlFilters, ...newFilters };
    const params = new URLSearchParams();
    FILTER_KEYS.forEach((key) => {
      const value = updated[key];
      if (value === null || value === undefined || value === "") return;
      if (Array.isArray(value)) {
        if (value.length) params.set(key, value.join(","));
        return;
      }
      params.set(key, String(value));
    });
    setSearchParams(params, { replace: true });
  }

  return [urlFilters, setUrlFilters] as const;
}

export const usePaymentFilters = useTransactionFilters;
