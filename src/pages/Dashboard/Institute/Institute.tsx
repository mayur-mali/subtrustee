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
import { Link, useLocation } from "react-router-dom";
import ToolTip from "../../../components/generics/ToolTip";
import { MdContentCopy } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import React, { useState } from "react";
import { handleCopyContent } from "../../Dashboard/Dashboard";
export default function Institute() {
  const [page, setPage] = useState(1);
  // const [urlFilters, setUrlFilters] = useTransactionFilters();
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [itemsPerRow, setItemsPerRow] = useState<any>({
    name: 10,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { loading, error, data, refetch } = useQuery(GET_INSTITUTES, {
    variables: {
      page: currentPage,
      limit: itemsPerRow.name,
      searchQuery: searchQuery,
      //kycStatus: kycStatus.length > 0 ? kycStatus : [],
    },
  });
  const schools = data?.getSubTrusteeSchools?.schools || [];
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  const [logInToMerchant] = useMutation(LOGIN_TO_MERCHANT_WITH_TRUSTEE);

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
              <div className="bg-[#EEF1F6] py-3 items-center flex  px-6 max-w-md w-full rounded-lg">
                <IoSearchOutline className=" cursor-pointer text-edvion_black/50 text-md " />
                <input
                  onChange={(e) => {
                    if (debounceTimeoutRef.current)
                      clearTimeout(debounceTimeoutRef.current);
                    debounceTimeoutRef.current = setTimeout(() => {
                      refetch({
                        page: currentPage,
                        limit: itemsPerRow.name,
                        searchQuery: e.target.value,
                      });
                      setCurrentPage(1);
                      setSearchQuery(e.target.value);
                    }, 1000);
                  }}
                  type="text"
                  placeholder="Search (Institute Name, Email ID...)"
                  className="ml-4 text-xs focus:outline-none w-full placeholder:font-normal bg-[#EEF1F6]"
                />
              </div>
              <div className="flex ">
                {/* <SchoolsUploadViaCsv page={page} /> */}
                <button
                  //onClick={() => setShowModal(!showModal)}
                  className="py-2 bg-edviron_black text-sm rounded-[4px] text-white float-right px-6 ml-2"
                >
                  + Add Institute
                </button>
              </div>
            </div>
            {/* {kycStatus.length > 0 && (
                <div className=" text-sm m-2 flex items-center space-x-1 max-w-fit ">
                  {kycStatus.map((status) => {
                    return (
                      <button
                        // onClick={() => {
                        //   setKycStatus(kycStatus.filter((d) => d !== status));
                        // }}
                        className="bg-[#6687FFCC] font-medium flex items-center rounded-lg text-white px-4 py-2 h-full max-w-fit"
                      >
                        {status}
                        <HiMiniXMark className=" text-lg ml-1" />
                      </button>
                    );
                  })}
                </div>
              )} */}
            <div className="mt-3">
              <RowsPerPageSelect
                setItemsPerRow={(e: any) => {
                  setCurrentPage(1);
                  setItemsPerRow(e);
                  // setUrlFilters({
                  //   ...urlFilters,
                  //   limit: e.name,
                  // });
                }}
                itemsPerRow={itemsPerRow}
                className=" justify-start"
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
              <button
                onClick={() => {
                  handleCopyContent(school.school_id);
                }}
              >
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
              // onClick={() => {
              //   setSendKycLinkConfirmationModal(true);
              //   setSchoolDetails({
              //     school_name: school.school_name,
              //     school_id: school.school_id,
              //   });
              // }}
            >
              Resend Email
            </button>,
            <>
              {school.pg_key ? (
                <div className="flex justify-between gap-x-2 items-center">
                  <p className="bg-[#EEF1F6] truncate w-full py-1.5 px-4 rounded-[4px]">
                    {school.pg_key}
                  </p>
                  <button
                  // onClick={() => {
                  //   handleCopyContent(school.pg_key);
                  // }}
                  >
                    {/* <ToolTip text="Copy PG KEY">
                          <MdContentCopy
                            className="cursor-pointer text-[#717171] shrink-0 text-xl"
                            style={{
                              fontSize: "22px",
                              color: "",
                              backgroundColor: "transparent",
                            }}
                          />
                        </ToolTip> */}
                  </button>
                </div>
              ) : (
                <p className="bg-gray-100  py-1.5 px-4 rounded-[4px]">
                  PG key is not enabled
                </p>
              )}
            </>,
            <button
              disabled={school.pg_key}
              className="px-4 py-2 border disabled:border-gray-400 disabled:text-gray-400 border-edviron_black text-[#6687FF] font-normal rounded-[4px]"
              // onClick={() => {
              //   handleKYCDashboard(school.school_id);
              // }}
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
        // footer={
        //   <div className="flex justify-center items-center">
        //     <Pagination
        //       currentPage={currentPage}
        //       totalPages={Math.ceil(data?.getSchoolQuery?.total_pages)}
        //       onPageChange={handlePageChange}
        //     />
        //   </div>
        // }
      />
    </div>
  );
}
