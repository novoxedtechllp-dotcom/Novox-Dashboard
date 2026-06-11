import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Palette, Building2, Save, CheckCircle } from 'lucide-react';

const SettingsContent = () => {

  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative pb-[100px]">
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">Admin Settings</h2>
          <p className="text-[#555F6B] text-[14px] mt-1">Configure global platform settings.</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-2">
          <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'general' ? 'bg-[#E5F0FF] text-[#003F87]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Building2 size={18} /> General Setup
          </button>

          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'security' ? 'bg-[#E5F0FF] text-[#003F87]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Shield size={18} /> Global Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[#C2C6D4] rounded-xl shadow-sm p-6 lg:p-8">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">General Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Institution Name</label>
                  <input type="text" defaultValue="Novox Edtech" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Admin Contact Email</label>
                  <input type="email" defaultValue="admin@novoxedtech.com" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Support Phone</label>
                  <input type="tel" defaultValue="+1 (800) 123-4567" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Institution Address</label>
                  <textarea rows="3" defaultValue="123 Education Lane, Tech District, City" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm resize-none"></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button type="submit" className="bg-[#003F87] text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] shadow-sm"><Save size={16}/> Save Settings</button>
              </div>
            </form>
          )}


          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">Security Policies</h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 max-w-sm mt-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Session Timeout</label>
                  <select className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm">
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                    <option value="never">Never (Not Recommended)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button type="submit" className="bg-[#003F87] text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] shadow-sm"><Save size={16}/> Save Settings</button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <CheckCircle size={14} className="text-white" />
          </div>
          <p className="text-sm font-medium">Settings saved successfully.</p>
        </div>
      )}
    </div>
  );
};

export default SettingsContent;
