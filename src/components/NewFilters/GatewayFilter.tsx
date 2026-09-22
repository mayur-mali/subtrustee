import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface GatewayFilterProps {
  selectedGateway: string;
  onGatewayChange: (val: string) => void;
  gatewaysList?: string[];
  id?: string;
  allValue?: string;
  placeholder?: string;
}

export function GatewayFilter({
  selectedGateway,
  onGatewayChange,
  gatewaysList = ["All Gateways", "Razorpay", "PayU", "Cashfree", "Stripe"],
  id = "gateway-filter-wrapper",
  allValue = "All Gateways",
  placeholder = "Gateways",
}: GatewayFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-sans" ref={containerRef} id={id}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white hover:bg-[#F9FAFB] border border-[#D0D5DD] px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#344054] shadow-sm transition-colors cursor-pointer"
        id="gateway-filter-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>
          {selectedGateway === allValue ? placeholder : selectedGateway}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#475467] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-48 bg-white border border-[#EAECF0] rounded-xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-in fade-in-50 duration-100"
          id="gateway-filter-listbox"
          role="listbox"
        >
          {gatewaysList.map((gateway) => (
            <li key={gateway}>
              <button
                type="button"
                onClick={() => {
                  onGatewayChange(gateway);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedGateway === gateway
                    ? "bg-[#F2F4F7] text-[#101828] font-semibold"
                    : "text-[#344054] hover:bg-[#F9FAFB]"
                }`}
                role="option"
                aria-selected={selectedGateway === gateway}
              >
                {gateway}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
