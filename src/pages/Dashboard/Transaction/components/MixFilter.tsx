import { useEffect, useRef, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { IoIosArrowForward } from "react-icons/io";
// import Status from "./AllFilter/Status";
import Mode, { GatewayMode } from "./AllFilter/Mode";
import Institute from "./AllFilter/Institute";
import Vendor from "./AllFilter/Vendor";
import Product from "./AllFilter/Product";
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
  product,
}: any) {
  const [openFilter, setOpenFilter] = useState(false);
  const [activTab, setActiveTab] = useState(1);

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
          setOpenFilter(!openFilter);
        }}
        className="focus:outline-none border border-edviron_black  hover:border-gray-300 transition-all duration-150 rounded-md py-2 w-full text-xs text-left flex items-center "
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
              <button
                onClick={() => {
                  setActiveTab(5);
                }}
                className={
                  "flex items-center w-full   rounded-full px-2 py-1 " +
                  (activTab === 5 ? " bg-[#DADBFC]" : " ")
                }
              >
                <span>Product</span>
                <IoIosArrowForward className="w-4 h-4 ml-auto block" />
              </button>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex-1">
                {/* {activTab === 1 && (
                  <Status filter={filters.status} setFilters={setFilters} />
                )} */}
                {activTab === 1 && (
                  <Mode filter={filters.paymentMode} setFilters={setFilters} />
                )}
                {activTab === 2 && (
                  <Institute
                    setSelectSchool={setSelectSchool}
                    setSchoolId={setSchoolId}
                  />
                )}
                {activTab === 3 && (
                  <GatewayMode
                    filter={filters?.gateway}
                    setFilters={setFilters}
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
                {activTab === 5 && (
                  <Product filter={filters?.product} setFilters={setFilters} />
                )}
              </div>
              <div className="flex justify-end items-center my-2">
                <button
                  onClick={() => {
                    onCancel();
                    setType("");
                    setActiveTab(1);
                    setOpenFilter(false);
                  }}
                  className=" pointer border mr-4 px-4 py-1 rounded-md text-sm text-[#6687FF] border-edviron_black"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (
                      !paymentModes.length &&
                      !gateway.length &&
                      !product.length
                    ) {
                      onApply();
                    } else {
                      setType("Custom Filter");
                      onApply();
                    }
                  }}
                  //disabled={!selectedItems.length}
                  className="pointer border  px-4 py-1 rounded-md text-sm text-[#6687FF] bg-edviron_black border-edviron_black"
                  // {
                  //   "border px-4 py-1 rounded-md text-sm text-white bg-edviron_black disabled:bg-[#EEF1F6] disabled:text-slate-700"
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
