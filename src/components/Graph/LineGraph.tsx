import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  filterTransactionsByMonth,
  filterTransactionsByQuarter,
  formatNumber,
} from "../../pages/Dashboard/Overview/Helper/filterData";

import Select from "./Select";
// import { monthData } from "../../pages/Dashboard/Overview/arrayData";
function LineGraph({ dataArray, commission, year, setYear, refetch }: any) {
  const [monthFrequency, setMonthFrequency] = useState<any>({
    name: "Monthly",
  });
  const [type, setType] = useState<any>({
    name: "totalTransactionAmount",
  });
  const [filterData, setFilterData] = useState<any>([]);
  const quarters = [
    ["January", "February", "March"],
    ["April", "May", "June"],
    ["July", "August", "September"],
    ["October", "November", "December"],
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const labels =
    monthFrequency?.name === "Monthly"
      ? [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
      : ["Jan-Mar", "Apr-June", "Jul-Sep", "Oct-Dec"];

  useEffect(() => {
    if (commission) {
      if (monthFrequency?.name === "Monthly") {
        setFilterData(
          labels
            ?.map((_: any, monthNum: number) =>
              filterTransactionsByMonth(
                dataArray,
                new Date().getFullYear(),
                monthNum + 1,
              ),
            )
            .map(
              (t: any) => t[commission ? "totalCommissionAmount" : type?.name],
            ),
        );
      } else {
        setFilterData(
          labels
            ?.map((_: any, monthNum: number) =>
              filterTransactionsByQuarter(
                dataArray,
                new Date().getFullYear(),
                monthNum + 1,
              ),
            )
            .map(
              (t: any) => t[commission ? "totalCommissionAmount" : type?.name],
            ),
        );
      }
    } else {
      if (monthFrequency?.name === "Monthly") {
        setFilterData(
          months.map((month) => {
            const data = dataArray?.find((item: any) => item.month === month);
            return data
              ? type.name === "totalTransactionAmount"
                ? data.total_transaction_amount
                : data.total_transactions
              : 0;
          }),
        );
      } else {
        setFilterData(
          quarters.map((quarter) => {
            return quarter?.reduce((sum, month) => {
              const data = dataArray?.find((item: any) => item.month === month);
              return (
                sum +
                (data
                  ? type.name === "totalTransactionAmount"
                    ? data.total_transaction_amount
                    : data.total_transactions
                  : 0)
              );
            }, 0);
          }),
        );
      }
    }
  }, [labels.length, type, dataArray?.length, year]);

  const data = {
    labels: labels,
    datasets: [
      {
        label: monthFrequency?.name,
        data: filterData,
        fill: true,
        backgroundColor: (context: any) => {
          const bgColor = [
            "rgba(102, 135, 255, 0.5)",
            "rgba(111, 106, 248, 0)",
            "rgba(102, 135, 255, 0)",
          ];
          if (!context.chart.chartArea) {
            return;
          }
          const {
            ctx,

            chartArea: { top, bottom },
          } = context.chart;
          const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
          gradientBg.addColorStop(0.1, bgColor[0]);
          gradientBg.addColorStop(1, bgColor[1]);
          gradientBg.addColorStop(1, bgColor[2]);

          return gradientBg;
        },
        borderColor: "#6687FF",
        tension: 0.0,
      },
    ],
  };

  return (
    <div className="rounded-[5px] relative  bg-[#F6F8FA] p-5 shadow shadow-[#A9B2CF]">
      <div className="px-4 py-2 flex justify-between items-center">
        <div>
          {" "}
          <h1 className=" text-sm  font-medium">
            {commission ? "Commission" : "Transaction"} Report
          </h1>
        </div>
        <div className=" flex gap-x-4 text-sm font-normal items-center">
          <div className=" flex items-center ">
            <span className=" text-[#717171] text-[14px]">Shows</span>
            <Select
              selected={monthFrequency}
              setSelected={setMonthFrequency}
              options={[{ name: "Monthly" }, { name: "Quarterly" }].map(
                (type: any) => {
                  return { name: type.name };
                },
              )}
            />
          </div>
          {!commission && (
            <div className=" flex items-center ">
              <span className=" text-[#717171] text-[14px]">Year</span>
              <Select
                selected={year}
                setSelected={setYear}
                options={[{ name: "2024" }, { name: "2025" }].map(
                  (type: any) => {
                    return { name: type.name };
                  },
                )}
              />
            </div>
          )}
          {!commission && (
            <div className=" flex gap-x-2 text-sm font-normal items-center">
              <span className=" text-[#717171] text-[14px]">Type</span>
              <Select
                selected={type}
                setSelected={(e: any) => {
                  if (e.name === "Total Transaction Amount") {
                    setType({ name: "totalTransactionAmount" });
                  }
                  if (e.name === "Transaction Count") {
                    setType({ name: "transactionCount" });
                  }
                }}
                options={[
                  { name: "totalTransactionAmount" },
                  { name: "transactionCount" },
                ].map((type: any) => {
                  if (type.name === "totalTransactionAmount") {
                    return { name: "Total Transaction Amount" };
                  }
                  if (type.name === "transactionCount") {
                    return { name: "Transaction Count" };
                  }
                })}
              />
            </div>
          )}
        </div>
      </div>

      <div className=" h-[356px] mt-4">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            legend: {
              display: false,
            },
            scales: {
              xAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                },
              ],
              yAxes: [
                {
                  gridLines: {
                    borderDash: [5, 5],
                  },
                  ticks: {
                    beginAtZero: true,
                    callback: function (value: any) {
                      return formatNumber(value);
                    },
                  },
                },
              ],
            },
          }}
        />
      </div>
    </div>
  );
}

export default LineGraph;
