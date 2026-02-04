import React from "react";
import { handleCheckboxChange } from "../../Transaction";

function Product({ filter, setFilters }: any) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() => handleCheckboxChange("product", "NORMAL", setFilters)}
          id={"NORMAL"}
          name={"NORMAL"}
          checked={filter.NORMAL}
        />
        <label
          htmlFor={"NORMAL"}
          className={filter.NORMAL ? "text-black " : " text-gray-400"}
        >
          Edviron Payment Gateway
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("product", "COLLECT_NOW", setFilters)
          }
          id={"COLLECT_NOW"}
          name={"COLLECT_NOW"}
          checked={filter.COLLECT_NOW}
        />
        <label
          htmlFor={"COLLECT_NOW"}
          className={filter.COLLECT_NOW ? "text-black " : " text-gray-400"}
        >
          Collect Now
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("product", "FORM_PAYMENT", setFilters)
          }
          id={"FORM_PAYMENT"}
          name={"FORM_PAYMENT"}
          checked={filter.FORM_PAYMENT}
        />
        <label
          htmlFor={"FORM_PAYMENT"}
          className={filter.FORM_PAYMENT ? "text-black " : " text-gray-400"}
        >
          Payment Forms
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("product", "CANTEEN_TRANSACTION", setFilters)
          }
          id={"CANTEEN_TRANSACTION"}
          name={"CANTEEN_TRANSACTION"}
          checked={filter.CANTEEN_TRANSACTION}
        />
        <label
          htmlFor={"CANTEEN_TRANSACTION"}
          className={
            filter.CANTEEN_TRANSACTION ? "text-black " : " text-gray-400"
          }
        >
          Canteen
        </label>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="checkbox"
          onChange={() =>
            handleCheckboxChange("product", "AUTO_DEBIT", setFilters)
          }
          id={"AUTO_DEBIT"}
          name={"AUTO_DEBIT"}
          checked={filter.AUTO_DEBIT}
        />
        <label
          htmlFor={"AUTO_DEBIT"}
          className={filter.AUTO_DEBIT ? "text-black " : " text-gray-400"}
        >
          Auto Debit
        </label>
      </div>
    </div>
  );
}

export default Product;
