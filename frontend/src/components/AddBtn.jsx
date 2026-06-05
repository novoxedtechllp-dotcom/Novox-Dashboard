import React from "react";
import {
  MdOutlinePersonAddAlt,
  MdPersonAddAlt,
  MdClose,
} from "react-icons/md";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const overlayStyles = {
  backgroundColor: "#222121c4",
  backdropFilter: "blur(2px)",
};

const AddBtn = ({ title}) => {
  return (
    <div>
      <Popup
        modal
        overlayStyle={overlayStyles}
        contentStyle={{
          borderRadius: "12px",
          padding: "0",
          overflow: "hidden",
          width: "500px",
          maxWidth: "95%",
        }}
        trigger={
          <button className="flex items-center justify-center bg-blue-800 hover:bg-blue-600 text-white rounded-lg cursor-pointer w-[130px] h-9 md:w-[120px] md:h-8 sm:w-[100px] sm:h-[30px] transition-all">
            <MdOutlinePersonAddAlt className="text-xl md:text-base sm:text-sm mr-1" />
            <p className="font-bold text-sm md:text-xs sm:text-[10px]">
              {title}
            </p>
          </button>
        }
      >
        {(close) => (
          <>
            {/* Header */}
            <div className="flex flex-col w-full bg-white rounded-xl">
              <div className="flex items-center justify-between h-[60px] bg-slate-50 border-b border-gray-200 px-3">
                <div className="flex items-center gap-2">
                  <MdPersonAddAlt className="text-[28px] text-blue-500" />
                  <h1 className="text-xl md:text-lg font-semibold">
                    Add New Student
                  </h1>
                </div>

                <button
                  onClick={() => close()}
                  className="bg-transparent border-none cursor-pointer"
                >
                  <MdClose className="text-[28px] text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="flex flex-col p-4">
                <label className="text-sm font-semibold mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="Python"
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                />

                <label className="text-sm font-semibold mb-1">
                  Duration
                </label>
                <input
                  type="digit"
                  placeholder="Months"
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                />

                <label className="text-sm font-semibold mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  placeholder="+1 000 000 0000"
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                />

                <label className="text-sm font-semibold mb-1">
                  Mentor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Smith"
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                />
              </div>
            </div>

            {/* Footer */}
            <hr className="border-gray-300" />

            <div className="flex justify-end items-center gap-3 h-[70px] bg-slate-100 px-4">
              <button
                type="button"
                onClick={() => close()}
                className="h-10 px-6 border border-slate-300 rounded-lg text-gray-500 font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>

              <button className="h-10 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
                Add Course
              </button>
            </div>
          </>
        )}
      </Popup>
    </div>
  );
};

export default AddBtn;