import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import Select, { components, type StylesConfig } from "react-select";

import { GET_INSTITUTES } from "../../../../../Qurries";
import { CustomDropdownIndicator } from "../../Transaction";

interface SchoolOption {
  label: string;
  value: string;
  id: string;
}

function Institute({ setSelectSchool, setSchoolId, menuIsOpen, value }: any) {
  const [limit, setLimit] = useState(10);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const [selectedOption, setSelectedOption] = useState<SchoolOption | null>(
    null,
  );

  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
    }
  }, [value]);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, loading, refetch } = useQuery(GET_INSTITUTES, {
    variables: { page: 1, limit, searchQuery: inputValue },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getSubTrusteeSchools?.schools) {
      const fetchedSchools = data.getSubTrusteeSchools.schools.map(
        (school: any) => ({
          label: school.school_name,
          value: school.school_name,
          id: school.school_id,
        }),
      );
      setSchools(fetchedSchools);
      setTotalCount(data.getSubTrusteeSchools.totalItems);
    }
  }, [data]);

  const handleScroll = (event: any) => {
    const target = event.target as HTMLDivElement;
    if (
      !loading &&
      totalCount !== null &&
      schools.length < totalCount &&
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
        const res = await refetch({ searchQuery: val, page: 1, limit });
        if (res?.data?.getSubTrusteeSchools?.schools) {
          const updatedSchools = res.data.getSubTrusteeSchools.schools.map(
            (school: any) => ({
              label: school.school_name,
              value: school.school_name,
              id: school.school_id,
            }),
          );
          setSchools(updatedSchools);
          setTotalCount(res.data.getSubTrusteeSchools.totalItems);
        }
      }, 700);
    },
    [limit, refetch],
  );

  const CustomMenuList = (props: any) => {
    const { children } = props;
    return (
      <components.MenuList {...props}>
        <div>
          {children}
          {/* {loading && <div className="py-2 text-center text-sm">Loading…</div>} */}
          {totalCount !== null && schools.length >= totalCount && (
            <div className="py-2 text-center text-xs text-gray-500">
              All content loaded.
            </div>
          )}
          {totalCount !== null && schools.length < totalCount && !loading && (
            <div className="py-2 text-center text-xs text-gray-500">
              Scroll down to load more...
            </div>
          )}
        </div>
      </components.MenuList>
    );
  };

  const customStyles: StylesConfig<SchoolOption> = {
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
        value={selectedOption}
        className="font-normal capitalize"
        closeMenuOnSelect={true}
        onMenuScrollToBottom={handleScroll}
        onInputChange={(val) => debouncedSearch(val)}
        options={schools}
        menuIsOpen={menuIsOpen}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          IndicatorSeparator: () => null,
          MenuList: CustomMenuList,
        }}
        onChange={(selected: any) => {
          if (selected) {
            setSelectedOption(selected);
            setSelectSchool(selected.value);
            setSchoolId(selected.id);
          }
        }}
        placeholder="Select Institute"
        styles={customStyles}
        isMulti={false}
        isLoading={loading}
      />
    </div>
  );
}

export default Institute;
