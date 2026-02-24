import { useMutation, useQuery } from "@apollo/client";
import {
  GET_INSTITUTES,
  LOGIN_TO_MERCHANT_WITH_TRUSTEE,
} from "../../../Qurries";
import {
  Pagination,
  RowsPerPageSelect,
  Table,
} from "../../../components/Table/Table";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import ToolTip from "../../../components/generics/ToolTip";
import { MdContentCopy } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { HiMiniXMark } from "react-icons/hi2"; // <-- import for clear button
import React, { useState } from "react";
import Vendor from "../components/school/Vendor";

export default function Institute() {
  return (
    <Routes>
      <Route index element={<InstituteList />} />
      <Route path="vendor" element={<Vendor />} />
    </Routes>
  );
}

function InstituteList() {
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [itemsPerRow, setItemsPerRow] = useState<any>({
    name: 10,
  });

  // Search states: input field value vs actual search term used in query
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const location = useLocation();
  const { loading, error, data, refetch } = useQuery(GET_INSTITUTES, {
    variables: {
      page: currentPage,
      limit: itemsPerRow.name,
      searchQuery: activeSearch, // use activeSearch, not searchInput
    },
  });
  const schools = data?.getSubTrusteeSchools?.schools || [];

  const [logInToMerchant] = useMutation(LOGIN_TO_MERCHANT_WITH_TRUSTEE);

  // Trigger search manually
  const performSearch = () => {
    setActiveSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Table
        exportBtn={true}
        perPage={false}
        heading={"Institute List"}
        srNo={false}
        pagination={false}
        loading={loading}
        filter={[]}
        searchBox={
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center mt-2 gap-x-2 w-full">
              {/* Search input with clear and search button */}
              <div className="flex items-center gap-2 w-full max-w-md">
                <div className="bg-[#EEF1F6] py-3 items-center flex px-6 w-full rounded-lg">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search (Institute Name, Email ID...)"
                    className="text-xs focus:outline-none w-full placeholder:font-normal bg-[#EEF1F6]"
                  />
                  {searchInput && (
                    <HiMiniXMark
                      onClick={() => {
                        setSearchInput("");
                        setActiveSearch(""); // clear search
                        setCurrentPage(1);
                      }}
                      className="text-[#1E1B59] cursor-pointer text-md ml-2 shrink-0"
                    />
                  )}
                  <div className="w-10 z-50 shrink-0 flex justify-center items-center">
                    <IoSearchOutline
                      onClick={performSearch}
                      className="cursor-pointer text-edvion_black text-opacity-50 text-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex">
                <button className="py-2 bg-edviron_black text-sm rounded-[4px] text-white float-right px-6 ml-2">
                  + Add Institute
                </button>
              </div>
            </div>

            {/* (Optional filter chips area – currently commented) */}

            <div className="mt-3">
              <RowsPerPageSelect
                setItemsPerRow={(e: any) => {
                  setCurrentPage(1);
                  setItemsPerRow(e);
                }}
                itemsPerRow={itemsPerRow}
                className="justify-start"
              />
            </div>
          </div>
        }
        data={[
          [
            "S.No.",
            "Institute Name",
            "Email",
            "KYC Status",
            "Action",
            "PG Key",
            "KYC Dashboard",
            "Merchant Dashboard",
          ],
          ...schools?.map((school: any, index: number) => [
            <div className="ml-4">
              {(data.getSubTrusteeSchools.page - 1) * itemsPerRow.name +
                index +
                1}
            </div>,
            <div
              className="flex justify-between items-center"
              key={school.school_id}
            >
              <Link
                to="vendor"
                state={{ schoolId: school.school_id, school: school }}
              >
                <ToolTip text={school.school_name}>
                  <div className="w-full truncate">{school.school_name}</div>
                </ToolTip>
              </Link>
              <button>
                <ToolTip text="Copy Institute ID">
                  <MdContentCopy
                    className="cursor-pointer text-[#717171] shrink-0 text-xl"
                    style={{
                      fontSize: "22px",
                      color: "",
                      backgroundColor: "transparent",
                    }}
                  />
                </ToolTip>
              </button>
            </div>,
            <div className="truncate" title={school.email}>
              {school.email ? school.email : "NA"}
            </div>,
            <div className="truncate">
              {" "}
              {school.merchantStatus ? school.merchantStatus : "NA"}
            </div>,
            <button
              disabled={school.pg_key}
              className="px-4 py-2 border disabled:border-gray-400 disabled:text-gray-400 border-edviron_black text-[#6687FF] font-normal rounded-[4px]"
            >
              Resend Email
            </button>,
            <>
              {school.pg_key ? (
                <div className="flex justify-between gap-x-2 items-center">
                  <p className="bg-[#EEF1F6] truncate w-full py-1.5 px-4 rounded-[4px]">
                    {school.pg_key}
                  </p>
                  <button>{/* Copy button placeholder */}</button>
                </div>
              ) : (
                <p className="bg-gray-100 py-1.5 px-4 rounded-[4px]">
                  PG key is not enabled
                </p>
              )}
            </>,
            <button
              disabled={school.pg_key}
              className="px-4 py-2 border disabled:border-gray-400 disabled:text-gray-400 border-edviron_black text-[#6687FF] font-normal rounded-[4px]"
            >
              Login to Dashboard
            </button>,
            <button
              disabled={!school.pg_key || !school.email}
              className="px-4 py-2 border cursor-pointer disabled:border-gray-400 disabled:text-gray-400 border-edviron_black text-[#6687FF] font-normal rounded-[4px]"
              onClick={async () => {
                try {
                  const res = await logInToMerchant({
                    variables: {
                      email: school.email,
                    },
                  });
                  if (res?.data?.generateMerchantLoginTokenForSubtrustee) {
                    window.open(
                      `${import.meta.env.VITE_MERCHANT_DASHBOARD_URL}/admin?token=${res?.data?.generateMerchantLoginTokenForSubtrustee}`,
                      "_blank",
                    );
                  }
                } catch (err) {
                  console.log("error", err);
                }
              }}
            >
              Login to Dashboard
            </button>,
          ]),
        ]}
      />
    </div>
  );
}
