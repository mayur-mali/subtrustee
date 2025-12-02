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
} from "../../../Qurries";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

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
    settlementData?.getSettlementReportsSubTrustee,
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
          amount={data?.getSubTrusteeSchools?.totalItems || 0}
          date={"Till date"}
          description={"Total Registered Institutes"}
        />
        <Card
          amount={(Math.floor(settledAmount * 100) / 100).toLocaleString(
            "hi-in",
          )}
          date={"Most Recent"}
          description={"Settlement amount"}
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
      </div>
    </div>
  );
}
