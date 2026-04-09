import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USER, LOG_IN_TRUSTEE, RESET_MAILS } from "../../Qurries";
import { toast } from "react-toastify";
import Modal from "../../components/Modal/Modal";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import EdvironLogo from "../../assets/logo.svg";
import LogoSvg from "../../assets/voice_control_ofo1.svg";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMutation, { loading }] = useMutation(LOG_IN_TRUSTEE);
  const [fetchUser] = useLazyQuery(GET_USER);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [resetMailsMutation] = useMutation(RESET_MAILS);
  const handleLogin = async () => {
    try {
      const data = await loginMutation({ variables: { email, password } });
      const token = data.data?.subTrusteeLogin?.token;
      localStorage.setItem("token", token);
      const userData = await fetchUser();
      if (userData.data?.getSubTrusteeQuery) {
        login(token, userData.data.getSubTrusteeQuery);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  const resetPass = async (email: string) => {
    try {
      setShowLoadingModal(true);
      const { data } = await resetMailsMutation({ variables: { email } });
      if (data && data.resetMails && data.resetMails.active) {
        setShowLoadingModal(false);
        toast.success("Password reset email sent successfully.");
        setShowModal(false);
      } else {
        setShowLoadingModal(false);
        toast.error("Error sending reset email. Please check your email.");
      }
    } catch (error: any) {
      setShowLoadingModal(false);
      console.error("Error sending reset email:", error.message);
      toast.error("Error sending reset email. Try again later.");
    }
  };
  return (
    <div className="w-full h-screen grid gap-x-8 lg:!grid-cols-5 grid-cols-1">
      <div className=" col-span-2 w-full flex flex-col lg:items-start items-center md:p-20 px-10 py-20 bg-[#eceefa] xl:rounded-r-[20px]">
        <div>
          <img src={EdvironLogo} className="w-50 h-full" alt="Edviron log" />
        </div>
        <div className="mt-20">
          <h3 className="font-bold text-2xl">Sign in to your account</h3>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleLogin();
          }}
          className="md:max-w-[25rem] w-full space-y-4 mt-12"
        >
          <div className="flex flex-col gap-y-2">
            <label
              className="capitalize font-medium text-base"
              htmlFor="emailId"
            >
              Email
            </label>
            <div className="bg-white w-full border border-gray-200 rounded-lg overflow-hidden">
              <input
                type="email"
                className="w-full p-3 px-4 focus:outline-none"
                id="emailId"
                placeholder="email@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <label
              className="capitalize font-medium text-base"
              htmlFor="password"
            >
              Password
            </label>
            <div className="bg-white flex items-center pr-3 w-full border border-gray-200 rounded-lg overflow-hidden">
              <input
                type={passwordVisible ? "text" : "password"}
                className="w-full p-3 px-4 focus:outline-none"
                id="password"
                placeholder="enter password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
          <div>
            <button
              type="submit"
              className="bg-[#d6daf3] w-full cursor-pointer px-4 py-3 mt-4 rounded-lg"
            >
              {loading ? (
                <FaSpinner className=" animate-spin mx-auto size-6" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
        <div className="md:max-w-[25rem] w-full mt-2">
          <button
            onClick={() => setShowModal(!showModal)}
            className="bg-[#d6daf3] w-full px-4 py-3 mt-4 rounded-lg"
          >
            Reset Password
          </button>
        </div>
      </div>
      <Modal
        className="max-w-lg w-full"
        open={showModal}
        setOpen={setShowModal}
        title="Reset Password"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await resetPass(resetEmail);
            } catch (error: any) {
              console.error("Error sending reset email:", error.message);
            }
          }}
        >
          <input
            type="email"
            name="Email"
            placeholder="Enter Email"
            className="w-full p-3 px-4 focus:outline-none"
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />

          <div className="mt-2 mb-2 text-center">
            <button className="bg-[#d6daf3] w-full px-4 py-3 mt-4 rounded-lg">
              Send Email
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        className="max-w-lg w-full"
        open={showLoadingModal}
        setOpen={setShowLoadingModal}
      >
        <div className="w-full h-full flex">
          <FaSpinner className="m-auto animate-spin size-8" />
        </div>
      </Modal>
      {/* <Modal
        className="max-w-lg w-full"
        open={showLoadingModal}
        setOpen={setShowLoadingModal}
      >
        <div className="w-full h-full flex">
          <img className="m-auto" src={loadIcond} alt="" />
        </div>
      </Modal> */}
      <div className="col-span-3 w-full hidden lg:flex items-center px-32 justify-center">
        <img src={LogoSvg} className="w-full h-full" alt="" />
      </div>
    </div>
  );
}

export default Login;
