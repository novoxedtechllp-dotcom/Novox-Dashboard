import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  CalendarDays,
  ChevronDown,
  User,
  Star,
  MessageSquare,
} from "lucide-react";

const DailySchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const sessions = [
    {
      status: "COMPLETED",
      time: "08:30 AM - 10:00 AM",
      course: "CS204: MERN Stack Development",
      description: "Building Scalable APIs with Node.js and Express",
      mentor: "Dr. Sarah Jenkins",
    },
    {
      status: "COMPLETED",
      time: "10:30 AM - 12:00 PM",
      course: "PHY301: Advanced Physics",
      description: "Quantum Mechanics and Wave-Particle Duality",
      mentor: "Prof. Michael Chen",
    },
    {
      status: "IN PROGRESS",
      time: "01:00 PM - 02:30 PM",
      course: "HUM101: Modern Philosophy",
      description: "Existentialism in the 21st Century",
      mentor: "Prof. Michael Chen",
    },
  ];

  return (
    <div className="w-full p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0B4A99]">
          Daily Schedule
        </h1>

        {/* Date Picker */}
        <div className="mt-2 flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-500" />

          <div className="relative inline-flex items-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM dd, yyyy"
              className="bg-transparent text-gray-600 text-sm outline-none cursor-pointer pr-5"
            />

            <ChevronDown
              size={16}
              className="absolute right-0 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-5">
        {sessions.map((session, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            {/* Top Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
              {/* Left Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      session.status === "IN PROGRESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {session.status}
                  </span>

                  <span className="text-sm font-semibold text-gray-700">
                    {session.time}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {session.course}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {session.description}
                </p>
              </div>

              {/* Mentor */}
              <div className="flex items-center gap-3 min-w-fit">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <User size={18} className="text-blue-700" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Mentor</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {session.mentor}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-[#0B4A99] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#083B7D] transition">
                <Star size={14} />
                Rate Session
              </button>

              <button className="flex items-center gap-2 border border-[#0B4A99] text-[#0B4A99] px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition">
                <MessageSquare size={14} />
                Give Feedback
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailySchedule;