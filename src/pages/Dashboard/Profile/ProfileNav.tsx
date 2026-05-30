import React from "react";
import { NavLink } from "react-router-dom";

function ProfileNav({ user }: any) {
  return (
    <div className="flex lg:fixed z-50 lg:min-h-[65vh] pr-4 lg:flex-col gap-x-4 flex-row lg:border-r-[0.5px] border-r-[#dbd9d9] shrink-0 w-full lg:!w-[200px]">
      <div className="h-10">
        <h2 className="text-edviron_black font-bold sticky top-4">
          My Account
        </h2>
      </div>

      <NavLink
        className={({ isActive }) =>
          isActive
            ? "bg-[#6687FF33] py-2 rounded-lg md:text-[14px] text-[12px] text-left px-5 text-[#1B163B] mt-[10px]"
            : " py-2 rounded-lg md:text-[14px] text-[12px] text-left px-5 text-[#717171] mt-[10px]"
        }
        to="/profile"
      >
        Profile
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          isActive
            ? "bg-[#6687FF33] py-2 rounded-lg md:text-[14px] text-[12px] text-left px-5 text-[#1B163B] mt-[10px]"
            : " py-2 rounded-lg md:text-[14px] text-[12px] text-left px-5 text-[#717171] mt-[10px]"
        }
        to="/team-members"
      >
        Team Members
      </NavLink>
    </div>
  );
}

export default ProfileNav;
