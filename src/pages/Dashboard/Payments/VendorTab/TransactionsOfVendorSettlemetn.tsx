import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GET_SUBTRUSTEE_TRANSACTIONS_OF_VENDOR_SETTLEMENT } from "../../../../Qurries";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { _Table, RowsPerPageSelect } from "../../../../components/Table";
import { amountFormat } from "../../../../utils/amountFormat";
import { getNormalizeObjectsArray } from "../../../../utils/getnormalizeObjectsArray";

function TransactionsOfVendorSettlemetn() {
  let { state } = useLocation();

  const [currentCursor, setCurrentCursor] = useState<any>([""]);
  const [nextCursor, setNextCursor] = useState<any>("");
  const [itemsPerRow, setItemsPerRow] = useState({ name: 10 });
  const [refetchLoading, setRefetchLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [ButtonDisable, setButtonDisable] = useState(false);
  const [additionalData, setAdditionalData] = useState<any>([
    { column: [""], values: [] },
  ]);
  const { data, loading, refetch } = useQuery(
    GET_SUBTRUSTEE_TRANSACTIONS_OF_VENDOR_SETTLEMENT,
    {
      variables: {
        utr: state?.utrno,
        cursor: "",
        limit: itemsPerRow.name,
        skip: skip,
      },
    },
  );
  useEffect(() => {
    if (
      data?.getSubtrusteeVendorSettlementsTransactions?.cursor &&
      nextCursor !== data?.getSubtrusteeVendorSettlementsTransactions?.cursor &&
      data?.getSubtrusteeVendorSettlementsTransactions?.cursor !== null
    ) {
      setNextCursor(data?.getSubtrusteeVendorSettlementsTransactions?.cursor);
    }
    if (
      data?.getSubtrusteeVendorSettlementsTransactions
        ?.settlements_transactions &&
      data?.getSubtrusteeVendorSettlementsTransactions?.settlements_transactions
        .length > 0
    ) {
      setAdditionalData(
        getNormalizeObjectsArray(
          data?.getSubtrusteeVendorSettlementsTransactions?.settlements_transactions?.map(
            (d: any) => {
              if (!d?.additional_data || d?.additional_data === "null") {
                return {};
              } else {
                return JSON.parse(d.additional_data).additional_fields;
              }
            },
          ),
        ),
      );
    }
  }, [data, nextCursor]);

  return (
    <div className="min-h-[80vh] rounded-lg mt-4 bg-[#F6F8FA] p-4">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center text-lg font-semibold text-[#1B163B]">
          <Link to="/payments/vendor-settlement">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className=" h-6 mr-2 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
          Go Back
        </h3>
      </div>
      <div>
        {loading || refetchLoading ? (
          <div className="min-h-[60vh] w-full flex justify-center items-center">
            <AiOutlineLoading3Quarters className=" animate-spin text-xl" />
          </div>
        ) : (
          <_Table
            perPage={false}
            heading="Transactions Of Settlement"
            exportBtn={true}
            searchBox={
              <div>
                <RowsPerPageSelect
                  setItemsPerRow={setItemsPerRow}
                  itemsPerRow={itemsPerRow}
                  className=" justify-start"
                />
              </div>
            }
            copyContent={[4]}
            data={[
              [
                "Sr.No",
                "Institute Name",
                "Date & Time",
                "Order ID",
                "Payment ID",
                "Order Amt",
                "Transaction Amt",
                "Payment Method",
                "Status",
                "Student Name",
                "Student ID",
                "Phone No.",
                "Settlement Date",
                ...(additionalData?.column ? additionalData?.column : []),
              ],

              ...(data?.getSubtrusteeVendorSettlementsTransactions?.settlements_transactions.map(
                (transaction: any, index: number) => [
                  <div>{skip + index + 1}</div>,
                  <div>{transaction.school_name}</div>,
                  <div>
                    {new Date(transaction?.event_time).toLocaleString("hi")}
                  </div>,
                  <div>
                    {transaction.custom_order_id
                      ? transaction.custom_order_id
                      : transaction.order_id}
                  </div>,
                  <div>
                    {transaction.payment_id ? transaction.payment_id : "N/A"}
                  </div>,
                  <div>{amountFormat(transaction?.order_amount)}</div>,
                  <div>{amountFormat(transaction?.event_amount)}</div>,
                  <div>{transaction?.payment_group || "N/A"}</div>,
                  <div
                    className={
                      " " +
                      (transaction.event_status.toLowerCase() === "success" ||
                      transaction.event_status.toLowerCase() === "new"
                        ? "text-[#04B521]"
                        : "")
                    }
                  >
                    {transaction?.event_status === "NEW"
                      ? "SUCCESS"
                      : transaction?.event_status}
                  </div>,
                  <div>{transaction?.student_name}</div>,
                  <div>
                    {transaction?.student_id ? transaction?.student_id : "NA"}
                  </div>,
                  <div>{transaction?.student_phone_no}</div>,
                  <div>
                    {new Date(state.settlementDate).toLocaleString("hi") ||
                      "N/A"}
                  </div>,
                  ...Object?.values(additionalData?.values[index] || {}),
                ],
              ) || []),
            ]}
            footer={
              <div className="flex justify-between items-center my-4 px-4">
                <button
                  onClick={async () => {
                    setRefetchLoading(true);
                    if (
                      data?.getSubtrusteeVendorSettlementsTransactions
                        ?.cursor === "N/A"
                    ) {
                      const updatedSkip = Math.max(0, skip - itemsPerRow.name);
                      setSkip(updatedSkip);
                      const res = await refetch({
                        utr: state?.utrno,
                        limit: itemsPerRow.name,
                        skip: skip,
                      });

                      if (res?.data) {
                        setRefetchLoading(false);
                      }
                    } else {
                      if (currentCursor.length > 0) {
                        const newArray = currentCursor.slice(0, -1);
                        setCurrentCursor(newArray);
                      }
                      const res = await refetch({
                        utr: state?.utrno,
                        cursor: currentCursor[currentCursor.length - 2],
                        limit: itemsPerRow.name,
                      });
                      if (res?.data) {
                        setRefetchLoading(false);
                      }
                    }
                  }}
                  disabled={
                    (currentCursor.length < 2 && skip === 0) || ButtonDisable
                  }
                  className="px-4 py-1.5 text-sm rounded-lg disabled:bg-gray-400 bg-blue-600 text-white"
                >
                  Prev
                </button>

                <button
                  onClick={async () => {
                    setRefetchLoading(true);
                    if (
                      data?.getSubtrusteeVendorSettlementsTransactions
                        ?.cursor !== null &&
                      data?.getSubtrusteeVendorSettlementsTransactions
                        ?.cursor !== "N/A"
                    ) {
                      setCurrentCursor((prev: any) => [...prev, nextCursor]);
                      const res = await refetch({
                        utr: state?.utrno,
                        cursor: nextCursor,
                        limit: itemsPerRow.name,
                      });

                      if (res?.data) {
                        setRefetchLoading(false);
                      }
                    } else {
                      const updatedSkip = skip + itemsPerRow.name;
                      setSkip(updatedSkip);
                      const res = await refetch({
                        utr: state?.utrno,
                        limit: itemsPerRow.name,
                        skip: updatedSkip,
                      });
                      if (res?.data) {
                        setRefetchLoading(false);
                      }
                      if (res?.errors) {
                        await refetch({
                          utr: state?.utrno,
                          limit: itemsPerRow.name,
                          skip: updatedSkip - itemsPerRow.name,
                        });
                        setSkip(updatedSkip - itemsPerRow.name);
                        setButtonDisable(true);
                        setRefetchLoading(false);
                      }
                    }
                  }}
                  disabled={
                    data?.getSubtrusteeVendorSettlementsTransactions?.cursor ===
                      null ||
                    (data?.getSubtrusteeVendorSettlementsTransactions
                      ?.cursor === "N/A" &&
                      data?.getSubtrusteeVendorSettlementsTransactions
                        ?.settlements_transactions?.length <
                        itemsPerRow.name - itemsPerRow.name * skip) ||
                    ButtonDisable
                  }
                  className="px-4 py-1.5 text-sm rounded-lg disabled:bg-gray-400 bg-blue-600 text-white"
                >
                  Next
                </button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default TransactionsOfVendorSettlemetn;
