import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CustomDropdownIndicator } from "../../pages/Dashboard/Settlement/Settlement";
import Select from "react-select";
import type { SearchFilterBy } from "./Filters";
import { HiMiniXMark } from "react-icons/hi2";
export interface SearchFilterProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  searchFilterBy?: SearchFilterBy;
  onFilterByChange?: (val: string) => void;
  selectedFilter?: string;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = "Search",
  className,
  id = "search-filter-wrapper",
  searchFilterBy,
  onFilterByChange,
  selectedFilter = "",
}: SearchFilterProps) {
  const [searchValue, setSearchValue] = React.useState(value);
  const [searchFilter, setSearchFilter] = useState<any>(selectedFilter);

  useEffect(() => {
    setSearchFilter(selectedFilter || "");
  }, [selectedFilter]);

  return (
    <div
      className={
        className
          ? className
          : "bg-[#EEF1F6] relative py-3 items-center justify-between flex px-3 max-w-md w-full rounded-lg"
      }
      id={id}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        className="text-xs pr-2 flex-1 min-w-0 bg-transparent focus:outline-none placeholder:font-normal"
        id="search-input"
      />

      {searchValue !== "" && (
        <HiMiniXMark
          onClick={async () => {
            setSearchValue("");
            onChange("");
            setSearchFilter("");
            if (onFilterByChange) {
              onFilterByChange("");
            }
          }}
          className="text-[#1E1B59] cursor-pointer text-md mr-2 shrink-0"
        />
      )}

      <div className="flex items-center justify-end shrink-0">
        {searchFilterBy && Object.keys(searchFilterBy).length > 0 && (
          <Select
            className="border-l-2 border-gray-400  "
            options={searchFilterBy?.searchFilterBy as any}
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            components={{
              DropdownIndicator: CustomDropdownIndicator,
              IndicatorSeparator: () => null,
            }}
            onChange={(e: any) => {
              const nextValue = String(e?.value || "").toLowerCase();
              setSearchFilter(nextValue);
              if (onFilterByChange) {
                onFilterByChange(nextValue);
              }
            }}
            placeholder={
              <div className="text-[#1E1B59] -mt-1 text-[10px]">Filter by</div>
            }
            value={
              (searchFilterBy?.searchFilterBy?.find(
                (option) =>
                  String(option.value).toLowerCase() ===
                  String(searchFilter).toLowerCase(),
              ) as any) || null
            }
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "transparent",
                height: "20px",
                border: "none",
                boxShadow: "none",
                cursor: "pointer",
                minHeight: "10px",
                padding: "0px",
                zIndex: 9999,
              }),
              valueContainer: (provided) => ({
                ...provided,
                height: "20px",
                width: "5.25rem",
                padding: "0 4px",
                zIndex: 9999,
              }),
              input: (provided) => ({
                ...provided,
                margin: "0",
                padding: "0",
              }),
              placeholder: (provided) => ({
                ...provided,
                margin: "0",
                padding: "0",
                lineHeight: "20px",
              }),
              singleValue: (provided) => ({
                ...provided,
                fontSize: "10px",
                lineHeight: "20px",
                color: "#1E1B59",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "5.25rem",
              }),
              indicatorsContainer: (provided) => ({
                ...provided,
                height: "20px",
              }),
              option: (provided, state) => ({
                ...provided,
                fontSize: "10px",
                cursor: "pointer",
              }),
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
            }}
          />
        )}
        <div className="w-10 z-50 shrink-0 flex justify-center items-center">
          <Search
            onClick={() => {
              onChange(searchValue);
            }}
            className="cursor-pointer right-3.5 top-3 w-4 h-4 text-[#667085]"
          />
        </div>
      </div>
    </div>
  );
}
