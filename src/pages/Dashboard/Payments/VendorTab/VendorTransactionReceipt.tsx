/* eslint-disable react/jsx-pascal-case */
import React, { useContext, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { _Table } from "../../../../components/Table";
import { useMutation, useQuery } from "@apollo/client";
import {
  // ADD_REMARK,
  // DELETE_REMARK,
  // GET_TRANSACTION_REFUND,
  // GET_TRANSACTION_REPORT,
  // GET_TRANSACTION_UTR,
  GET_SINGLE_VENDOR_TRANSACTION,
} from "../../../../Qurries";
// import Modal from "../../../../components/Modal/Modal";
// import {
//   Form,
//   Input,
//   preventNegativeValues,
//   preventPasteNegative,
// } from "edviron-ui-package";
// import refundIcon from "../../../../assets/refund.svg";
import refundIcon from "../../../../assets/a_round.svg";
import { toast } from "react-toastify";
// import ConfirmationBox from "../../../../components/ConfermationBox";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
// import { amountFormat } from "../../../../utils/amountFormat";
import { getStartAndEndOfMonth } from "../../../../utils/getStartAndEndOfMonth";
// import Aword from "../../../assets/a_round.svg";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { getBankName } from "../../../../utils/getBankName";
import { gatewayName } from "../../Transaction/Transaction";
export function PaymentSmallCard({ title, value, icon }: any) {
  return (
    <div className=" flex text-xs font-normal space-y-2 flex-col">
      <div className="flex justify-between items-center max-w-[10rem]">
        <h4 className="  text-[#767676]">{title}</h4>
        {icon && icon}
      </div>
      <h3 className=" text-[#1B163B] font-semibold capitalize">
        {value && value ? value : "NA"}
      </h3>
    </div>
  );
}

function VendorTransactionReceipt() {
  const [openRemarkModal, setOpenRemarkModal] = useState(false);
  const [openDeleteRemarkModal, setOpenDeleteRemarkModal] = useState(false);

  const [remark, setRemark] = useState("");
  const [remarkEdit, setRemarkEdit] = useState(false);
  // const { transaction, setTransaction, user } = useContext(dashboardContext);
  const [transaction, setTransaction] = useState<any>(null);
  interface StudentDetails {
    student_details: {
      student_id: string;
      student_name?: string;
      student_email?: string;
      student_phone?: string;
    };
  }

  const [studentDetail, setStudentDetail] = useState<StudentDetails | null>(
    null,
  );

  const detail = useLocation();

  const clientId = detail?.state?.collect_id;
  const amount = detail?.state?.amount;
  const schoolName = detail?.state?.schoolName;

  const { data: vendorTransactions } = useQuery(GET_SINGLE_VENDOR_TRANSACTION, {
    onCompleted(data) {
      setTransaction(data?.getSingleSubtrusteeVendorTransaction);
      setStudentDetail(
        JSON.parse(data?.getSingleSubtrusteeVendorTransaction?.additional_data),
      );
    },
    variables: {
      order_id: clientId,
    },
  });

  // const { startDate, endDate } = getStartAndEndOfMonth();
  // const [addRemark] = useMutation(ADD_REMARK, {
  //   refetchQueries: [
  //     {
  //       query: GET_TRANSACTION_REPORT,
  //       variables: {
  //         startDate: startDate,
  //         endDate: endDate,
  //       },
  //     },
  //   ],
  // });
  // const [deleteRemark, { loading: deleteRemarkLoading }] = useMutation(
  //   DELETE_REMARK,
  //   {
  //     refetchQueries: [
  //       {
  //         query: GET_TRANSACTION_REPORT,
  //         variables: {
  //           startDate: startDate,
  //           endDate: endDate,
  //         },
  //       },
  //     ],
  //   },
  // );

  const handlePrint = (elem: any) => {
    const printContents: any = document.getElementById("receipt");
    html2canvas(printContents).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "pt", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("download.pdf");
    });
  };

  if (transaction === null) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <AiOutlineLoading3Quarters className="text-2xl animate-spin" />;
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] rounded-lg mt-4 bg-[#F6F8FA] p-4">
      {/* <Modal
        title="Add Remark"
        open={openRemarkModal}
        setOpen={setOpenRemarkModal}
      >
        <div>
          <textarea
            name="remark"
            id="remark"
            onChange={(e) => {
              setRemark(e.target.value);
            }}
            className="w-full border rounded-md h-24 focus:outline-none p-4"
          ></textarea>
          <button
            disabled={!remark}
            onClick={async () => {
              const res = await addRemark({
                variables: {
                  collect_id: transaction?.orderID,
                  remark: remark,
                },
              });
              if (res.data.addRemarks) {
                toast.success(res.data.addRemarks);
                window.location.reload();
                setOpenRemarkModal(false);
              }
            }}
            className="px-4 py-1.5 rounded-lg disabled:bg-gray-200 disabled:text-edviron_black disabled:cursor-not-allowed bg-[#6687FF] text-white"
          >
            Add Remark
          </button>
        </div>
      </Modal>
      <Modal title="Edit Remark" open={remarkEdit} setOpen={setRemarkEdit}>
        <div>
          <textarea
            name="remark"
            defaultValue={transaction?.remarks}
            onChange={(e) => {
              setRemark(e.target.value);
            }}
            className="w-full border rounded-md h-24 focus:outline-none p-4"
          ></textarea>
          <button
            disabled={!remark}
            onClick={async () => {
              const res = await addRemark({
                variables: {
                  collect_id: transaction?.orderID,
                  remark: remark,
                },
              });
              if (res.data.addRemarks) {
                toast.success(res.data.addRemarks);
                window.location.reload();
                setRemarkEdit(false);
              }
            }}
            className="px-4 py-1.5 rounded-lg disabled:bg-gray-200 disabled:text-edviron_black disabled:cursor-not-allowed bg-[#6687FF] text-white"
          >
            Edit Remark
          </button>
        </div>
      </Modal>
      <Modal open={openDeleteRemarkModal} setOpen={setOpenDeleteRemarkModal}>
        <ConfirmationBox
          loading={deleteRemarkLoading}
          closeOnSuccess={false}
          setOpen={setOpenDeleteRemarkModal}
          funtion={async () => {
            const res = await deleteRemark({
              variables: {
                collect_id: transaction?.orderID,
              },
            });
            if (res.data.deleteRemark) {
              toast.success(res.data.deleteRemark);
              window.location.reload();
            }
          }}
          confirmationText="Delete Remark"
          ButtonText="Delete Remark"
        />
      </Modal> */}
      {/* <Modal
        open={openInitiateRefundModal}
        setOpen={setOpenInitiateRefundModal}
      >
        <Form
          onSubmit={async (data: any) => {
            const orderId = transaction.orderID.toString();
            const res = await initiateRefund({
              variables: {
                order_id: orderId,
                refund_amount: parseFloat(data["Refund Amount"]),
                refund_note: data["Refund Note"],
              },
            });
            setOpenInitiateRefundModal(false);
            if (res?.data) {
              toast.success(res.data?.initiateRefund);
            }
          }}
        >
          <Input
            type="text"
            name="Refund Note"
            placeholder="Enter Refund Note"
            add_error={() => {}}
            required
          />
          <Input
            type="number"
            name="Refund Amount"
            add_error={() => {}}
            placeholder="Enter Refund Amount"
            onKeyDown={preventNegativeValues}
            onPaste={preventPasteNegative}
            min={0}
            max={transaction?.orderAmount}
            required
          />
          <div className="mt-2 mb-2 text-center">
            <button className="py-2 px-16 max-w-[15rem] w-full rounded-lg disabled:bg-blue-300 bg-[#6F6AF8] text-white">
              Initiate
            </button>
          </div>
        </Form>
      </Modal> */}
      <div className="flex justify-between items-center">
        <h3 className="flex items-center text-lg font-semibold text-[#1B163B]">
          <Link to="/payments">
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
          Transaction Receipt
        </h3>
        <div className="flex gap-x-4 items-center">
          {!transaction?.remarks ? (
            <button
              className="px-4 py-1.5 text-sm  rounded-md border-2 text-[#1B163B] border-[#6687FF] "
              onClick={() => setOpenRemarkModal(true)}
            >
              Add Remark
            </button>
          ) : (
            <button
              disabled={!transaction?.remarks}
              onClick={() => {
                setOpenDeleteRemarkModal(true);
              }}
              className="px-4 py-1.5 text-sm  rounded-md border-2 text-[#1B163B] border-[#6687FF] "
            >
              Remark Delete
            </button>
          )}
          <button
            className="px-4 py-1.5 flex text-sm items-center gap-x-2 rounded-md bg-[#6687FF] text-white"
            onClick={() => handlePrint("receipt")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
              />
            </svg>
            Print
          </button>
          {/* <button
            className="px-4 py-1.5 flex text-sm items-center gap-x-2 rounded-md bg-[#6687FF] text-white"
            onClick={() => {
              setOpenInitiateRefundModal(true);
            }}
          >
            <img src={refundIcon} alt="" className="w-6 h-6" />
            Initiate Refund
          </button> */}
        </div>
      </div>
      <div id="receipt" className="p-4">
        <p className=" my-4 text-base text-[#767676] font-medium">
          Payment details
        </p>
        <div className="overflow-hidden border border-[#E7EDFB] rounded-lg">
          <div className=" bg-[#6687FF1A] border-b border-[#A9B2CF] flex items-center px-8 py-4">
            <div className="flex items-center gap-x-10">
              <p className=" text-[#1B163B] font-semibold text-sm">
                Order ID:{" "}
                <span className=" font-normal ml-2">
                  {transaction?._id ? transaction?._id : transaction?._id}
                </span>
              </p>
              <p className=" text-[#1B163B] font-semibold text-sm">
                Order Amount:{" "}
                <span className=" font-normal ml-2"> ₹{amount}</span>
              </p>
              <p className=" text-[#1B163B] font-semibold text-sm">
                Status:
                <span
                  className={`capitalize font-normal ml-2 ${
                    transaction?.status === "SUCCESS"
                      ? "text-[#04B521]"
                      : transaction?.status?.toLowerCase() === "failure" ||
                          transaction?.status?.toLowerCase() === "failed" ||
                          transaction?.status === "USER_DROPPED"
                        ? "text-[#E54F2F]"
                        : transaction?.status?.toLowerCase() === "pending"
                          ? "text-yellow-400"
                          : ""
                  }`}
                >
                  {transaction?.status}
                </span>
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-[#1B163B] text-xs font-normal">
                {new Date(transaction?.createdAt).toLocaleString("hi")}
              </span>
            </div>
          </div>
          <div className="p-8 grid grid-cols-4 w-3/4 gap-6">
            <PaymentSmallCard
              title="Payment method"
              value={transaction?.payment_method}
            />
            <PaymentSmallCard title="Transaction amount" value={`₹${amount}`} />
            <PaymentSmallCard
              icon={
                transaction?.remarks && (
                  <FaRegEdit
                    onClick={() => {
                      setRemarkEdit(true);
                    }}
                    size={12}
                    className="text-[#717171] cursor-pointer"
                  />
                )
              }
              title="Remarks"
              value={transaction?.remarks}
            />

            {/* <PaymentSmallCard title="Payment Gateway" value="NA" /> */}
            <PaymentSmallCard
              title={
                transaction?.payment_method === "Net Banking"
                  ? "Bank"
                  : transaction?.payment_method === "UPI"
                    ? "UPI ID"
                    : transaction?.payment_method === "Wallet"
                      ? "Provider"
                      : "Bank"
              }
              value={getBankName(transaction)}
            />
            <PaymentSmallCard
              title="Payment Gateway"
              value={
                transaction?.gateway
                  ? gatewayName[transaction.gateway as keyof typeof gatewayName]
                  : "NA"
              }
            />
            <PaymentSmallCard title="Processing fee" value="NA" />

            <PaymentSmallCard
              title="Bank reference number"
              value={
                transaction?.bank_reference &&
                transaction?.bank_reference === "0"
                  ? "NA"
                  : transaction?.bank_reference
              }
            />
            <PaymentSmallCard title="Currency" value="INR" />
            <PaymentSmallCard
              title="Edviron Order ID"
              value={transaction?.collect_id}
            />
            <PaymentSmallCard
              title="Vendor Order ID"
              value={
                transaction?.custom_order_id
                  ? transaction?.custom_order_id
                  : "NA"
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8">
          <div className="col-span-1">
            <p className=" my-4 text-base text-[#767676] font-medium">
              User details
            </p>
            <div className="p-8 border border-[#E7EDFB] rounded-lg grid grid-cols-2 gap-6">
              <PaymentSmallCard
                title="Student name"
                value={studentDetail?.student_details?.student_name || "NA"}
              />
              <PaymentSmallCard
                title="Student Enrollment ID"
                value={studentDetail?.student_details?.student_id || "NA"}
              />
              <PaymentSmallCard
                title="Email"
                value={studentDetail?.student_details?.student_email || "NA"}
              />
              <PaymentSmallCard title="Institute Name" value={schoolName} />
              <PaymentSmallCard
                title="Phone number"
                value={studentDetail?.student_details?.student_phone || "NA"}
              />

              <PaymentSmallCard
                title="Institute ID"
                value={transaction?.school_id}
              />
            </div>
          </div>
          <div className="col-span-1 relative">
            <p className=" my-4 text-base text-[#767676] font-medium">
              Additional details
            </p>
            <div className="p-8 border border-[#E7EDFB] h-[80%] rounded-lg grid grid-cols-2 gap-6">
              NA
            </div>
          </div>
          {/* {transactionRefundsRequest?.getRefundRequest?.length > 0 && (
            <div className="col-span-2">
              <p className=" my-4 text-base text-[#767676] font-medium">
                Refund details
              </p>

              <_Table
                boxPadding=" 0"
                minHeight={" h-auto"}
                data={[
                  ["Sr.No", "Refund ID", "Amount", "Status", "Date"],
                  ...transactionRefundsRequest?.getRefundRequest?.map(
                    (d: any, index: number) => [
                      index + 1,
                      d?._id ? d?._id : "-",
                      d?.refund_amount,
                      d?.status,
                      <div className="">
                        {new Date(Number(d?.createdAt)).toLocaleString("hi")}
                      </div>,

                      // <div>
                      //   {d?.status === "INITIATED" ? (
                      //     <AiTwotoneDelete
                      //       onClick={() => {
                      //         setDeleteRefundRequest(true);
                      //         setRefundId(d?._id);
                      //       }}
                      //       className="text-[#717171] text-xl cursor-pointer"
                      //     />
                      //   ) : (
                      //     "-"
                      //   )}
                      // </div>,
                    ],
                  ),
                ]}
              />
            </div>
          )} */}
        </div>

        {/* TODO LATER */}

        {/* <div className="grid grid-cols-3 gap-x-8">
          <div className="col-span-3">
            <p className=" my-4 text-base text-[#767676] font-medium">
              Settlement details
            </p>
            <div className="p-8 border rounded-lg w-full">payment_method
              <div className=" grid grid-cols-3 w-3/4 gap-6">
                <PaymentSmallCard
                  title="Settlement date & time"
                  value={
                    utrData?.transactionUtr?.settlement_date &&
                    new Date(
                      utrData?.transactionUtr?.settlement_date,
                    ).toLocaleString("hi")
                  }
                />
                <PaymentSmallCard
                  title="Status"
                  value={utrData?.transactionUtr.status}
                />
                <PaymentSmallCard
                  title="UTR number"
                  value={utrData?.transactionUtr.utr_number}
                />
              </div>
            </div>
          </div>
        </div> */}
      </div>
      {transaction?.vendors_info?.length > 0 ? (
        <div>
          <p className="m-4 text-base text-[#767676] font-medium">
            Vendor details
          </p>
          <_Table
            minHeight=" min-h-0"
            boxPadding=" p-0"
            copyRight={false}
            data={[
              ["Sr.No", "Vendor Name", "Vendor ID", "Amount"],
              ...transaction?.vendors_info.map((d: any, i: number) => [
                <div>{i + 1}</div>,
                <div>{d?.name}</div>,
                <div>{d?.vendor_id}</div>,
                // <div>
                //   {d?.amount
                //     ? amountFormat(d?.amount)
                //     : amountFormat(
                //         (transaction.orderAmount * d?.percentage) / 100,
                //       )}
                // </div>,
              ]),
            ]}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default VendorTransactionReceipt;
