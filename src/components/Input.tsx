import React from "react";
import { useEffect, useState } from "react";
function Input(props: any) {
  const [error, set_error] = useState("");
  const validator = props.validator
    ? props.validator
    : props.required
      ? (a: any) => (a === "" ? props.name + " is required" : "")
      : (a: any) => "";
  useEffect(() => {
    if (validator) {
      set_error(validator(""));
      props.add_error(props.name, validator(value || ""));
      set_error(validator(value || ""));
    } //eslint-disable-next-line
  }, []);

  useEffect(() => {
    set_value(props.value);
  }, [props.value]);
  // here need to set some default value to avoid uncontroll component error for that i just add empty string
  // https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
  const [value, set_value] = useState(props?.value || "");

  return (
    <div className="my-2">
      <label
        className={
          "block leading-6 " + props.labelStyle
            ? props.labelStyle
            : " text-sm font-medium text-start text-gray-900"
        }
      >
        {props.name || ""}
      </label>
      <div className="relative mt-2 rounded-md shadow">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm ">{props.prefix}</span>
        </div>
        <input
          autoComplete="off"
          step={props.step}
          onChange={(e) => {
            if (props.type === "number") {
              if (e.target.value.length > props.maxLength) {
                set_value(
                  (e.target.value = e.target.value.slice(0, props.maxLength)),
                );
              }
            }
            set_value(e.target.value);
            if (props.maxAmount) {
              if (e.target.value > props.maxAmount) {
                set_value((e.target.value = props.maxAmount));
              }
            }
            if (props.minAmount) {
              if (e.target.value < props.minAmount) {
                set_value((e.target.value = props.minAmount));
              }
            }

            if (props.onChange) props.onChange(props.name, e.target.value, e);
            if (validator) {
              set_error(validator(e.target.value));
              props.add_error(props.name, validator(e.target.value));
            }
          }}
          name={props.name}
          id={props.name}
          value={value}
          type={props.type || "text"}
          className={
            (props.prefix ? " pl-10" : "pl-4") +
            " mr-0 text-[smaller] block w-full rounded-md border-0 text-sm py-1.5 outline-none pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 leading-fee-5 " +
            (!(props.validate && error) ? " " : " ring-2 ring-red-500")
          }
          placeholder={props.placeholder}
          disabled={props.disabled}
          maxLength={props.maxLength}
          min={props.min}
          max={props.max}
          onKeyDown={props?.onKeyDown}
          onPaste={props?.onPaste}
          pattern={props?.pattern}
        />
        <div
          onClick={props?.prefixClick}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        >
          <span className="text-gray-500 sm:text-sm  cursor-pointer">
            {props?.postfix}
          </span>
        </div>
      </div>
      <span className="text-red-500 text-[13px]">
        {props.validate ? error : ""}
      </span>
    </div>
  );
}

export default Input;
