import React, { useContext, useEffect, useState } from "react";
import OTPInput from "../../../components/Otp/OTPInput";
import changePassword from "../../../assets/changePassword.svg";
import { useMutation } from "@apollo/client";
import { SEND_OTP, VERIFY_PASSWORD_OTP } from "../../../Qurries";
import { toast } from "react-toastify";
import ProfileNav from "../Profile/ProfileNav";
import CopyRight from "../../../components/CopyRight";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const [sendOtpForSubtrustee, { loading: sendOtpLoading }] =
    useMutation(SEND_OTP);
  const [verifyPasswordOtpForSubtrustee] = useMutation(VERIFY_PASSWORD_OTP);
  const { user } = useAuth();

  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (password === "" && confirmPassword === "") {
      localStorage.removeItem("passwordChange");
      return;
    }

    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      event.returnValue = "Changes will not be saved";
    };

    localStorage.setItem("passwordChange", "true");

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [password, confirmPassword]);

  return (
    <div className="p-[25px] min-h-screen -mt-20 pt-[6rem] flex flex-col">
      <div className="bg-[#F6F8FA] w-[100%] h-[100%] p-8 rounded-[6px]">
        <div className="flex flex-col lg:!flex-row h-[100%] pt-[40px]">
          <ProfileNav user={user?.role} />
          <div className="flex-1 lg:pl-56 lg:mt-0 mt-4 flex">
            <div className="lg:!w-[50%] w-full">
              <div className="relative w-full">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="floating_outlined-1"
                  className="bg-[#F6F8FA] block px-4 py-1.5 h-[48px]  w-full text-sm text-gray-900 border-[1.5px] border-[#B8C0CD] rounded-[6px] appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#6687FF] peer"
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <label
                  htmlFor="floating_outlined-1"
                  className="bg-[#F6F8FA] absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  New Password
                </label>
                <div className="absolute right-[12px] top-[12px]">
                  {passwordVisible ? (
                    <FaEyeSlash
                      className="cursor-pointer size-5"
                      onClick={() => setPasswordVisible(false)}
                    />
                  ) : (
                    <FaEye
                      className="cursor-pointer size-5"
                      onClick={() => setPasswordVisible(true)}
                    />
                  )}
                </div>
              </div>

              <div className="relative w-full mt-[20px]">
                <input
                  type="text"
                  id="floating_outlined-2"
                  className="block px-4 py-1.5 h-[48px] w-full text-sm text-gray-900 bg-transparent border-[1.5px] border-[#B8C0CD] rounded-[6px] appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-[#6687FF] peer"
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
                <label
                  htmlFor="floating_outlined-2"
                  className="bg-[#F6F8FA] absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Confirm New Password
                </label>
              </div>

              <button
                className="rounded-[4px] text-white px-6 text-[14px] py-2 bg-[#1E1B59] mt-[40px]"
                onClick={async () => {
                  if (password === "") {
                    toast.error("Password cannot be empty");
                    return;
                  }
                  if (password !== confirmPassword) {
                    toast.error("Password does not match");
                    return;
                  }

                  const res = await sendOtpForSubtrustee({
                    variables: {
                      type: "reset",
                    },
                  });

                  if (res?.data?.sendOtpForSubtrustee) {
                    toast.success("OTP send successfully");
                    setShowOtp(true);
                  }
                }}
              >
                {sendOtpLoading ? "Sending OTP..." : "Change Password"}
              </button>

              {showOtp && (
                <>
                  <p className="mt-[30px] text-[14px] font-[400] text-[#1B163B]">
                    OTP has been sent to your registered email
                  </p>
                  <p className="text-[14px] font-[400] text-[#1B163B] mb-[30px]">
                    {user?.email}
                  </p>

                  <OTPInput
                    length={6}
                    onComplete={async (otp: any) => {
                      if (password === "") {
                        toast.error("Password cannot be empty");
                        return;
                      }
                      if (otp === "") {
                        toast.error("OTP cannot be empty");
                        return;
                      }
                      if (password !== confirmPassword) {
                        toast.error("Password does not match");
                        return;
                      }

                      const res = await verifyPasswordOtpForSubtrustee({
                        variables: {
                          otp: otp,
                          password: password,
                        },
                      });

                      if (res.data.verifyPasswordOtpForSubtrustee) {
                        setConfirmPassword("");
                        setPassword("");
                        toast.success(res.data.verifyPasswordOtpForSubtrustee);
                      }

                      setShowOtp(false);
                    }}
                    reSend={async () => {
                      return await sendOtpForSubtrustee({
                        variables: {
                          type: "reset",
                        },
                      });
                    }}
                    btnText={"Confirm"}
                    cancel={() => {
                      setPassword("");
                      setConfirmPassword("");
                      setShowOtp(false);
                    }}
                  />
                </>
              )}
            </div>
            <div className="w-[50%] lg:flex hidden items-center justify-center">
              <img src={changePassword} alt="" className="" />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <CopyRight />
      </div>
    </div>
  );
};

export default ChangePassword;
