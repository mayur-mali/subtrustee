import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import Select, { components, type StylesConfig } from "react-select";

import { GET_VENDORS_FOR_REPORT } from "../../../../../Qurries";
import { CustomDropdownIndicator } from "../../Transaction";

interface VendorOption {
  label: string;
  value: string;
  id: string;
}

function Vendor({ setSelectVendor, setVendorId, menuIsOpen, schoolId }: any) {
  const [limit, setLimit] = useState(10);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, loading, refetch } = useQuery(GET_VENDORS_FOR_REPORT, {
    variables: { school: schoolId && schoolId.length > 0 ? schoolId : null },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getVendorsForReport) {
      const fetchedVendors = data.getVendorsForReport.map((vendor: any) => ({
        label: vendor.name,
        value: vendor.name,
        id: vendor.vendor_id,
      }));
      setVendors(fetchedVendors);
      setTotalCount(fetchedVendors.length);
    }
  }, [data]);

  const handleScroll = (event: any) => {
    const target = event.target as HTMLDivElement;
    if (
      !loading &&
      totalCount !== null &&
      vendors.length < totalCount &&
      target.scrollHeight - target.scrollTop === target.clientHeight
    ) {
      setLimit((prev) => Math.min(prev + 10, totalCount));
    }
  };

  const debouncedSearch = useCallback(
    (val: string) => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(async () => {
        setInputValue(val);
        const res = await refetch({
          school: schoolId && schoolId.length > 0 ? schoolId : null,
        });
        if (res?.data?.getVendorsForReport) {
          const updatedVendors = res.data.getVendorsForReport
            .filter((vendor: any) =>
              vendor.name.toLowerCase().includes(val.toLowerCase()),
            )
            .map((vendor: any) => ({
              label: vendor.name,
              value: vendor.name,
              id: vendor.vendor_id,
            }));
          setVendors(updatedVendors);
          setTotalCount(updatedVendors.length);
        }
      }, 700);
    },
    [limit, refetch, schoolId],
  );

  const CustomMenuList = (props: any) => {
    const { children } = props;
    return (
      <components.MenuList {...props}>
        <div>
          {children}
          {totalCount !== null && vendors.length >= totalCount && (
            <div className="py-2 text-center text-xs text-gray-500">
              All content loaded.
            </div>
          )}
          {totalCount !== null && vendors.length < totalCount && !loading && (
            <div className="py-2 text-center text-xs text-gray-500">
              Scroll down to load more...
            </div>
          )}
        </div>
      </components.MenuList>
    );
  };

  const customStyles: StylesConfig<VendorOption> = {
    control: (base) => ({
      ...base,
      backgroundColor: "#F6F8FA",
      border: "1px solid #1B163B",
      borderRadius: "6px",
      minHeight: "15px",
      margin: 0,
      fontSize: "14px",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0px 0.5rem",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
    }),
    input: (base) => ({
      ...base,
      backgroundColor: "transparent",
      color: "#000",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#1E1B59",
      fontSize: "12px",
    }),
  };

  return (
    <div className="w-full flex flex-col">
      <Select
        className="font-normal capitalize"
        closeMenuOnSelect={true}
        onMenuScrollToBottom={handleScroll}
        options={vendors}
        menuIsOpen={menuIsOpen}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          IndicatorSeparator: () => null,
          MenuList: CustomMenuList,
        }}
        onChange={(selected: any) => {
          if (selected) {
            setSelectVendor(selected.value);
            setVendorId(selected.id);
            setInputValue(""); // Clear input after selection
          }
        }}
        placeholder="Select Vendor"
        styles={customStyles}
        isMulti={false}
        isLoading={loading}
        inputValue={inputValue}
        onInputChange={(val) => {
          setInputValue(val);
          debouncedSearch(val);
        }}
      />
    </div>
  );
}

export default Vendor;
