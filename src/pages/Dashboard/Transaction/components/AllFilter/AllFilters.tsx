import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import Vendor from "./Vendor";
interface CheckboxProps {
  id: string;
  label: string;
  setCheckboxFilter: any;
  name: string;
  checkBoxFilter: any;
  filter: any;
  setFilter: any;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  setCheckboxFilter,
  name,
  checkBoxFilter,
  filter,
  setFilter,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleCheckboxChange = (e: any) => {
    const { name, value, checked } = e.target;
    setFilter((prevFilter: any) => {
      if (checked) {
        return {
          ...prevFilter,
          [value.toLowerCase()]: checked,
          size: prevFilter.size + 1,
          status: name === "Status" ? prevFilter.status + 1 : prevFilter.status,
          mode:
            name === "paymentMethods" ? prevFilter.mode + 1 : prevFilter.mode,
        };
      } else {
        const { [value.toLowerCase()]: omittedField, ...updatedFilter } =
          prevFilter;
        return {
          ...updatedFilter,
          size: prevFilter.size - 1,
          status: name === "Status" ? prevFilter.status - 1 : prevFilter.status,
          mode:
            name === "paymentMethods" ? prevFilter.mode - 1 : prevFilter.mode,
        };
      }
    });
    setIsChecked(!isChecked);
  };
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={filter.hasOwnProperty(id.toLowerCase())}
        name={name}
        value={id}
        onChange={handleCheckboxChange}
      />
      <label
        htmlFor={id}
        className={`${
          filter.hasOwnProperty(id.toLowerCase()) ? "text-black" : ""
        } pl-2`}
      >
        {label}
      </label>
    </div>
  );
};
function AllFilters(props: any) {
  const [filterOpt, setFilterOpt] = useState<any>({
    status: true,
    mode: false,
    school: false,
    vendor: false,
  });
  const [schoolData, setSchoolData] = useState<any>([...props.schoolData]);
  const checkboxItemsStatus = [
    { id: "Success", label: "Success" },
    { id: "Pending", label: "Pending" },
    { id: "Failed", label: "Failed" },
  ];
  const paymentMethodItems = [
    { id: "Credit Card", label: "Credit Card" },
    { id: "Credit Card EMI", label: "Credit Card EMI" },
    { id: "UPI", label: "UPI" },
    { id: "Wallet", label: "Wallet" },
    { id: "Pay Later", label: "Pay Later" },
    { id: "Cardless EMI", label: "Cardless EMI" },
    { id: "Net Banking", label: "Net Banking" },
    { id: "Debit Card EMI", label: "Debit Card EMI" },
    { id: "Debit Card", label: "Debit Card" },
  ];

  const [filter, setFilter] = useState<any>({
    ...props.checkboxFilter,
  });

  const applyButtonHandler = () => {
    props.setCheckboxFilter({
      ...filter,
    });
  };

  const toggleDropdown = (dropdownName: string) => {
    const updatedDropdowns = Object.keys(filterOpt).reduce((acc: any, name) => {
      acc[name] = name === dropdownName ? !filterOpt[name] : false;
      return acc;
    }, {});
    setFilterOpt(updatedDropdowns);
  };
  const clearFilter = () => {
    props.setCheckboxFilter((pre: any) => {
      return { size: 0, status: 0, mode: 0 };
    });
  };

  const schoolSearchHandler = (str: string) => {
    if (!str) {
      setSchoolData(props.schoolData);
      return;
    }
    const data = props.schoolData.filter((school: any) => {
      if (school.school_name.toLowerCase().includes(str.toLowerCase())) {
        return true;
      } else {
        return false;
      }
    });
    setSchoolData(data);
  };
  return (
    <div className="absolute text-sm z-10 -left-[11rem] xl:-left-[14rem]   mt-2 min-w-fit flex gap-x-2 bg-white shadow-lg rounded-lg p-4 min-h-[20rem]">
      <div className="flex-col items-center border-r-2 min-w-[8rem] w-full pr-4  border-gray-300  ">
        <p className="mb-4 text-[#6F6AF8]">Filter</p>
        <button
          onClick={() => toggleDropdown("status")}
          className={`w-full text-xs ${
            filterOpt.status ? "bg-[#DADBFC]" : ""
          } rounded-xl p-1 flex items-center mb-4 `}
        >
          <span className="pl-2 ">Status</span>
          <IoIosArrowForward className="w-4 h-4 ml-auto block" />
        </button>
        <button
          onClick={() => toggleDropdown("mode")}
          className={`w-full text-xs ${
            filterOpt.mode ? "bg-[#DADBFC]" : ""
          } rounded-xl p-1 flex items-center mb-4 `}
        >
          <span className="pl-2 ">Mode</span>
          <IoIosArrowForward className="w-4 h-4 ml-auto block" />
        </button>
        <button
          onClick={() => toggleDropdown("school")}
          className={`w-full text-xs ${
            filterOpt.school ? "bg-[#DADBFC]" : ""
          } rounded-xl p-1 flex items-center mb-4 `}
        >
          <span className="pl-2 ">Institute</span>
          <IoIosArrowForward className="w-4 h-4 ml-auto block" />
        </button>
        <button
          onClick={() => toggleDropdown("vendor")}
          className={`w-full text-xs ${
            filterOpt.vendor ? "bg-[#DADBFC]" : ""
          } rounded-xl p-1 flex items-center mb-4 `}
        >
          <span className="pl-2 ">Vendor</span>
          <IoIosArrowForward className="w-4 h-4 ml-auto block" />
        </button>
      </div>

      <div
        className={`${filterOpt.status ? "flex flex-col w-full" : "hidden"}`}
      >
        <div className="text-slate-400 flex flex-wrap gap-3 items-center min-w-[15rem]">
          {checkboxItemsStatus.map((item) => (
            <Checkbox
              key={item.id}
              id={item.id}
              checkBoxFilter={props.checkboxFilter}
              label={item.label}
              setCheckboxFilter={props.setCheckboxFilter}
              name="Status"
              filter={filter}
              setFilter={setFilter}
            />
          ))}
        </div>
        <div className="flex mt-auto ml-auto">
          <button
            onClick={() => clearFilter()}
            className="border mr-4 px-4 py-1 rounded-md text-sm text-[#6687FF] border-edviron_black"
          >
            Clear
          </button>
          <button
            onClick={() => applyButtonHandler()}
            disabled={filter.size === 0}
            className={`border px-4 py-1 rounded-md text-sm ${
              filter.size === 0
                ? "bg-[#EEF1F6] text-slate-700"
                : "text-white bg-edviron_black"
            } `}
          >
            Apply
          </button>
        </div>
      </div>
      <div
        className={`${filterOpt.mode ? "pl-2 flex flex-col w-full" : "hidden"}`}
      >
        <div className=" text-slate-400 flex flex-wrap gap-3 items-center min-w-[15rem]">
          {paymentMethodItems.map((item) => (
            <Checkbox
              checkBoxFilter={props.checkboxFilter}
              key={item.id}
              id={item.id}
              label={item.label}
              setCheckboxFilter={props.setCheckboxFilter}
              name="paymentMethods"
              filter={filter}
              setFilter={setFilter}
            />
          ))}
        </div>
        <div className="flex mt-auto ml-auto ">
          <button
            onClick={() => clearFilter()}
            className="border mr-4 px-4 py-1 rounded-md text-sm text-[#6687FF] border-edviron_black"
          >
            Clear
          </button>
          <button
            onClick={() => applyButtonHandler()}
            disabled={filter.size === 0}
            className={`border px-4 py-1 rounded-md text-sm ${
              filter.size === 0
                ? "bg-[#EEF1F6] text-slate-700"
                : "text-white bg-edviron_black"
            } `}
          >
            Apply
          </button>
        </div>
      </div>
      <div
        className={`${
          filterOpt.school
            ? "w-full flex flex-col items-center min-w-[18rem]"
            : "hidden"
        }`}
      >
        <div className="flex gap-x-2 bg-[#EEF1F6] items-center p-2 rounded-lg w-[90%] mt-4">
          <IoSearch className="w-4 h-4 mr-2" />
          <input
            type="text"
            placeholder=" Search(Institute Name)"
            value={schoolData.name}
            className=" text-[#505E8E] text-sm w-full outline-none bg-transparent"
            onChange={(e) => schoolSearchHandler(e.target.value)}
          ></input>
        </div>
        {
          <div className="mt-4 overflow-y-auto border border-gray-200 flex flex-col gap-y-2 rounded-lg w-[90%] mb-4">
            {schoolData.map((school: any) => {
              return (
                <ul
                  key={school.school_id}
                  onClick={() =>
                    props.setSchoolFilter((pre: any) => {
                      if (pre[school.school_id] === school.school_name) {
                        return {
                          ...pre,
                          [school.school_id]: school.school_name,
                        };
                      } else {
                        return {
                          ...pre,
                          [school.school_id]: school.school_name,
                          size: pre.size + 1,
                        };
                      }
                    })
                  }
                  className={`cursor-pointer p-2 ${
                    props.schoolFilter[school.school_id] === school.school_name
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  {school.school_name}
                </ul>
              );
            })}
          </div>
        }
      </div>
      <div
        className={`${
          filterOpt.vendor
            ? "w-full flex flex-col items-center min-w-[18rem]"
            : "hidden"
        }`}
      >
        <div className="w-[90%] mt-4">
          <Vendor
            setSelectVendor={(vendorName: string) =>
              props.setVendorFilter((pre: any) => ({
                ...pre,
                name: vendorName,
              }))
            }
            setVendorId={(vendorId: string) =>
              props.setVendorFilter((pre: any) => ({
                ...pre,
                id: vendorId,
                size: vendorId ? pre.size + 1 : pre.size - 1,
              }))
            }
            menuIsOpen={filterOpt.vendor}
            schoolId={
              props.schoolFilter
                ? Object.keys(props.schoolFilter).filter(
                    (key) => key !== "size",
                  )
                : []
            }
          />
        </div>
        <div className="flex mt-4 ml-auto gap-2">
          <button
            onClick={() =>
              props.setVendorFilter((pre: any) => ({
                size: 0,
                id: null,
                name: null,
              }))
            }
            className="border px-4 py-1 rounded-md text-sm text-[#6687FF] border-edviron_black"
          >
            Clear
          </button>
          <button
            onClick={() => {
              // Apply button action
            }}
            className="border px-4 py-1 rounded-md text-sm text-white bg-edviron_black"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
export default AllFilters;
