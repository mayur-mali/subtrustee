import React from "react";
import CheckBoxComponent from "./CheckBoxComponent";
import { handleCheckboxChange } from "../../Transaction";

export function GatewayMode({ filter, setFilters }: any) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "PHONEPE", setFilters)
          }
          id={"phonepe"}
          name={"phonepe"}
          checked={filter?.PHONEPE}
        />
        <label
          htmlFor={"phonepe"}
          className={filter?.PHONEPE ? "text-black " : " text-gray-400"}
        >
          PhonePe
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange("gateway", "HDFC", setFilters)}
          id={"hdfc"}
          name={"hdfc"}
          checked={filter?.HDFC}
        />
        <label
          htmlFor={"hdfc"}
          className={filter?.HDFC ? "text-black " : " text-gray-400"}
        >
          HDFC
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_PG", setFilters)
          }
          id={"cashfree"}
          name={"cashfree"}
          checked={filter?.EDVIRON_PG}
        />
        <label
          htmlFor={"cashfree"}
          className={filter?.EDVIRON_PG ? "text-black " : " text-gray-400"}
        >
          Cashfree
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_PAY_U", setFilters)
          }
          id={"payu"}
          name={"payu"}
          checked={filter?.EDVIRON_PAY_U}
        />
        <label
          htmlFor={"payu"}
          className={filter?.EDVIRON_PAY_U ? "text-black " : " text-gray-400"}
        >
          PayU
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_CCAVENUE", setFilters)
          }
          id={"ccavenue"}
          name={"ccavenue"}
          checked={filter?.EDVIRON_CCAVENUE}
        />
        <label
          htmlFor={"ccavenue"}
          className={
            filter?.EDVIRON_CCAVENUE ? "text-black " : " text-gray-400"
          }
        >
          CCAvenue
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_EASEBUZZ", setFilters)
          }
          id={"easebuzz"}
          name={"easebuzz"}
          checked={filter?.EDVIRON_EASEBUZZ}
        />
        <label
          htmlFor={"easebuzz"}
          className={
            filter?.EDVIRON_EASEBUZZ ? "text-black " : " text-gray-400"
          }
        >
          Easebuzz
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_HDFC_RAZORPAY", setFilters)
          }
          id={"hdfc-razorpay"}
          name={"hdfc-razorpay"}
          checked={filter?.EDVIRON_HDFC_RAZORPAY}
        />
        <label
          htmlFor={"hdfc-razorpay"}
          className={
            filter?.EDVIRON_HDFC_RAZORPAY ? "text-black " : " text-gray-400"
          }
        >
          HDFC Razorpay
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "SMART_GATEWAY", setFilters)
          }
          id={"smart-gateway"}
          name={"smart-gateway"}
          checked={filter?.SMART_GATEWAY}
        />
        <label
          htmlFor={"smart-gateway"}
          className={filter?.SMART_GATEWAY ? "text-black " : " text-gray-400"}
        >
          Smart Gateway
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "PAYTM_POS", setFilters)
          }
          id={"paytm-pos"}
          name={"paytm-pos"}
          checked={filter?.PAYTM_POS}
        />
        <label
          htmlFor={"paytm-pos"}
          className={filter?.PAYTM_POS ? "text-black " : " text-gray-400"}
        >
          Paytm POS
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "MOSAMBEE_POS", setFilters)
          }
          id={"mosambee-pos"}
          name={"mosambee-pos"}
          checked={filter?.MOSAMBEE_POS}
        />
        <label
          htmlFor={"mosambee-pos"}
          className={filter?.MOSAMBEE_POS ? "text-black " : " text-gray-400"}
        >
          Mosambee POS
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_NTTDATA", setFilters)
          }
          id={"nttdata"}
          name={"nttdata"}
          checked={filter?.EDVIRON_NTTDATA}
        />
        <label
          htmlFor={"nttdata"}
          className={filter?.EDVIRON_NTTDATA ? "text-black " : " text-gray-400"}
        >
          NTT Data
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_WORLDLINE", setFilters)
          }
          id={"worldline"}
          name={"worldline"}
          checked={filter?.EDVIRON_WORLDLINE}
        />
        <label
          htmlFor={"worldline"}
          className={
            filter?.EDVIRON_WORLDLINE ? "text-black " : " text-gray-400"
          }
        >
          Worldline
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_RAZORPAY", setFilters)
          }
          id={"razorpay"}
          name={"razorpay"}
          checked={filter?.EDVIRON_RAZORPAY}
        />
        <label
          htmlFor={"razorpay"}
          className={
            filter?.EDVIRON_RAZORPAY ? "text-black " : " text-gray-400"
          }
        >
          RazorPay
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange(
              "gateway",
              "EDVIRON_RAZORPAY_SEAMLESS",
              setFilters,
            )
          }
          id={"razorpay-seamless"}
          name={"razorpay-seamless"}
          checked={filter?.EDVIRON_RAZORPAY_SEAMLESS}
        />
        <label
          htmlFor={"razorpay-seamless"}
          className={
            filter?.EDVIRON_RAZORPAY_SEAMLESS ? "text-black " : " text-gray-400"
          }
        >
          Razorpay Seamless
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_GATEPAY", setFilters)
          }
          id={"gatepay"}
          name={"gatepay"}
          checked={filter?.EDVIRON_GATEPAY}
        />
        <label
          htmlFor={"gatepay"}
          className={filter?.EDVIRON_GATEPAY ? "text-black " : " text-gray-400"}
        >
          Gatepay
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("gateway", "EDVIRON_PAY", setFilters)
          }
          id={"edviron-pay"}
          name={"edviron-pay"}
          checked={filter?.EDVIRON_PAY}
        />
        <label
          htmlFor={"edviron-pay"}
          className={filter?.EDVIRON_PAY ? "text-black " : " text-gray-400"}
        >
          Edviron Pay
        </label>
      </div>
    </div>
  );
}

function Mode({ setSelectedItem, selectedItems, filter, setFilters }: any) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "upi", setFilters)
          }
          id={"upi"}
          name={"upi"}
          checked={filter.upi}
          disabled={filter.qr}
        />
        <label
          htmlFor={"upi"}
          className={filter.upi ? "text-black " : " text-gray-400"}
        >
          Upi
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange("paymentMode", "qr", setFilters)}
          id={"qr"}
          name={"qr"}
          checked={filter.qr}
        />
        <label
          htmlFor={"qr"}
          className={filter.qr ? "text-black " : " text-gray-400"}
        >
          Dynamic QR Code
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "credit_card", setFilters)
          }
          id={"creditcard"}
          name={"creditcard"}
          disabled={filter.qr}
          checked={filter.credit_card}
        />
        <label
          htmlFor={"creditcard"}
          className={filter.credit_card ? "text-black " : " text-gray-400"}
        >
          Credit Card
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "credit_card_emi", setFilters)
          }
          id={"creditcardemi"}
          name={"creditcardemi"}
          disabled={filter.qr}
          checked={filter.credit_card_emi}
        />
        <label
          htmlFor={"creditcardemi"}
          className={filter.credit_card_emi ? "text-black " : " text-gray-400"}
        >
          Credit Card Emi
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "wallet", setFilters)
          }
          id={"wallet"}
          name={"wallet"}
          disabled={filter.qr}
          checked={filter.wallet}
        />
        <label
          htmlFor={"wallet"}
          className={filter.wallet ? "text-black " : " text-gray-400"}
        >
          Wallet
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "pay_later", setFilters)
          }
          id={"paylater"}
          name={"paylater"}
          disabled={filter.qr}
          checked={filter.pay_later}
        />
        <label
          htmlFor={"paylater"}
          className={filter.pay_later ? "text-black " : " text-gray-400"}
        >
          Pay later
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "cardless_emi", setFilters)
          }
          id={"cardlessemi"}
          name={"cardlessemi"}
          disabled={filter.qr}
          checked={filter.cardless_emi}
        />
        <label
          htmlFor={"cardlessemi"}
          className={filter.cardless_emi ? "text-black " : " text-gray-400"}
        >
          Cardless Emi
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "net_banking", setFilters)
          }
          id={"netbanking"}
          name={"netbanking"}
          disabled={filter.qr}
          checked={filter.net_banking}
        />
        <label
          htmlFor={"netbanking"}
          className={filter.net_banking ? "text-black " : " text-gray-400"}
        >
          Net Banking
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "debit_card", setFilters)
          }
          id={"debitcard"}
          name={"debitcard"}
          disabled={filter.qr}
          checked={filter.debit_card}
        />
        <label
          htmlFor={"debitcard"}
          className={filter.debit_card ? "text-black " : " text-gray-400"}
        >
          Debit Card
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "debit_card_emi", setFilters)
          }
          id={"debitcardemi"}
          name={"debitcardemi"}
          disabled={filter.qr}
          checked={filter.debit_card_emi}
        />
        <label
          htmlFor={"debitcardemi"}
          className={filter.debit_card_emi ? "text-black " : " text-gray-400"}
        >
          Debit Card Emi
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "vba", setFilters)
          }
          id={"vba"}
          name={"vba"}
          disabled={filter.qr}
          checked={filter.vba}
        />
        <label
          htmlFor={"vba"}
          className={filter.vba ? "text-black " : " text-gray-400"}
        >
          Bank Transfer(VBA)
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "pos_credit_card", setFilters)
          }
          id={"pos_credit_card"}
          name={"pos_credit_card"}
          disabled={filter.qr}
          checked={filter.pos_credit_card}
        />
        <label
          htmlFor={"pos_credit_card"}
          className={filter.pos_credit_card ? "text-black " : " text-gray-400"}
        >
          POS Credit Card
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "pos_debit_card", setFilters)
          }
          id={"pos_debit_card"}
          name={"pos_debit_card"}
          disabled={filter.qr}
          checked={filter.pos_debit_card}
        />
        <label
          htmlFor={"pos_debit_card"}
          className={filter.pos_debit_card ? "text-black " : " text-gray-400"}
        >
          POS Debit Card
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "pos_qr", setFilters)
          }
          id={"pos_qr"}
          name={"pos_qr"}
          disabled={filter.qr}
          checked={filter.pos_qr}
        />
        <label
          htmlFor={"pos_qr"}
          className={filter.pos_qr ? "text-black " : " text-gray-400"}
        >
          POS QR Code
        </label>
      </div>

      <p className="text-[10px] text-red-500 ">
        *You cannot select multiple payment modes while selecting Dynamic QR
        Code(DQC). Kindly deselect DQC to select other payment modes.
      </p>
    </div>
  );
}

export default Mode;
