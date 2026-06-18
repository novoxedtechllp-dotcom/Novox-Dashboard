import React from 'react';

const SupportContent = () => {
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      <div className="w-full flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support Requests</h1>
          <p className="text-slate-500 mt-1">Manage and resolve user issues and inquiries.</p>
        </div>
      </div>
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[16px] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">How can we help?</h3>
        <p className="text-slate-500 mb-6">Find answers in our documentation or contact our support team.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#C2C6D4] rounded-lg p-5 hover:border-[#003F87] transition-colors cursor-pointer">
            <h4 className="font-bold text-slate-800 mb-2">Documentation</h4>
            <p className="text-sm text-slate-500">Read guides on how to use the dashboard and manage your institution.</p>
          </div>
          <div className="border border-[#C2C6D4] rounded-lg p-5 hover:border-[#003F87] transition-colors cursor-pointer">
            <h4 className="font-bold text-slate-800 mb-2">Contact Support</h4>
            <p className="text-sm text-slate-500">Email us directly at support@novoxedtech.com or call 1-800-NOVOX.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportContent;
