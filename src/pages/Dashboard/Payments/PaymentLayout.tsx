import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Link, useSearchParams } from "react-router-dom";
import Transaction from "../Transaction/Transaction";
import Settlement from "../Settlement/Settlement";
import Refund from "../Refund/Refund";
import Disputes from "./Disputes";
import VendorTransaction from "./VendorTab/VendorTransaction";
import VendorSettlement from "./VendorTab/VendorSettlement";

export default function PaymentLayout({ menu = true }: { menu: boolean }) {
  const [vendorTab, setVendorTab] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "transactions";

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "transactions" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (tab === "vendor-transaction" || tab === "vendor-settlement") {
      setVendorTab(true);
    }
  }, [tab]);

  const activeClass =
    "bg-[#6687FF33] py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#1B163B] block";
  const inactiveClass =
    "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#717171] block";

  const activeSubClass =
    "bg-[#6687FF33] py-1.5 font-semibold rounded-lg text-[14px] text-left pl-6 text-[#1B163B] block";
  const inactiveSubClass =
    "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-6 text-[#717171] block";

  return (
    <div className="flex">
      <div
        className={
          "  transition-transform duration-200 fixed overflow-hidden   pt-10 " +
          (menu ? "translate-x-0 w-56" : " -translate-x-[100%] w-0 ")
        }
      >
        <div className=" flex flex-col space-y-1 min-h-screen shrink-0">
          <Link
            to="?tab=transactions"
            className={
              tab === "transactions" || tab === "transaction"
                ? activeClass
                : inactiveClass
            }
          >
            Transaction
          </Link>
          <Link
            to="?tab=settlements"
            className={tab === "settlements" ? activeClass : inactiveClass}
          >
            Settlements
          </Link>
          <Link
            to="?tab=refunds"
            className={tab === "refunds" ? activeClass : inactiveClass}
          >
            Refund
          </Link>
          <Link
            to="?tab=disputes"
            className={tab === "disputes" ? activeClass : inactiveClass}
          >
            Disputes
          </Link>
          <div>
            <div
              className="flex items-center cursor-pointer py-1.5 rounded-lg pl-10 font-semibold text-[14px] text-[#1B163B]"
              onClick={() => setVendorTab((prev) => !prev)}
            >
              <span className="flex-1">E-Split</span>
              <IoIosArrowDown
                className={
                  "text-lg duration-200 transition-transform " +
                  (vendorTab ? "rotate-0" : "-rotate-180")
                }
              />
            </div>

            {vendorTab && (
              <div className="ml-6 flex flex-col space-y-1">
                <Link
                  to="?tab=vendor-transaction"
                  className={
                    tab === "vendor-transaction" ||
                    tab === "vendor-transactions"
                      ? activeSubClass
                      : inactiveSubClass
                  }
                >
                  Vendors Transaction
                </Link>
                <Link
                  to="?tab=vendor-settlement"
                  className={
                    tab === "vendor-settlement" || tab === "vendor-settlements"
                      ? activeSubClass
                      : inactiveSubClass
                  }
                >
                  Vendor Settlement
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={"tab-content w-full py-4 " + (menu ? " pl-64" : " pl-2")}>
        {tab === "transactions" || tab === "transaction" ? (
          <Transaction />
        ) : tab === "settlements" ? (
          <Settlement />
        ) : tab === "refunds" ? (
          <Refund />
        ) : tab === "disputes" ? (
          <Disputes />
        ) : tab === "vendor-transaction" || tab === "vendor-transactions" ? (
          <VendorTransaction />
        ) : tab === "vendor-settlement" || tab === "vendor-settlements" ? (
          <VendorSettlement />
        ) : (
          <Transaction />
        )}
      </div>
    </div>
  );
}
