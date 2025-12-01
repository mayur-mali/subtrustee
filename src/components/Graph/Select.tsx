import { Fragment, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Select({
  options,
  label,
  selected,
  setSelected,
  className,
  labelStyle,
  selectedValueStyle,
}: {
  options: any[];
  label?: string;
  selected?: any;
  setSelected?: any;
  className?: string;
  labelStyle?: string;
  selectedValueStyle?: string;
}) {
  const people: any[] = options;
  useEffect(() => {
    if (!selected) setSelected(people[0]);

    // eslint-disable-next-line
  }, []);

  return (
    <div className={"block " + className}>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <Listbox.Label
              className={
                "block  text-sm font-medium leading-6 text-gray-900 " +
                labelStyle
                  ? labelStyle
                  : " text-sm font-medium text-gray-900 "
              }
            >
              {label}
            </Listbox.Label>
            <div className="relative">
              <Listbox.Button
                className={
                  "relative w-full cursor-default rounded-md  text-left  focus:outline-none " +
                  (selectedValueStyle
                    ? selectedValueStyle
                    : " text-[#7E6AF6] font-medium text-sm py-1.5 pr-10")
                }
              >
                <span className="flex items-center ">
                  {/* <img src={selected.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" /> */}
                  <span className="ml-2 text-[14px] block truncate">
                    {selected?.name === "totalTransactionAmount"
                      ? "Total Transaction Amount"
                      : selected?.name === "transactionCount"
                        ? "Transaction Count"
                        : selected.name}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="text-[#717171] w-4 cursor-pointer"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className=" absolute  z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-[#F8FAFB] py-1 text-xs shadow ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {people.map((person) => (
                    <Listbox.Option
                      key={person.id}
                      className={({ active }) =>
                        classNames(
                          active ? "text-gray-900" : "text-gray-900",
                          "relative cursor-pointer hover:bg-gray-200 text-[14px] select-none py-2 pl-3 ",
                        )
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            {/* <img src={person.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" /> */}
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "block truncate",
                              )}
                            >
                              {person.name}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-indigo-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4",
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}
