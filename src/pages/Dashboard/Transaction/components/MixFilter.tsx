import { useEffect, useRef, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";
// import Status from "./AllFilter/Status";
import Mode, { GatewayMode } from "./AllFilter/Mode";
import Institute from "./AllFilter/Institute";
import Vendor from "./AllFilter/Vendor";

function MixFilter({
  setSelectSchool,
  setSchoolId,
  setSelectVendor,
  setVendorId,
  setType,
  onCancel,
  onApply,
  filters,
  setFilters,
  paymentModes,
  gateway,
}: any) {
  const [openFilter, setOpenFilter] = useState(false);
  const [activTab, setActiveTab] = useState(1);

  const [pendingFilters, setPendingFilters] = useState<any>({
    paymentMode: { ...filters.paymentMode },
    gateway: { ...filters.gateway },
  });

  const setPendingFiltersWrapper = (updater: any) => {
    setPendingFilters((prev: any) => {
      const fullState = {
        ...filters,
        paymentMode: prev.paymentMode,
        gateway: prev.gateway,
      };
      const updated =
        typeof updater === "function" ? updater(fullState) : updater;
      return { paymentMode: updated.paymentMode, gateway: updated.gateway };
    });
  };

  const divRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: any) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setOpenFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative w-full " ref={divRef}>
      <button
        onClick={() => {
          if (!openFilter) {
            // sync pending state with current committed filters when opening
            setPendingFilters({
              paymentMode: { ...filters.paymentMode },
              gateway: { ...filters.gateway },
            });
          }
          setOpenFilter(!openFilter);
        }}
        className="focus:outline-none border border-[#1E1B59]  hover:border-gray-300 transition-all duration-150 rounded-md py-2 w-full text-xs text-left flex items-center "
      >
        <span className="mr-auto pl-2">All Filter</span>
        <HiOutlineAdjustmentsHorizontal className=" ml-auto w-8" />
      </button>
      {openFilter && (
        <div className="absolute right-0  text-sm bg-white min-w-[35rem] rounded-md shadow-lg z-10 flex flex-col">
          <div className="flex gap-x-3 p-2 mt-4 min-h-[20rem] ">
            <div className=" flex flex-col gap-y-4 text-xs border-r  w-36 shrink-0 border-gray-500 pr-3">
              <button
                onClick={() => {
                  setActiveTab(1);
                }}
                className={
                  "flex items-center w-full   rounded-full px-2 py-1 " +
                  (activTab === 1 ? " bg-[#DADBFC]" : " ")
                }
              >
                <span>Mode</span>
                <IoIosArrowForward className="w-4 h-4 ml-auto block" />
              </button>
              <button
                onClick={() => {
                  setActiveTab(2);
                }}
                className={
                  "flex items-center w-full   rounded-full px-2 py-1 " +
                  (activTab === 2 ? " bg-[#DADBFC]" : " ")
                }
              >
                <span>Institute</span>
                <IoIosArrowForward className="w-4 h-4 ml-auto block" />
              </button>
              <button
                onClick={() => {
                  setActiveTab(3);
                }}
                className={
                  "flex items-center w-full   rounded-full px-2 py-1 " +
                  (activTab === 3 ? " bg-[#DADBFC]" : " ")
                }
              >
                <span>Gateway</span>
                <IoIosArrowForward className="w-4 h-4 ml-auto block" />
              </button>
              <button
                onClick={() => {
                  setActiveTab(4);
                }}
                className={
                  "flex items-center w-full   rounded-full px-2 py-1 " +
                  (activTab === 4 ? " bg-[#DADBFC]" : " ")
                }
              >
                <span>Vendor</span>
                <IoIosArrowForward className="w-4 h-4 ml-auto block" />
              </button>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex-1">
                {/* {activTab === 1 && (
                  <Status filter={filters.status} setFilters={setFilters} />
                )} */}
                {activTab === 1 && (
                  <Mode
                    filter={pendingFilters.paymentMode}
                    setFilters={setPendingFiltersWrapper}
                  />
                )}
                {activTab === 2 && (
                  <Institute
                    setSelectSchool={setSelectSchool}
                    setSchoolId={setSchoolId}
                  />
                )}
                {activTab === 3 && (
                  <GatewayMode
                    filter={pendingFilters.gateway}
                    setFilters={setPendingFiltersWrapper}
                  />
                )}
                {activTab === 4 && (
                  <Vendor
                    setSelectVendor={setSelectVendor}
                    setVendorId={setVendorId}
                    menuIsOpen={activTab === 4}
                    schoolId={[]}
                  />
                )}
              </div>
              <div className="flex justify-end items-center my-2">
                <button
                  onClick={() => {
                    setPendingFilters({
                      paymentMode: { ...filters.paymentMode },
                      gateway: { ...filters.gateway },
                    });
                    onCancel();
                    setType("");
                    setActiveTab(1);
                    setOpenFilter(false);
                  }}
                  className=" pointer border mr-4 px-4 py-1 rounded-md text-sm text-[#6687FF] border-[#1E1B59]"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setFilters((prev: any) => ({
                      ...prev,
                      paymentMode: pendingFilters.paymentMode,
                      gateway: pendingFilters.gateway,
                    }));
                    const hasFilters =
                      Object.values(pendingFilters.paymentMode).some(Boolean) ||
                      Object.values(pendingFilters.gateway).some(Boolean);
                    if (hasFilters) {
                      setType("Custom Filter");
                    }
                    onApply(pendingFilters.paymentMode, pendingFilters.gateway);
                    setOpenFilter(false);
                  }}
                  //disabled={!selectedItems.length}
                  className="pointer border  px-4 py-1 rounded-md text-sm text-white bg-[#1E1B59] border-[#1E1B59]"
                  // {
                  //   "border px-4 py-1 rounded-md text-sm text-white bg-[#1E1B59] disabled:bg-[#EEF1F6] disabled:text-slate-700"
                  // }
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MixFilter;
