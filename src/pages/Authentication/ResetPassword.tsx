import React, { useEffect, useState } from "react";
// lightweight JWT payload decode (no external dependency)
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { RESET_PASSWORD, VERIFY_TOKEN } from "../../Qurries";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import LogoSvg from "../../assets/voice_control_ofo1.svg";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token") || "";
  const { data } = useQuery(VERIFY_TOKEN, {
    variables: { token },
    skip: !token,
  });

  useEffect(() => {
    if (data && !data.verifyToken.active) {
      toast.error("Link Expire redirecting to login page");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [data, token, navigate]);
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token) as any;
      setEmail(decodedToken.email);
    }
  }, [token]);

  const isResetButtonDisabled = password === "" || password !== confirmPassword;

  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await resetPasswordMutation({ variables: { email, password } });
      const msg = data?.resetPassword?.msg || "Password reset successfully!";
      toast.success(msg + " Redirecting to login.");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password", error.message);
      toast.error("Error resetting password. Try again later.");
    }
  };

  return (
    <div className="w-full h-screen grid gap-x-8 lg:!grid-cols-5 grid-cols-1">
      <div className=" col-span-2 w-full flex flex-col lg:items-start items-center md:p-20 px-10 py-20 bg-[#eceefa] xl:rounded-r-[20px]">
        <div></div>
        <div className="mt-20">
          <h3 className="font-bold text-2xl">Reset your password</h3>
        </div>

        <form onSubmit={handleResetPassword} className="md:max-w-[25rem] w-full space-y-4 mt-12">
          <div className="flex flex-col gap-y-2">
            <label className="capitalize font-medium text-base" htmlFor="emailId">
              email
            </label>
            <div className="bg-white w-full border border-gray-200 rounded-lg overflow-hidden">
              <input type="email" className="w-full p-3 px-4 focus:outline-none" id="emailId" required value={email} readOnly />
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="capitalize font-medium text-base" htmlFor="password">
              Password
            </label>
            <div className="bg-white w-full border border-gray-200 rounded-lg overflow-hidden">
              <input type="password" className="w-full p-3 px-4 focus:outline-none" id="password" onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required />
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <label className="capitalize font-medium text-base" htmlFor="confirm">
              Confirm Password
            </label>
            <div className="bg-white w-full border border-gray-200 rounded-lg overflow-hidden">
              <input type="password" className="w-full p-3 px-4 focus:outline-none" id="confirm" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
            </div>
          </div>
          {isResetButtonDisabled ? (
            <button className="bg-gray-300 text-gray-600 w-full px-4 py-3 mt-4 rounded-lg" disabled>
              Reset
            </button>
          ) : (
            <div className="bg-[#d6daf3]  mt-4 rounded-lg">
              <button className=" w-full  px-4 py-3" type="submit">
                Reset
              </button>
            </div>
          )}
        </form>
      </div>
      <div className="col-span-3 w-full hidden lg:flex items-center px-32 justify-center">
        <img src={LogoSvg} className="w-full h-full" alt="" />
      </div>
    </div>
  );
};

export default ResetPassword;
