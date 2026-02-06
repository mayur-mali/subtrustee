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
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("paymentMode", "cash", setFilters)
          }
          id={"cash"}
          name={"cash"}
          disabled={filter.qr}
          checked={filter.cash}
        />
        <label
          htmlFor={"cash"}
          className={filter.cash ? "text-black " : " text-gray-400"}
        >
          Cash
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
