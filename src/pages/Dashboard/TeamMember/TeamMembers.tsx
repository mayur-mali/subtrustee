/* eslint-disable react/jsx-pascal-case */
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import {
  CREATE_MEMBER,
  DELETE_MEMBER,
  GET_ALL_MEMBERS,
  UPDATE_ACCESS_LEVEL,
  UPDATE_MEMBER_DETAIL,
  RESET_MAIL,
} from "../../../Qurries";
import { toast } from "react-toastify";
import { _Table } from "../../../components/Table";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal/Modal";
import { FaRegEdit } from "react-icons/fa";
import Select from "react-select";
import ConfirmationBox from "../../../components/ConfermationBox";
import ProfileNav from "../Profile/ProfileNav";
import CopyRight from "../../../components/CopyRight";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { useAuth } from "../../../context/AuthContext";

export const Access = {
  ADMIN: "admin",
  MANAGEMENT: "management",
  OWNER: "owner",
} as const;

type Access = (typeof Access)[keyof typeof Access];

// Helper function to check if user has admin or owner permissions
const isAdminOrOwner = (role: string) => {
  return role === Access.ADMIN || role === Access.OWNER;
};

const Form = ({ children, onSubmit }: any) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return <form onSubmit={handleSubmit}>{children}</form>;
};

const SendResetMail = ({ email, setResetMemberPass }: any) => {
  const [resetMails, { loading, error }] = useMutation(RESET_MAIL);

  return (
    <ConfirmationBox
      setOpen={setResetMemberPass}
      loading={loading}
      closeOnSuccess={true}
      funtion={async () => {
        const res = await resetMails({
          variables: {
            email: email,
          },
        });

        if (res?.data.resetSubTrusteeMails.active) {
          toast.success("Reset mail sent successfully");
        }
      }}
      confirmationText="send reset mail"
      ButtonText="Send"
      isDanger={false}
    />
  );
};

const Action = ({
  data,
  setUpdateMemberOpen,
  setMemberData,
  role,
  setDeleteMemberOpen,
  setMemberUserId,
  setResetMemberMail,
  setResetMemberPass,
  setMemberUserName,
}: any) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <>
      {role === Access.MANAGEMENT ? (
        "-"
      ) : (
        <div
          className="relative cursor-pointer pl-3"
          onClick={() => setShowOptions(!showOptions)}
        >
          <IoEllipsisVerticalSharp />

          {showOptions && (
            <div
              className={`z-50 flex  flex-col fixed top-[-44px] right-[110px]`}
              onMouseLeave={() => setShowOptions(false)}
            >
              <button
                className={`py-1.5 ${
                  isAdminOrOwner(role) ? "bg-white" : "bg-gray-400"
                } w-[100%] rounded-t-md text-xs text-[#1B163B] hover:bg-slate-100  float-right px-6`}
                onClick={() => {
                  setUpdateMemberOpen(true);
                  setMemberData(data);
                }}
                disabled={!isAdminOrOwner(role)}
              >
                Edit
              </button>
              <button
                className={`py-1.5 ${
                  isAdminOrOwner(role) ? "bg-white" : "bg-gray-400"
                } text-xs text-red-400 hover:bg-slate-100  float-right px-6`}
                disabled={!isAdminOrOwner(role)}
                onClick={() => {
                  setDeleteMemberOpen(true);
                  setMemberUserId(data?._id);
                  setMemberUserName(data?.name);
                }}
              >
                Remove
              </button>
              <button
                className={`py-1.5 ${
                  isAdminOrOwner(role) ? "bg-white" : "bg-gray-400"
                } text-xs text-[#1B163B] hover:bg-slate-100 shadow rounded-b-md  float-right px-6`}
                disabled={!isAdminOrOwner(role)}
                onClick={() => {
                  setResetMemberMail(data?.email);
                  setResetMemberPass(true);
                }}
              >
                Reset Password
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const UpdateAccess = ({ user_id, refetch, setUpdateAccessShow }: any) => {
  const options = [
    { label: "Admin", value: Access.ADMIN },
    { label: "Management", value: Access.MANAGEMENT },
  ];

  const [selectedAccess, setSelectedAccess] = useState<any>(null);
  const [updateSubTrusteeMemberAccess, { loading, error }] =
    useMutation(UPDATE_ACCESS_LEVEL);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  return (
    <div className="flex flex-col items-center w-[100%] pt-[20px]">
      <div className="w-[80%]">
        <Select
          options={options}
          components={{
            IndicatorSeparator: () => null,
          }}
          onChange={(selectedOption: any) => {
            setSelectedAccess(selectedOption.value);
          }}
          styles={{
            control: (provided, state) => ({
              ...provided,
              fontSize: "12px",
            }),
            option: (provided, state) => ({
              ...provided,
              fontSize: "12px",
            }),
          }}
        />
      </div>
      <button
        className="bg-[#1E1B59] text-[14px] rounded-md text-white float-right px-[30px] py-[8px] mt-[20px]"
        onClick={async () => {
          if (!selectedAccess) {
            toast.error("Please select access type");
            return;
          }

          const res = await updateSubTrusteeMemberAccess({
            variables: {
              user_id: user_id,
              access: selectedAccess,
            },
          });

          if (
            res.data.updateSubTrusteeMemberAccess ===
            "Access level updated successfully"
          ) {
            toast.success("Access level updated");
            refetch();
            setUpdateAccessShow(false);
          }
        }}
      >
        Update Access
      </button>
    </div>
  );
};

const DeleteMember = ({
  user_id,
  refetch,
  setDeleteMemberOpen,
  memberUserName,
}: any) => {
  const [deleteMember, { loading: delete_loading, error: delete_error }] =
    useMutation(DELETE_MEMBER);

  return (
    <ConfirmationBox
      loading={delete_loading}
      closeOnSuccess={true}
      setOpen={setDeleteMemberOpen}
      funtion={async () => {
        const res = await deleteMember({
          variables: {
            user_id: user_id,
          },
        });

        if (res?.data.deleteSubTrusteeMember.includes("deleted successfully")) {
          toast.success("User removed successfully");
          refetch();
        }
      }}
      confirmationText={`Remove Access of ${memberUserName}`}
      ButtonText="Remove"
    />
  );
};

const TeamMember = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_ALL_MEMBERS);
  console.log(data);
  const [
    addSubTrusteeMember,
    { loading: addSubTrusteeMember_loading, error: addSubTrusteeMember_error },
  ] = useMutation(CREATE_MEMBER);
  const [
    updateSubTrusteeMember,
    {
      loading: updateSubTrusteeMember_loading,
      error: updateSubTrusteeMember_error,
    },
  ] = useMutation(UPDATE_MEMBER_DETAIL);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (addSubTrusteeMember_error) setNewMemberOpen(false);
  }, [addSubTrusteeMember_error]);

  useEffect(() => {
    if (updateSubTrusteeMember_error) setUpdateMemberOpen(false);
  }, [updateSubTrusteeMember_error]);

  const [newMemberOpen, setNewMemberOpen] = useState(false);
  const [updateMemberOpen, setUpdateMemberOpen] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  const [updateAccessShow, setUpdateAccessShow] = useState(false);
  const [memberUserId, setMemberUserId] = useState<any>(null);
  const [memberUserName, setMemberUserName] = useState<any>(null);

  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false);
  const [role, setRole] = useState<any>({ name: "Select role" });
  const [resetMemberPass, setResetMemberPass] = useState(false);
  const [resetMembermail, setResetMemberMail] = useState<any>(null);

  const role_map: any = {
    Admin: Access.ADMIN,
    Management: Access.MANAGEMENT,
  };

  // const column =
  //   user_data?.getSubTrusteeQuery?.role === Access.ADMIN ||
  //   user_data?.getSubTrusteeQuery?.role === Access.OWNER
  //     ? ["Name", "Email ID", "Mobile No.", "Level of Access", "Action"]
  //     : ["Name", "Email ID", "Mobile No.", "Level of Access"];

  return (
    <div className="p-[25px] -mt-20 pt-[6rem] flex flex-col min-h-[85vh]">
      <div className="bg-[#F6F8FA] p-8 rounded-[6px]">
        <div className="flex h-full flex-col lg:!flex-row  pt-[40px]">
          <Modal
            open={resetMemberPass}
            setOpen={setResetMemberPass}
            title="Reset Password"
          >
            <SendResetMail
              email={resetMembermail}
              setResetMemberPass={setResetMemberPass}
            />
          </Modal>
          <Modal
            open={deleteMemberOpen}
            setOpen={setDeleteMemberOpen}
            className="max-w-2xl"
            title="Remove Access"
          >
            <DeleteMember
              user_id={memberUserId}
              owner_mail={user?.email_id}
              refetch={refetch}
              setDeleteMemberOpen={setDeleteMemberOpen}
              memberUserName={memberUserName}
            />
          </Modal>
          <Modal
            open={updateAccessShow}
            setOpen={setUpdateAccessShow}
            title="Update Access"
          >
            <UpdateAccess
              user_id={memberUserId}
              refetch={refetch}
              setUpdateAccessShow={setUpdateAccessShow}
            />
          </Modal>
          <Modal
            open={updateMemberOpen}
            setOpen={setUpdateMemberOpen}
            title="Update Member Details"
          >
            <Form
              onSubmit={async (data: any) => {
                if (!data.Name && !data.Email && !data["Phone Number"]) {
                  toast.error("Details not modified");
                  return;
                }
                let temp = { ...memberData };
                setMemberData({ memberData, name: data.name });
                if (data.Name) temp["name"] = data.Name;
                if (data.Email) temp["email"] = data.Email;
                if (data["Phone Number"])
                  temp["phone_number"] = data["Phone Number"];

                const res = await updateSubTrusteeMember({
                  variables: {
                    name: temp.name,
                    user_id: memberData._id,
                    email: temp.email,
                    phone_number: temp.phone_number,
                  },
                });

                if (res?.data?.updateSubTrusteeMember) {
                  toast.success(res?.data?.updateSubTrusteeMember);
                  refetch();
                  setUpdateMemberOpen(false);
                }
              }}
            >
              <Input
                type="text"
                placeholder="Name"
                name="Name"
                value={memberData?.name}
                add_error={() => {}}
                required
              />
              <Input
                type="email"
                placeholder="Email ID"
                name="Email"
                value={memberData?.email}
                add_error={() => {}}
                required
              />
              <Input
                type="number"
                maxLength={10}
                placeholder="Phone No."
                name="Phone Number"
                value={memberData?.phone_number}
                add_error={() => {}}
                required
              />

              <div className="mt-6 mb-2 text-center">
                <button
                  type="submit"
                  className="py-3 px-6 max-w-[15rem] w-full rounded-md text-[14px] bg-[#1E1B59] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Update
                </button>
              </div>
            </Form>
          </Modal>
          <Modal
            open={newMemberOpen}
            setOpen={setNewMemberOpen}
            title="Add New Member"
          >
            <Form
              onSubmit={async (data: any) => {
                if (role.name === "select role") {
                  toast.error("Please select role");
                  return;
                }
                if (data.Password !== data["Confirm Password"]) {
                  toast.error("Password doest not match");
                  return;
                }

                const res = await addSubTrusteeMember({
                  variables: {
                    name: data.Name,
                    email: data.Email,
                    phone_number: data["Phone Number"],
                    access: role_map[role.name],
                    password: data.Password,
                  },
                });

                if (res?.data?.addSubTrusteeMember) {
                  toast.success(res?.data?.addSubTrusteeMember);
                  refetch();
                  setNewMemberOpen(false);
                }
              }}
            >
              <Input
                type="name"
                placeholder="Name"
                name="Name"
                add_error={() => {}}
                required
              />
              <Input
                type="email"
                placeholder="Email ID"
                name="Email"
                add_error={() => {}}
                required
              />
              <Input
                type="number"
                maxLength={10}
                placeholder="Phone No."
                name="Phone Number"
                add_error={() => {}}
                required
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={role.name}
                  onChange={(e) => setRole({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Select role">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <Input
                type="text"
                placeholder="Password"
                name="Password"
                add_error={() => {}}
                required
              />
              <Input
                type="text"
                placeholder="Confirm Password"
                name="Confirm Password"
                add_error={() => {}}
                required
              />

              <div className="mt-6 mb-2 text-center">
                <button
                  type="submit"
                  className="py-3 px-6 max-w-[15rem] w-full rounded-md bg-[#1E1B59] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </div>
            </Form>
          </Modal>

          <ProfileNav user={user?.role} />
          <div className="flex-1 lg:pl-56 flex flex-col items-center">
            {data?.getSubTrusteeMembers ? (
              <_Table
                className="bg-[#ffffff]"
                heading={"Your Team"}
                pagination={true}
                copyRight={false}
                minHeight="min-h-[60vh]"
                searchBox={
                  <div className="flex justify-end items-center gap-x-2 w-full">
                    <div className="flex ml-auto">
                      {isAdminOrOwner(user?.role) && (
                        <button
                          onClick={() => setNewMemberOpen(true)}
                          className={`py-2 ${
                            isAdminOrOwner(user?.role)
                              ? "bg-[#1E1B59]"
                              : "bg-gray-400"
                          } text-[14px] rounded-[4px] text-white float-right px-6 ml-2`}
                          disabled={!isAdminOrOwner(user?.role)}
                        >
                          + Add New Member
                        </button>
                      )}
                    </div>
                  </div>
                }
                data={[
                  [
                    "Name",
                    "Email ID",
                    "Mobile No.",
                    "Level of Access",
                    "Action",
                  ],
                  ...data?.getSubTrusteeMembers?.map((d: any, i: number) => [
                    <div className="trucate">{d?.name}</div>,
                    <div className="truncate">{d?.email}</div>,
                    <div>{d.phone_number}</div>,
                    <div className="flex justify-between max-w-[8rem] items-center">
                      <span className="mr-[5px] capitalize">
                        {d.access.replace("_", " ")}
                      </span>
                      <div
                        onClick={() => {
                          setUpdateAccessShow(true);
                          setMemberUserId(d?._id);
                        }}
                      >
                        {isAdminOrOwner(user?.role) && (
                          <FaRegEdit
                            style={{ color: "#717171", cursor: "pointer" }}
                          />
                        )}
                      </div>
                    </div>,
                    <Action
                      data={d}
                      setUpdateMemberOpen={setUpdateMemberOpen}
                      setMemberData={setMemberData}
                      role={user?.role}
                      setDeleteMemberOpen={setDeleteMemberOpen}
                      setMemberUserId={setMemberUserId}
                      setResetMemberMail={setResetMemberMail}
                      setResetMemberPass={setResetMemberPass}
                      setMemberUserName={setMemberUserName}
                    />,
                  ]),
                ]}
              />
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
      <div className="pt-4">
        <CopyRight />
      </div>
    </div>
  );
};

export default TeamMember;
