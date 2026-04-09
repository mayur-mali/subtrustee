import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

export default function PaymentLayout({ menu = true }: { menu: boolean }) {
  const [vendorTab, setVendorTab] = useState(false);
  const location = useLocation();

  return (
    <div className="flex">
      <div
        className={
          "  transition-transform duration-200 fixed overflow-hidden   pt-10 " +
          (menu ? "translate-x-0 w-56" : " -translate-x-[100%] w-0 ")
        }
      >
        <div className=" flex flex-col space-y-1 min-h-screen shrink-0">
          <NavLink
            to="/payments/transaction"
            className={({ isActive }) => {
              const active = isActive || location.pathname === "/payments";
              return active
                ? "bg-[#6687FF33]   py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#1B163B]"
                : "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#717171]";
            }}
          >
            Transaction
          </NavLink>
          <NavLink
            to="/payments/settlements"
            className={({ isActive }) =>
              isActive
                ? "bg-[#6687FF33]   py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#1B163B]"
                : "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#717171]"
            }
          >
            Settlements
          </NavLink>
          <NavLink
            to="/payments/refunds"
            className={({ isActive }) =>
              isActive
                ? "bg-[#6687FF33]   py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#1B163B]"
                : "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#717171]"
            }
          >
            Refund
          </NavLink>
          <NavLink
            to="/payments/disputes"
            className={({ isActive }) =>
              isActive
                ? "bg-[#6687FF33]   py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#1B163B]"
                : "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-10 text-[#717171]"
            }
          >
            Disputes
          </NavLink>
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
                <NavLink
                  to="/payments/vendor-transaction"
                  className={({ isActive }) =>
                    isActive
                      ? "bg-[#6687FF33] py-1.5 font-semibold rounded-lg text-[14px] text-left pl-6 text-[#1B163B]"
                      : "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-6 text-[#717171]"
                  }
                >
                  Vendors Transaction
                </NavLink>
                <NavLink
                  to="/payments/vendor-settlement"
                  className={({ isActive }) =>
                    isActive
                      ? "bg-[#6687FF33] py-1.5 font-semibold rounded-lg text-[14px] text-left pl-6 text-[#1B163B]"
                      : "py-1.5 font-semibold rounded-lg text-[14px] text-left pl-6 text-[#717171]"
                  }
                >
                  Vendor Settlement
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={"tab-content w-full py-4 " + (menu ? " pl-64" : " pl-2")}>
        <Outlet />
      </div>
    </div>
  );
}
