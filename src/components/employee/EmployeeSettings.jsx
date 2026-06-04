import React, { useState } from 'react';
import { User, Lock, Bell, Settings as SettingsIcon, Camera, Save, LogOut, CheckCircle } from 'lucide-react';

const EmployeeSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative pb-[100px]">
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">Settings</h2>
          <p className="text-[#555F6B] text-[14px] mt-1">Manage your account preferences and settings.</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-2">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'profile' ? 'bg-[#E5F0FF] text-[#003F87]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <User size={18} /> Profile Settings
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'security' ? 'bg-[#E5F0FF] text-[#003F87]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Lock size={18} /> Security
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'notifications' ? 'bg-[#E5F0FF] text-[#003F87]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Bell size={18} /> Notifications
          </button>
          <button onClick={() => setActiveTab('preferences')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'preferences' ? 'bg-[#E5F0FF] text-[#003F87]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <SettingsIcon size={18} /> Preferences
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[#C2C6D4] rounded-xl shadow-sm p-6 lg:p-8">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">Profile Settings</h3>
              
              <div className="flex items-center gap-6 mb-2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-[#E5F0FF] border-2 border-[#003F87] flex items-center justify-center text-[#003F87] text-3xl font-bold">
                    SM
                  </div>
                  <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-[#003F87] shadow-sm">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Staff Member</h4>
                  <p className="text-sm text-slate-500">Academic Operations</p>
                  <button type="button" className="text-xs font-semibold text-[#003F87] mt-2 border border-[#003F87] px-3 py-1 rounded-md hover:bg-[#E5F0FF]">Change Photo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
                  <input type="text" defaultValue="Staff Member" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
                  <input type="email" defaultValue="staff@novoxedtech.com" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Department</label>
                  <input type="text" defaultValue="Academic Operations" disabled className="border border-slate-200 bg-slate-50 rounded-md px-3 py-2 outline-none text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Designation</label>
                  <input type="text" defaultValue="Senior Coordinator" disabled className="border border-slate-200 bg-slate-50 rounded-md px-3 py-2 outline-none text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Address</label>
                  <textarea rows="3" defaultValue="123 Employee Lane, Tech Park District, City, Country" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm resize-none"></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button type="submit" className="bg-[#003F87] text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] shadow-sm"><Save size={16}/> Save Changes</button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">Security Settings</h3>
              
              <div className="flex flex-col gap-4 max-w-md">
                <h4 className="font-bold text-slate-700 text-sm">Change Password</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Current Password</label>
                  <input type="password" placeholder="••••••••" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">New Password</label>
                  <input type="password" placeholder="Enter new password" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm" />
                </div>
                <button type="button" className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-bold w-fit mt-2 hover:bg-slate-700">Update Password</button>
              </div>

              <div className="border-t border-slate-200 my-2"></div>

              <div>
                <h4 className="font-bold text-slate-700 text-sm mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Enable 2FA</p>
                    <p className="text-xs text-slate-500">Secure your account with a verification code.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003F87]"></div>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 my-2"></div>

              <div>
                <h4 className="font-bold text-slate-700 text-sm mb-4">Active Sessions</h4>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-md border border-slate-200"><User size={20} className="text-slate-600"/></div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Windows PC - Chrome</p>
                      <p className="text-xs text-green-600 font-semibold">Active Now • IP: 192.168.1.1</p>
                    </div>
                  </div>
                </div>
                <button type="button" className="mt-4 flex items-center gap-2 text-red-600 font-bold text-sm hover:underline"><LogOut size={16}/> Logout All Other Devices</button>
              </div>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">Notification Preferences</h3>
              
              <div className="flex flex-col gap-4">
                {[
                  { title: 'Email Notifications', desc: 'Receive daily summaries and important updates via email.', checked: true },
                  { title: 'Task Assignments', desc: 'Get notified when a new task is assigned to you.', checked: true },
                  { title: 'Attendance Alerts', desc: 'Reminders to check in and check out.', checked: true },
                  { title: 'Payroll Updates', desc: 'Notifications when your payslip is generated.', checked: false },
                  { title: 'System Announcements', desc: 'Updates regarding platform maintenance.', checked: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003F87]"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-[#003F87] text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] shadow-sm"><Save size={16}/> Save Preferences</button>
              </div>
            </form>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSave} className="flex flex-col gap-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">System Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Theme</label>
                  <select value={theme} onChange={handleThemeChange} className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm">
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Language</label>
                  <select className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm">
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Time Zone</label>
                  <select className="border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-[#003F87] text-sm">
                    <option value="est">Eastern Standard Time (EST)</option>
                    <option value="cst">Central Standard Time (CST)</option>
                    <option value="pst">Pacific Standard Time (PST)</option>
                    <option value="utc">Coordinated Universal Time (UTC)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button type="submit" className="bg-[#003F87] text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] shadow-sm"><Save size={16}/> Save Preferences</button>
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

export default EmployeeSettings;
