import React from "react";
import { GET_SCHOOLS } from "../../../../Qurries";
import { useQuery } from "@apollo/client";
import { PaymentSmallCard } from "../../Transaction/TransactionReceipt";
import { Link } from "react-router-dom";

export default function SchoolDetails({ school }: { school: any }) {
  return (
    <div>
      <div className="px-5 overflow-hidden border border-gray-300 rounded-md p-4 my-4">
        <div className="grid  lg:!grid-cols-4 grid-cols-2 gap-2">
          <div className=" col-span-1">
            <PaymentSmallCard
              title="Institute Name"
              value={school?.school_name}
            />
          </div>
          <div className=" col-span-1">
            <PaymentSmallCard title="Institute ID" value={school?.school_id} />
          </div>
          <div className=" col-span-1">
            <PaymentSmallCard
              title="Institute Email ID"
              value={<span className=" lowercase">{school?.email}</span>}
            />
          </div>
          <div className=" col-span-1">
            <PaymentSmallCard title="Phone No." value={school?.phone_number} />
          </div>
          <div className=" col-span-1">
            <PaymentSmallCard
              title="Account Holder Name"
              value={school?.bank_details?.account_holder_name}
            />
          </div>
          <div className=" col-span-1">
            <PaymentSmallCard
              title="Account Number"
              value={school?.bank_details?.account_number}
            />
          </div>
          <div className=" col-span-1">
            <PaymentSmallCard
              title="IFSC Code"
              value={school?.bank_details?.ifsc_code}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
