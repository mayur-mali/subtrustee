import React from "react";
import SchoolDetails from "./SchoolDetail";
import { useLocation } from "react-router-dom";

function Vendor() {
  let { state } = useLocation();

  return (
    <div className="p-5 w-full p-2">
      <h2 className="text-[#1B163B] font-semibold text-[18px] mb-4">
        Institute Details
      </h2>
      <SchoolDetails school={state?.school} />
    </div>
  );
}

export default Vendor;
