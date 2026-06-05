import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit3 } from 'lucide-react';

const EmployeeProfile = () => {
  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">My Profile</h2>
          <p className="text-slate-500 text-[14px] mt-1">Manage your personal and professional information</p>
        </div>
        <button className="bg-white border border-[#C2C6D4] text-slate-700 px-5 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Card */}
        <div className="col-span-1">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
            <div className="h-24 bg-[#003F87]"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md absolute -top-12 flex items-center justify-center text-[#003F87] overflow-hidden">
                <User size={48} />
              </div>
              <div className="mt-14">
                <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
                <p className="text-[14px] font-medium text-[#003F87]">Senior Instructor</p>
                <div className="flex items-center gap-1.5 mt-2 text-[13px] text-slate-500">
                  <MapPin size={14} /> New York, USA
                </div>
              </div>
              
              <div className="mt-6 space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[14px]">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-slate-700">john.doe@novox-edtech.com</span>
                </div>
                <div className="flex items-center gap-3 text-[14px]">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-slate-700">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-[14px]">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-slate-700">Joined Mar 2022</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-[#003F87]" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
                <p className="text-[15px] text-slate-800 font-medium">Johnathan Doe</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Date of Birth</p>
                <p className="text-[15px] text-slate-800 font-medium">15 Aug 1988</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Gender</p>
                <p className="text-[15px] text-slate-800 font-medium">Male</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nationality</p>
                <p className="text-[15px] text-slate-800 font-medium">American</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-[#003F87]" /> Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Employee ID</p>
                <p className="text-[15px] text-slate-800 font-medium">EMP-2022-045</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department</p>
                <p className="text-[15px] text-slate-800 font-medium">Academics</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Manager</p>
                <p className="text-[15px] text-slate-800 font-medium">Sarah Jenkins</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Employment Type</p>
                <p className="text-[15px] text-slate-800 font-medium">Full-Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
