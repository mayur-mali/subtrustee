import { useSearchParams } from "react-router-dom";

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlFilters = {
    payment_modes: searchParams.get("payment_modes") || "",
    gateway: searchParams.get("gateway") || "",
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
    school_id: searchParams.get("school_id") || "",
    school_name: searchParams.get("school_name") || "",
    status: searchParams.get("status") || "",
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 10,
    product: searchParams.get("product") || "",
  };

  function setUrlFilters(newFilters: any) {
    const updated = { ...urlFilters, ...newFilters };
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, value as string);
    });
    setSearchParams(params, { replace: true });
  }

  return [urlFilters, setUrlFilters] as const;
}
