import React from "react";
import { Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

function RingGraph({ kycDetails, amountOfSchools }: any) {
  const navigate = useNavigate();
  const { active, inactive, pending } = kycDetails
    ? kycDetails
    : { active: 0, inactive: 0, pending: 0 };
  const data = {
    labels: ["Active(KYC done)", "Inactive"],
    datasets: [
      {
        data: [active, ...[pending + inactive]],
        backgroundColor: ["#6687FF", "#696969", "#ACB6C6"],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutoutPercentage: 70,
    legend: {
      display: false,
    },
    layout: {
      padding: 0,
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div className=" w-full rounded-[5px] bg-[#F6F8FA] p-5 shadow shadow-[#A9B2CF] text-[14px]">
      <p className="mb-2">Institute Status</p>
      <div className="flex justify-between w-full">
        <div className="lg:w-1/4 w-1/2">
          <Doughnut
            data={data}
            options={options}
            onElementsClick={(e) => {
              navigate("/institute", { state: e[0]._view.label });
            }}
          />
        </div>
        <div className="w-2/3 flex flex-col lg:gap-y-2 lg:ml-0 mt-8 ml-3">
          <div className="flex flex-wrap gap-x-2">
            <span className="before:inline-block before:content-[' '] before:w-2 before:h-2 before:bg-[#6687FF] before:rounded-full before:mr-2">
              Active(KYC done)
            </span>
            <span className="before:inline-block before:content-[' '] before:w-2 before:h-2 before:bg-[#696969] before:rounded-full before:mr-2">
              Inactive
            </span>
          </div>
        </div>
      </div>
      <div className="w-full text-right">
        <p>
          Total Institutes: <span>{amountOfSchools}</span>
        </p>
      </div>
    </div>
  );
}
export default RingGraph;
