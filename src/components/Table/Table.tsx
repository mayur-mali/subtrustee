/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState } from "react";
import "./table.css";
import { MdOutlineContentCopy as PasteBtn } from "react-icons/md";
import { toast } from "react-toastify";
import Select from "../../components/Select/Select";

import * as XLSX from "xlsx";
import CopyRight from "../CopyRight";

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
          className={`px-4 cursor-pointer py-1 ${
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

export const Table = ({
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
}: any) => {
  const [csv_link, set_csv_link] = React.useState("");
  const refs: any = useRef<any>([]);
  const column = srNo ? ["S. No", ...data[0]] : data[0];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerRow, setItemsPerRow] = useState({ name: 10 });

  const items = data?.slice(1);
  const totalPages = Math.ceil(items.length / itemsPerRow?.name);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerRow?.name;
  const indexOfFirstItem = indexOfLastItem - itemsPerRow?.name;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const currentItemsArray = pagination ? currentItems : data?.slice(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, itemsPerRow]);

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

    const dataArray = [
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

    const colWidths = getMaxColumnWidths(dataArray).map((w) => ({
      wch: w + 5,
    }));

    const ws = XLSX.utils.aoa_to_sheet(dataArray);
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
  }, [data, currentPage, itemsPerRow?.name]);

  const renderTableHeader = () => {
    return (
      <tr
        className="w-full bg-[#A9B2CF1A] font-medium mx-5 rounded-lg text-sm text-[#1B163B]"
        ref={(e) => {
          refs.current[0] = e;
        }}
      >
        {column.map((item: any, i: any) => (
          <th
            className="py-3 first:px-6 px-4 max-w-[15rem] text-left font-medium"
            key={i}
          >
            {item}
          </th>
        ))}
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
          {(srNo === true
            ? [(currentPage - 1) * itemsPerRow.name + 1 + key, ...row]
            : row
          ).map((item: any, i: any) => {
            if (!item) {
              return;
            }

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
          })}
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
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        toast.error("Error while copying");
      });
  };
  return (
    <div
      className={
        "flex w-full flex-col rounded-[8px] " +
        (bgColor && bgColor ? bgColor : " bg-[#F6F8FA]") +
        (boxPadding && boxPadding ? boxPadding : " p-5")
      }
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
              {exportBtn && (
                <a
                  download={typeof heading !== "string" ? csv_name : heading}
                  href={csv_link}
                  className="focus:outline-none outline-none"
                >
                  <button className=" font-normal py-2 text-sm px-6 border border-edviron_black text-[#6687FF] rounded-[4px]">
                    Export
                  </button>
                </a>
              )}
            </div>
            {description && description}
          </div>
        </div>
        {searchBox && (
          <div className="w-full flex justify-between mb-2 items-start px-4 py-2">
            {searchBox}
          </div>
        )}
        {perPage && (
          <RowsPerPageSelect
            setItemsPerRow={setItemsPerRow}
            itemsPerRow={itemsPerRow}
            className=" justify-start"
          />
        )}
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
        {!loading && (pagination || perPage) && (
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
        )}
      </div>
      {copyRight && <CopyRight />}
    </div>
  );
};
