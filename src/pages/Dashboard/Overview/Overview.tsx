import { useQuery } from "@apollo/client";
import Card from "../../../components/Card/Card";
import LineGraph from "../../../components/Graph/LineGraph";
import { getStartAndEndOfMonth } from "../../../utils/getStartAndEndOfMonth";
import {
  getRecentTransactions,
  getSettlementAmount,
  sumTransactionAmountOfToday,
} from "./Helper/filterData";
import { useContext, useEffect, useState } from "react";
import {
  GET_BATCH_TRANSACTION,
  GET_INSTITUTES,
  GET_SETTLEMENT_REPORTS,
  GET_TRANSACTIONS,
  GET_ACTIVE_MERCHANT_COUNT,
} from "../../../Qurries";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import ToolTip from "../../../components/generics/ToolTip";
import { _Table } from "../../../components/Table";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { MdContentCopy } from "react-icons/md";

const handleCopyContent = (content: any) => {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch((err) => {
      toast.error("Error while copying");
    });
};

export default function Overview() {
  const { startDate, endDate, currentDate } = getStartAndEndOfMonth();
  const { data: settlementData } = useQuery(GET_SETTLEMENT_REPORTS);
  const { user, logout } = useAuth();
  const [transactionAmountDetails, setTransactionAmountDetails] =
    useState<any>(null);
  const [year, setYear] = useState({
    name: new Date().getFullYear().toString(),
  });
  const [schoolLength, setSchoolLength] = useState(0);
  const settledAmount = getSettlementAmount(
    settlementData?.getSettlementReportsSubTrustee?.data,
  );
  const {
    data: transactionReport,
    loading: transactionReportLoading,
    refetch,
  } = useQuery(GET_BATCH_TRANSACTION, {
    variables: {
      year: year?.name,
    },
  });
  const { data, loading } = useQuery(GET_INSTITUTES, {
    variables: { page: 1, limit: 1000, searchQuery: "" },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!data?.getSubTrusteeSchools?.schools?.length) return;

    const schoolIds = data.getSubTrusteeSchools.schools.map((e) => e.school_id);

    const GET_TRANSACTION_AMOUNT = async (
      start_date: String,
      end_date: String,
      trustee_id: String,
      school_id: [String],
      status: String,
    ) => {
      const res = await axios.get(
        `${import.meta.env.VITE_PAYMENT_BACKEND_URL}/edviron-pg/get-transaction-report-batched?start_date=${start_date}&end_date=${end_date}&trustee_id=${trustee_id}&school_id=${school_id}&status=${status}`,
      );
      setTransactionAmountDetails(res.data.transactions[0]);
      setSchoolLength(schoolIds.length || 0);
    };

    GET_TRANSACTION_AMOUNT(
      currentDate,
      currentDate,
      user?.trustee_id || "",
      schoolIds,
      "SUCCESS",
    );
  }, [data, user, currentDate]);

  const { data: recentTransaction, loading: recentLoading } = useQuery(
    GET_TRANSACTIONS,
    {
      variables: {
        startDate: startDate,
        endDate: endDate,
        limit: "100",
      },
    },
  );
  const recentTransactions = getRecentTransactions(
    recentTransaction?.getSubtrusteeTransactionReport?.transactionReport,
  );
  const { data: activeMerchantCount, loading: activeMerchantLoading } =
    useQuery(GET_ACTIVE_MERCHANT_COUNT);

  return (
    <div className="mt-8">
      <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-4">
        <Card
          amount={
            transactionAmountDetails?.totalTransactionAmount?.toLocaleString(
              "hi-in",
            ) || 0
          }
          date={"Today"}
          description={"Transaction Amount"}
        />
        <Card
          amount={transactionAmountDetails?.totalTransactions || 0}
          date={"Today"}
          description={"Number of transaction"}
        />

        <Card
          amount={(Math.floor(settledAmount * 100) / 100).toLocaleString(
            "hi-in",
          )}
          date={"Most Recent"}
          description={"Settlement amount"}
        />
        <Card
          amount={data?.getSubTrusteeSchools?.totalItems || 0}
          date={"Till date"}
          description={"Total Registered Institutes"}
        />
        <Card
          amount={
            activeMerchantCount?.getActiveMerchantCountForSubTrustee
              ?.activeMerchantCount || 0
          }
          date={"Till date"}
          description={"Live institutes"}
        />
      </div>
      <div
        style={{ gridTemplateRows: "max-content" }}
        className="grid grid-cols-3  grid-rows-2 gap-4 mb-4"
      >
        <div className=" xl:col-span-2 order-1 col-span-3 ">
          <LineGraph
            dataArray={transactionReport?.getSubtrusteeBatchTransactionReport}
            setYear={setYear}
            year={year}
            refetch={refetch}
          />
        </div>
        <div className=" xl:col-span-1 xl:order-2 order-3 col-span-3 lg:row-span-2">
          {recentTransactions ? (
            <_Table
              perPage={false}
              exportBtn={false}
              bgColor={" bg-transparent"}
              boxPadding={" p-0"}
              copyRight={false}
              loading={recentLoading}
              description={
                <div className="flex w-full justify-between text-xs pl-4 pr-1">
                  <p className="">Recent transactions</p>
                  <NavLink
                    to="/payments"
                    className="text-[#6687FF] cursor-pointer"
                  >
                    View all
                  </NavLink>
                </div>
              }
              data={[
                ["Date", "Order ID", "Amount"],
                ...recentTransactions?.map((row: any, index: number) => [
                  <div className=" max-w-[5rem]" key={row?.orderID}>
                    {new Date(row?.createdAt).toLocaleString("hi")}
                  </div>,

                  <div className="flex justify-between items-center">
                    <div
                      className="truncate max-w-[7.5rem]"
                      title={row?.collect_id}
                    >
                      {row?.collect_id}
                    </div>
                    <button
                      onClick={() => {
                        handleCopyContent(row?.collect_id);
                      }}
                    >
                      <ToolTip text="Copy Order ID">
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
                  <div
                    key={row?.collect_id}
                  >{`₹${row?.transaction_amount !== null ? (Math.floor(row?.transaction_amount * 100) / 100).toLocaleString("hi-in") : 0}`}</div>,
                ]),
              ]}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
