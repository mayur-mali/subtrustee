import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function ConfirmationBox({
  setOpen,
  funtion,
  confirmationText,
  ButtonText,
  closeOnSuccess = true,
  isDanger = true,
  closeText,
  loading = false,
}: any) {
  return (
    <div className="w-11/12 z-50 m-auto text-center">
      {closeText ? (
        <div className="mt-10"> {closeText}</div>
      ) : (
        <div className="mt-10">
          {" "}
          Are you sure you want to {confirmationText}?
        </div>
      )}

      <div className="mt-10 mb-10 grid grid-cols-2 gap-4">
        <button
          onClick={() => setOpen(false)}
          className={`py-1 px-4 rounded-md bg-[#F8FAFB] ${
            isDanger
              ? "text-red-400 border-2 border-red-200"
              : "text-blue-400 border-2 border-blue-200"
          } outline-none`}
        >
          Cancel
        </button>

        <button
          disabled={loading}
          onClick={async () => {
            funtion();
            if (closeOnSuccess) setOpen(false);
          }}
          className={`py-2 h-10 text-white px-10 rounded-lg ${
            isDanger
              ? "hover:bg-red-400 bg-red-300"
              : "hover:bg-blue-400 bg-blue-300"
          }`}
        >
          {loading && loading ? (
            <AiOutlineLoading3Quarters className="text-lg text-center mx-auto animate-spin" />
          ) : (
            ButtonText
          )}
        </button>
      </div>
    </div>
  );
}

export default ConfirmationBox;
