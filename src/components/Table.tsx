/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import { MdOutlineContentCopy as PasteBtn } from "react-icons/md";
import { FaFilter } from "react-icons/fa6";
import { toast } from "react-toastify";
import Select from "./Select/Select";
import CopyRight from "./CopyRight";
import * as XLSX from "xlsx";

export function Pagination({ currentPage, totalPages, onPageChange }: any) {
  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage, endPage;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`px-4 py-1 ${
            i === currentPage
              ? "bg-[#1B163B] text-white text-sm"
              : " text-[#1B163B] text-sm font-normal"
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>,
      );
    }

    if (totalPages > 5) {
      if (currentPage + 1 > 5) {
        buttons.unshift(<span key="ellipsis2">...</span>);
      }
      if (currentPage + 1 > 5) {
        buttons.unshift(
          <button
            className="px-3 py-1 mx-1 text-[#1B163B] text-sm font-normal"
            onClick={() => onPageChange(1)}
          >
            {1}
          </button>,
        );
      }
      if (currentPage > 3) {
        buttons.unshift(
          <button
            key="prev"
            className="px-3 py-1 mx-1 text-[#1B163B] text-sm font-normal"
            onClick={() => onPageChange(currentPage - 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>,
        );
      }
      if (currentPage + 3 < totalPages) {
        buttons.splice(buttons.length, 0, <span key="ellipsis1">...</span>);
      }

      if (currentPage + 3 < totalPages) {
        buttons.push(
          <button
            className="px-3 py-1 mx-1 text-[#1B163B] text-sm font-normal"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>,
        );
      }

      if (currentPage + 2 < totalPages) {
        buttons.push(
          <button
            key="next"
            className="px-3 py-1 mx-1 text-[#1B163B] text-sm font-normal"
            onClick={() => onPageChange(currentPage + 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>,
        );
      }
    }

    return buttons;
  };

  return <div className="flex items-center">{renderPaginationButtons()}</div>;
}

export function RowsPerPageSelect({
  setItemsPerRow,
  itemsPerRow,
  className,
}: any) {
  return (
    <div
      className={
        "flex gap-x-2 text-xs items-center px-4 py-0 " +
        (className && className ? className : " justify-end")
      }
    >
      <p className=" shrink-0">Rows per page:</p>
      <Select
        selected={itemsPerRow}
        setSelected={setItemsPerRow}
        options={[10, 50, 150, 500].map((num) => {
          return { name: num };
        })}
      />
    </div>
  );
}

export const _Table = ({
  data,
  heading,
  footer,
  description,
  searchBox,
  csv_name,
  srNo,
  copyContent,
  pagination,
  filter,
  perPage,
  exportBtn,
  boxPadding,
  bgColor,
  minHeight,
  copyRight = true,
  loading = false,
  isCustomFilter,
}: any) => {
  const [csv_link, set_csv_link] = React.useState("");
  const refs: any = useRef<any>([]);
  const column = srNo ? ["S. No", ...data[0]] : data[0];
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerRow, setItemsPerRow] = useState({ name: 10 });

  // ⭐ NEW STATES FOR EXPORT MODAL
  const gateways = ["razorpay", "cashfree", "easebuzz"];
  const alwaysHideWhenGatewaySelected = [
    "Partner Address",
    "RM Manager Name",
    "RM Manager Email",
    "RM Name",
    "RM Email",
    "Tech Poc Name",
    "Tech Poc Email",
  ].map((c) => c.toLowerCase());
  const [selectedGateway, setSelectedGateway] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    column.filter((c) => c !== "S. No"),
  );
  const [tempSelectedColumns, setTempSelectedColumns] = useState<string[]>(
    column.filter((c) => c !== "S. No"),
  );

  // const items = data?.slice(1);
  // // const totalPages = Math.ceil(items.length / itemsPerRow?.name);

  // const handlePageChange = (page: any) => {
  //   setCurrentPage(page);
  // };

  // const indexOfLastItem = currentPage * itemsPerRow?.name;
  // const indexOfFirstItem = indexOfLastItem - itemsPerRow?.name;
  // const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  // const currentItemsArray = pagination
  //   ? currentItems
  //   : data?.slice(1); // backend already paginated

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [filter, itemsPerRow]);

  const currentItemsArray = data?.slice(1);

  // ⭐ NEW FUNCTION TO CHECK IF COLUMN SHOULD BE HIDDEN
  const shouldHideGatewayColumn = (colName: string) => {
    const lower = colName.toLowerCase();
    if (
      selectedGateway.length > 0 &&
      alwaysHideWhenGatewaySelected.includes(lower)
    ) {
      return true;
    }
    const isGatewayColumn = gateways.some((gw) => lower.includes(gw));

    if (!isGatewayColumn) return false;

    const matchesSelected = selectedGateway.some((gw) => lower.includes(gw));

    return selectedGateway.length > 0 && !matchesSelected;
  };

  useEffect(() => {
    if (!refs?.current || !column?.length) return;

    const insertLineBreaks = (str: any) => {
      if (!str) return str;

      const maxLen = 30;
      if (str.length <= maxLen) return str;
      let res = "";
      for (let i = 0; i < str.length; i += maxLen) {
        res += str.substr(i, maxLen) + "\n";
      }
      return res;
    };

    function removeButtons(node: HTMLElement) {
      const buttons = node.querySelectorAll("button");
      buttons.forEach((btn) => btn.remove());
    }

    // ⭐ UPDATED - Apply column and gateway filtering to Excel data
    const allData = [
      column,
      ...refs.current.map((r: any) => {
        if (!r) return column.map(() => "");

        return Array.from(r.children).map((c: any) => {
          const clone = c.cloneNode(true) as HTMLElement;
          removeButtons(clone);
          return insertLineBreaks(clone.innerText.replace("\u20b9", ""));
        });
      }),
    ];

    // ⭐ Gateway filtering for Excel
    const selectedCols = [
      column[0], // Always first column (Sr No)
      ...selectedColumns,
    ];

    const filteredIndices = column
      .map((col, i) => {
        const colLower = col.toLowerCase();
        const matchesGW = selectedGateway.some((gw) => colLower.includes(gw));

        if (
          selectedGateway.length > 0 &&
          !matchesGW &&
          gateways.some((g) => colLower.includes(g))
        )
          return -1;

        return selectedCols.includes(col) ? i : -1;
      })
      .filter((i) => i !== -1);

    const filteredData = allData.map((row, rowIndex) =>
      filteredIndices.map((i) =>
        i === 0 ? (rowIndex === 0 ? "S. No" : rowIndex) : row[i],
      ),
    );

    const getMaxColumnWidths = (data: any[]) => {
      const colCount = data[0].length;
      const maxWidths = Array(colCount).fill(10);
      for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < data.length; r++) {
          const val = data[r][c];
          const len = val ? val.toString().length : 0;
          if (len > maxWidths[c]) maxWidths[c] = len;
        }
      }
      return maxWidths;
    };

    const colWidths = getMaxColumnWidths(filteredData).map((w) => ({
      wch: w + 5,
    }));

    const ws = XLSX.utils.aoa_to_sheet(filteredData);
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    set_csv_link(url);

    return () => URL.revokeObjectURL(url);
  }, [data, selectedColumns, selectedGateway]);

  const renderTableHeader = () => {
    return (
      <tr
        className="w-full bg-[#A9B2CF1A] font-medium mx-5 rounded-lg text-sm text-[#1B163B]"
        ref={(e) => {
          refs.current[0] = e;
        }}
      >
        {column.map((item: any, i: any) => {
          if (shouldHideGatewayColumn(item)) return null;
          if (item !== column[0] && !selectedColumns.includes(item))
            return null;

          return (
            <th
              className="py-3 first:px-6 px-4 max-w-[15rem] text-left font-medium"
              key={i}
            >
              {item}
            </th>
          );
        })}
      </tr>
    );
  };

  const renderTableData = () => {
    return currentItemsArray?.map((row: any, key: any) => {
      return (
        <tr
          ref={(e) => {
            refs.current[key] = e;
          }}
          className=" bg-[#FFFFFF] overflow-hidden  w-full hover:-translate-y-[2px] hover:scale-[1.01] new-shadow  transform transition-transform duration-200  "
          key={key}
        >
          {(srNo === true ? [key + 1, ...row] : row).map(
            (item: any, i: any) => {
              if (!item) {
                return;
              }

              const colName = column[i];

              // ⭐ UPDATED - Apply column filtering
              if (shouldHideGatewayColumn(colName)) return null;
              if (colName !== column[0] && !selectedColumns.includes(colName))
                return null;

              return (
                <td className="py-3 pl-4 pr-4 text-left " key={i}>
                  <div className="flex text-xs gap-x-2 items-center max-w-[15rem] justify-between">
                    <span className="w-full" key={i}>
                      {item}
                    </span>
                    {copyContent?.length &&
                      !["NA", "N/A"].includes(item) &&
                      copyContent.map((c: any) => {
                        if (c === i + 1) {
                          return (
                            <PasteBtn
                              onClick={() => {
                                handleCopyContent(item);
                              }}
                              className="cursor-pointer text-[#717171] shrink-0 text-xl"
                            />
                          );
                        }
                      })}
                  </div>
                </td>
              );
            },
          )}
        </tr>
      );
    });
  };

  const handleCopyContent = (content: any) => {
    const copy_content =
      typeof content?.props?.children === "string"
        ? content?.props?.children
        : content?.props?.children?.props?.children;

    navigator.clipboard
      .writeText(copy_content ? copy_content : content)
      .then(() => {
        console.log("here");
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        toast.error("Error while copying");
      });
  };

  // ⭐ NEW FUNCTIONS FOR EXPORT MODAL
  const toggleSelectAll = () => {
    const colsWithoutSrNo = column.filter((c) => c !== column[0]);
    setTempSelectedColumns(
      tempSelectedColumns.length === colsWithoutSrNo.length
        ? []
        : colsWithoutSrNo,
    );
  };

  const handleColumnToggle = (col: string) => {
    setTempSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const handleSaveColumns = () => {
    setSelectedColumns(tempSelectedColumns);
    setIsModalOpen(false);
  };

  return (
    <div
      className={
        "flex w-full flex-col pb-0  rounded-[8px] " +
        (bgColor && bgColor ? bgColor : " bg-[#F6F8FA]") +
        (boxPadding && boxPadding ? boxPadding : " p-5") +
        " relative"
      }
      style={{ zIndex: 1 }}
    >
      <div
        className={
          "w-full   text-[#1e1b59]  " +
          (minHeight && minHeight ? minHeight : " min-h-[75vh]")
        }
      >
        <div className=" flex justify-between items-start w-full pr-4">
          <div className="w-full">
            <div className="text-[18px] flex justify-between items-center text-[#1B163B] font-semibold ml-4">
              {heading}
              <div className="flex gap-2">
                {/* ⭐ ADDED FILTER BUTTON */}
                {isCustomFilter && (
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setTempSelectedColumns(selectedColumns);
                    }}
                    className="font-normal py-2 text-sm px-6 border text-[#6687FF] border-edviron_black rounded-[4px]"
                  >
                    <FaFilter />
                  </button>
                )}

                {exportBtn && csv_link && (
                  <a
                    download={typeof heading !== "string" ? csv_name : heading}
                    href={csv_link}
                    className="focus:outline-none outline-none"
                  >
                    <button className="font-normal py-2 text-sm px-6 border text-[#6687FF] border-edviron_black rounded-[4px]">
                      Export
                    </button>
                  </a>
                )}
              </div>
            </div>
            {description && description}
          </div>
        </div>
        {searchBox && (
          <div className="w-full flex justify-between mb-2 items-start px-4 py-2">
            {searchBox}
          </div>
        )}
        {/* {perPage && (
          <RowsPerPageSelect
            setItemsPerRow={setItemsPerRow}
            itemsPerRow={itemsPerRow}
            className=" justify-start"
          />
        )} */}
        <div className="grid grid-cols-1 overflow-x-auto p-4">
          <table className="table-auto col-span-1 w-full border-separate border-spacing-y-0.5">
            <thead>{renderTableHeader()}</thead>

            {!loading && <tbody>{renderTableData()}</tbody>}
          </table>
          {loading && (
            <div className="col-span-1 space-y-1 mt-2 ">
              {Array(10)
                .fill("")
                .map((d: any, i: number) => {
                  return (
                    <div
                      key={i}
                      className="h-10 bg-slate-400 animate-pulse w-full rounded-lg"
                    ></div>
                  );
                })}
            </div>
          )}
        </div>
        {!loading && footer}
        {/* {!loading && pagination && (
          <div className="my-2 pagination-div flex justify-between">
            {pagination && (
              <div className="w-full flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
            {!loading && perPage && (
              <div className="pb-12">
                <RowsPerPageSelect
                  setItemsPerRow={setItemsPerRow}
                  itemsPerRow={itemsPerRow}
                />
              </div>
            )}
          </div>
        )} */}
      </div>
      {copyRight && <CopyRight />}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
          <div className="bg-white shadow-xl rounded-lg p-6 w-[25rem] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#1B163B] mb-4">
              Select Columns to Export
            </h2>

            {/* ⭐ GATEWAY FILTER UI
            <div className="mt-4 border-t pt-3">
              <h3 className="text-sm font-semibold text-[#1B163B] mb-2">
                Filter by Gateway
              </h3>

              <div className="flex gap-x-4 border-b pb-3 mb-3">
                {gateways.map((gw) => (
                  <div key={gw} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedGateway.includes(gw)}
                      onChange={() =>
                        setSelectedGateway((prev) =>
                          prev.includes(gw)
                            ? prev.filter((g) => g !== gw)
                            : [...prev, gw],
                        )
                      }
                    />
                    <label className="text-sm capitalize text-[#1B163B]">
                      {gw}
                    </label>
                  </div>
                ))}
              </div>
            </div> */}

            {/* COLUMN LIST */}
            <div className="max-h-80 min-h-60 overflow-y-auto">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={
                    tempSelectedColumns.length ===
                    column.filter((c) => c !== "S. No").length
                  }
                  onChange={toggleSelectAll}
                  className="mr-2"
                />
                <label className="text-sm text-[#1B163B]">Select All</label>
              </div>

              {column
                .filter((col) => col !== "S. No")
                .map((col, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={tempSelectedColumns.includes(col)}
                      onChange={() => handleColumnToggle(col)}
                      className="mr-2"
                    />
                    <label className="text-sm text-[#1B163B]">{col}</label>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveColumns}
                className="font-normal py-2 text-sm px-6 border text-white bg-[#1B163B] rounded-md hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
