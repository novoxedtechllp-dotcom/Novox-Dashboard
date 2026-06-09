import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Briefcase, Calendar, Edit3, Save, X, Camera, Zap, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const alert = (message, isError = false) => {
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const userInfoStr = sessionStorage.getItem('userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      if (!userInfo?.token) return;

      const res = await fetch('/api/v1/profile/me', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const resData = await res.json();
      
      if (resData.success) {
        setProfile(resData.data.employeeProfile);
        setUser(resData.data.user);
        
        if (resData.data.employeeProfile) {
          setFormData({
            first_name: resData.data.employeeProfile.first_name || '',
            last_name: resData.data.employeeProfile.last_name || '',
            phone: resData.data.employeeProfile.phone || '',
            password: '',
          });
          setAvatarPreview(resData.data.employeeProfile.avatar_url);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      alert("Failed to load profile data", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (formData.phone && formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      setSaving(false);
      return;
    }

    try {
      const userInfoStr = sessionStorage.getItem('userInfo');
      const sessionUser = userInfoStr ? JSON.parse(userInfoStr) : null;
      if (!sessionUser?.token) return;

      const data = new FormData();
      if (formData.first_name) data.append('first_name', formData.first_name);
      if (formData.last_name) data.append('last_name', formData.last_name);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.password) data.append('password', formData.password);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await fetch('/api/v1/profile/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionUser.token}`
        },
        body: data
      });
      
      const resData = await res.json();
      if (resData.success) {
        const updatedProfile = resData.data.employeeProfile;
        setProfile(updatedProfile);
        setUser(resData.data.user);
        
        // Update session storage
        const updatedSessionUser = {
          ...sessionUser,
          first_name: updatedProfile?.first_name || sessionUser.first_name,
          last_name: updatedProfile?.last_name || sessionUser.last_name,
          avatar_url: updatedProfile?.avatar_url || sessionUser.avatar_url,
          name: updatedProfile ? `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim() : sessionUser.name,
        };
        sessionStorage.setItem('userInfo', JSON.stringify(updatedSessionUser));
        window.dispatchEvent(new Event('userInfoUpdated'));
        
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '' })); // clear password
        alert('Profile updated successfully!');
      } else {
        alert(resData.message || "Failed to update profile", true);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile", true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const isEmployee = !!profile;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full relative bg-[#FAFBFC] min-h-full">
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl shadow-2xl font-bold text-sm transform transition-all duration-300 flex items-center gap-3 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'}`}>
          {toast.type === 'error' ? <X size={18} /> : <Zap size={18} className="text-emerald-400" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your personal details and account security.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto bg-[#003F87] text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#002B5E] shadow-md shadow-blue-900/10 transition-all active:scale-95"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => {
                setIsEditing(false);
                setAvatarPreview(profile?.avatar_url);
                setAvatarFile(null);
              }}
              className="px-8 py-3.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <X size={18} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3.5 bg-[#008A2E] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#006E24] shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - ID Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden sticky top-8">
            {/* Banner without the upload button */}
            <div className="h-32 bg-gradient-to-br from-blue-500 via-[#003F87] to-blue-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="px-8 pb-8 pt-16 relative flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-32 h-32 bg-white rounded-full border-[6px] border-white shadow-lg absolute -top-16 flex items-center justify-center text-[#003F87] overflow-hidden group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                    <User size={48} className="text-[#003F87] opacity-50" />
                  </div>
                )}
                
                {isEditing && (
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div className="mt-2 w-full">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Admin User'}
                </h3>
                <div className="inline-block bg-blue-50 text-[#003F87] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-6">
                  {profile?.designation || profile?.employee_roles?.role_name || user?.role || 'Staff'}
                </div>
              </div>
              
              <div className="w-full space-y-4 pt-6 border-t border-slate-100 text-left">
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#003F87] transition-colors shadow-sm shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                  </div>
                </div>
                
                {profile && (
                  <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#003F87] transition-colors shadow-sm shrink-0">
                      <Phone size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-[#003F87] transition-colors shadow-sm shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined Date</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <User size={18} className="text-[#003F87]" /> Personal Details
            </h3>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
                  <input 
                    type="text" 
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Name</label>
                  <input 
                    type="text" 
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name</p>
                  <p className="text-base text-slate-800 font-bold">
                    {profile ? profile.first_name || 'N/A' : 'Admin'}
                  </p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name</p>
                  <p className="text-base text-slate-800 font-bold">
                    {profile ? profile.last_name || 'N/A' : 'User'}
                  </p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                  <p className="text-base text-slate-800 font-bold">{profile?.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Account Role</p>
                  <p className="text-base text-slate-800 font-bold">{user?.role}</p>
                </div>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <ShieldCheck size={18} className="text-[#003F87]" /> Account Security
            </h3>
            
            {isEditing ? (
              <div className="max-w-md animate-in fade-in duration-300">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Change Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold transition-all placeholder:font-medium"
                />
                <p className="text-xs text-slate-400 font-medium mt-3">If you update your password, you will need to use it the next time you log in.</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl max-w-md">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Password is secure</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Your account uses standard password authentication. Click Edit Profile to change it.</p>
                </div>
              </div>
            )}
          </div>

          {/* Employment Details */}
          {profile && (
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <Briefcase size={18} className="text-[#003F87]" /> Professional Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee ID</p>
                  <p className="text-base text-slate-800 font-bold font-mono">{profile.employee_code}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                  <p className="text-base text-slate-800 font-bold">{profile.employee_roles?.role_name || 'N/A'}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Designation</p>
                  <p className="text-base text-slate-800 font-bold">{profile.designation || 'N/A'}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase ${profile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {profile.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
