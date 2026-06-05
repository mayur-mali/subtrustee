import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const OTPInput = ({
  length = 4,
  onComplete,
  reSend,
  btnText = "Confirm",
  cancel,
}: any) => {
  const inputRef = useRef<HTMLInputElement[]>(Array(length).fill(null));
  const [OTP, setOTP] = useState<string[]>(Array(length).fill(""));
  const [isOtpSet, setIsOtpSet] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const handleTextChange = (input: string, index: number, length: number) => {
    const newPin = [...OTP];
    newPin[index] = input;
    setOTP(newPin);

    let set = 1;
    for (let i = 0; i < length; i++) {
      if (newPin[i] === "") set = 0;
    }

    setIsOtpSet(set === 1);

    if (input.length === 1 && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }
    if (input.length === 0 && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  let duration: number = 180;

  const [minute, setMinute] = useState("03");
  const [second, setSecond] = useState("00");

  useEffect(() => {
    let timer: any;
    if (isActive) {
      timer = setInterval(() => {
        let minutes: any = Math.floor(duration / 60);
        let seconds: any = duration % 60;

        if (seconds < 10) {
          seconds = "0" + seconds;
        }

        duration--;
        if (duration === -1) {
          setIsActive(false);
        }

        setMinute(minutes);
        setSecond(seconds);
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isActive]);

  const handlePaste = (paste_string: string, index: number, length: number) => {
    let newPin = [...OTP];
    for (
      let i = index;
      i < Math.min(length, index + paste_string.length);
      i++
    ) {
      newPin[i] = paste_string[i];
    }

    let set = 1;
    for (let i = 0; i < length; i++) {
      if (newPin[i] === "") set = 0;
    }

    setIsOtpSet(set === 1);

    setOTP(newPin);
  };

  return (
    <div>
      <div className={`flex`}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={OTP[index]}
            onChange={(e) => handleTextChange(e.target.value, index, length)}
            onPaste={(e) =>
              handlePaste(e.clipboardData.getData("text"), index, length)
            }
            ref={(ref) => {
              inputRef.current[index] = ref as HTMLInputElement;
            }}
            className={`bg-[#F0F0F0] text-[14px] focus:border-blue-600 p-3 text-center rounded-[6px] outline-none w-[48px] mr-[5px]`}
            style={{ marginRight: index === length - 1 ? "0" : "10px" }}
          />
        ))}
      </div>
      <p className={`text-[14px] mt-[20px] ${isActive ? "text-gray-400" : ""}`}>
        Didn’t receive OTP yet?
        <span
          className={`text-[#6687FF] ${!isActive ? "cursor-pointer" : "text-gray-400"}`}
          onClick={async () => {
            if (!isActive) {
              const res = await reSend();
              if (res.data.sendOtp) {
                toast.success("OTP resend succussfully");
              }
              setIsActive(true);
              duration = 180;
            }
          }}
        >
          {" "}
          Resend OTP
        </span>
      </p>
      <p className="text-[14px]">
        {minute}:{second}
      </p>

      <div className="flex justify-end">
        {cancel && (
          <button
            className={`rounded-[6px] border-[#717171] border-[1px] text-[14px] text-[#717171] py-[8px] w-[109px] mr-[10px]`}
            onClick={() => {
              cancel();
            }}
          >
            Cancel
          </button>
        )}
        <button
          className={`rounded-[6px] ${!isOtpSet ? "bg-gray-400" : "bg-[#1E1B59]"} text-white text-[14px] py-[8px] w-[109px]`}
          disabled={!isOtpSet}
          onClick={() => {
            onComplete(OTP.join(""));
          }}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};

export default OTPInput;
