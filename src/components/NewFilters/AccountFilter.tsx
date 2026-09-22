import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface AccountFilterProps {
  selectedAccount: string;
  onAccountChange: (val: string) => void;
  accountsList?: string[];
  id?: string;
}

export function AccountFilter({
  selectedAccount,
  onAccountChange,
  accountsList = [
    "All Accounts",
    "Primary HDFC",
    "Secondary ICICI",
    "Sponsor Account",
  ],
  id = "account-filter-wrapper",
}: AccountFilterProps) {
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
        id="account-filter-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>
          {selectedAccount === "All Accounts" ? "Accounts" : selectedAccount}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#475467] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-2 w-52 bg-white border border-[#EAECF0] rounded-xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-in fade-in-50 duration-100"
          id="account-filter-listbox"
          role="listbox"
        >
          {accountsList.map((account) => (
            <li key={account}>
              <button
                type="button"
                onClick={() => {
                  onAccountChange(account);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                  selectedAccount === account
                    ? "bg-[#F2F4F7] text-[#101828] font-semibold"
                    : "text-[#344054] hover:bg-[#F9FAFB]"
                }`}
                role="option"
                aria-selected={selectedAccount === account}
              >
                {account}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
