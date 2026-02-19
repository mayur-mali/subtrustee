import React, { useEffect, useState } from "react";
import { RiAccountPinCircleFill } from "react-icons/ri";
import { useQuery } from "@apollo/client";
import { GET_USER } from "../../../Qurries";

type Merchant = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  user?: string;
  bank_details?: {
    account_holder_name?: string;
    account_number?: string;
    ifsc_code?: string;
  };
};

const Profile = () => {
  const { data } = useQuery(GET_USER);

  const [merchant, setMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    if (data?.getSubTrusteeQuery) {
      setMerchant(data.getSubTrusteeQuery);
    }
  }, [data]);

  const capitalizeFirstLetter = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "N/A";

  return (
    <div className="p-[25px] min-h-screen -mt-20 pt-[6rem] flex flex-col">
      <div className="bg-[#F6F8FA] w-full h-full p-8 rounded-[6px]">
        <h2 className="text-edviron_black font-bold">My Account</h2>

        <div className="flex h-full flex-col pt-[40px]">
          <div className="flex-1 flex flex-col lg:items-center lg:mt-0 mt-4 relative">
            <div className="w-[90%] flex justify-between py-[20px] bg-[#F6F8FA] profile-shadow px-[40px] rounded-[20px]">
              <div className="relative flex items-center content-center">
                <RiAccountPinCircleFill size={70} />
                <div className="ml-[20px]">
                  <p className="text-[#1B163B] font-[600] text-[14px]">
                    {capitalizeFirstLetter(merchant?.name)}
                  </p>

                  <p className="text-[#717171] text-[12px]">
                    {merchant?.role || "N/A"}
                  </p>

                  <p className="text-[#1B163B] text-[14px]">
                    {merchant?.user || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-[90%] grid lg:!grid-cols-2 grid-cols-1 py-[20px] px-[40px] bg-[#F6F8FA] profile-shadow rounded-[20px] mt-5">
              <div className="py-[10px]">
                <p className="text-[#767676] text-[12px]">Email</p>
                <p className="text-[#1B163B] text-[14px]">
                  {merchant?.email || "N/A"}
                </p>
              </div>

              <div className="py-[10px]">
                <p className="text-[#767676] text-[12px]">Position</p>
                <p className="text-[#1B163B] text-[14px]">
                  {capitalizeFirstLetter(merchant?.role)}
                </p>
              </div>

              <div className="py-[10px]">
                <p className="text-[#767676] text-[12px]">Contact</p>
                <p className="text-[#1B163B] text-[14px]">
                  {merchant?.phone || "N/A"}
                </p>
              </div>
            </div>

            <p className="mt-auto text-[10px] text-[#767676]">
              Your personal information is securely guarded and treated with the
              utmost confidentiality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
