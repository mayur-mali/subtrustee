import { AiFillHome } from "react-icons/ai";
import { Sidebar, SidebarItem } from "../../components/navigation/Sidebar";
import { FaSchool } from "react-icons/fa";
import { CiReceipt } from "react-icons/ci";
import { BiLogInCircle } from "react-icons/bi";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navigation/Navbar";
import { toast } from "react-toastify";

export const handleCopyContent = (content: any) => {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch((err) => {
      toast.error("Error while copying");
    });
};
function Dashboard() {
  const [menu, setMenu] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="dashboard flex w-full">
      <div className="h-full ">
        <Sidebar
          schoolName={"Edviron"}
          Link={NavLink}
          menu={menu}
          setMenu={setMenu}
          //setDevMenu={setDevMenu}
        >
          <SidebarItem
            icon={<AiFillHome className={"text-lg"} />}
            name="Home"
            to="/"
          />
          <SidebarItem
            icon={<FaSchool className={"text-lg"} />}
            name="Institute"
            to="/institute"
          />

          <SidebarItem
            icon={<CiReceipt className={"text-lg"} />}
            name="Payments"
            to="/payments"
          />

          <SidebarItem
            className="mt-auto"
            icon={<BiLogInCircle className={"text-lg"} />}
            name="Log Out"
            onTap={logout}
          />
        </Sidebar>
      </div>
      <div
        className={
          "flex flex-col overflow-hidden flex-1 relative  w-full bg-[#EDF1F4] pl-[5rem]"
        }
      >
        <Navbar />
        <div className="flex flex-col transition-transform pt-[3.2rem] min-h-screen duration-200">
          <div className="flex overflow-hidden flex-col w-full  z-10 lg:pr-8 pr-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
