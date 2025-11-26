import clsx from "clsx";
import React, { useRef, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

interface AccordionItem {
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
}

export default function Accordion({ items, multiple = false }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (index: number) => {
    const isOpen = openIndexes.includes(index);

    if (multiple) {
      if (isOpen && openIndexes.length > 1) {
        setOpenIndexes((prev) => prev.filter((i) => i !== index));
      } else if (!isOpen) {
        setOpenIndexes((prev) => [...prev, index]);
      }
    } else {
      if (!isOpen) {
        setOpenIndexes([index]);
      }
    }
  };

  return (
    <div className="w-full relative min-w-md mx-auto rounded-md space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        const contentRef = (el: HTMLDivElement | null) => {
          contentRefs.current[index] = el;
        };

        return (
          <div key={index} className="border border-gray-200">
            <button
              className={clsx(
                "w-full flex justify-between border-l-2 border-gray-300 items-center px-4 py-3 text-left text-gray-800 font-medium hover:bg-gray-100 transition",
                {
                  "border-gray-600": isOpen,
                },
              )}
              onClick={() => toggle(index)}
            >
              <div className="flex flex-col">
                {item.title}
                {item.subtitle && (
                  <span className="text-gray-400 font-normal text-sm">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <BiChevronDown
                className={clsx("h-5 w-5 transition-transform", {
                  "rotate-180": isOpen,
                })}
              />
            </button>

            <div
              ref={contentRef}
              className="grid transition-all duration-300 ease-in-out border-l-2 border-gray-300"
              style={{
                gridTemplateRows: isOpen ? `auto` : "0px",
                overflow: isOpen ? "visible" : "hidden",
                opacity: isOpen ? 1 : 0,
                borderColor: isOpen ? "#4B5563" : "#D1D5DB",
              }}
            >
              <div className="px-4 py-2 text-sm text-gray-600">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
