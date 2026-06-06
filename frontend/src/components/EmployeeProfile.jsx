import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit3, Save, X, Camera } from 'lucide-react';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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
      } else {
        alert(resData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  // If the user has no employee profile (e.g. pure admin without employee record)
  const isEmployee = !!profile;

  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">My Profile</h2>
          <p className="text-slate-500 text-[14px] mt-1">Manage your personal and professional information</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-white border border-[#C2C6D4] text-slate-700 px-5 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                setAvatarPreview(profile?.avatar_url);
                setAvatarFile(null);
              }}
              className="bg-white border border-[#C2C6D4] text-slate-700 px-5 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#003F87] text-white px-5 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 hover:bg-[#002B5E] transition-colors shadow-sm disabled:opacity-70"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
            <div className="h-24 bg-[#003F87] relative">
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  title="Change Cover (not implemented)"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>
            <div className="px-6 pb-6 pt-16 relative">
              <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-white shadow-md absolute -top-12 flex items-center justify-center text-[#003F87] overflow-hidden group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-400" />
                )}
                {isEditing && (
                  <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={24} className="text-white" />
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
              
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Admin User'}
                </h3>
                <p className="text-[14px] font-medium text-[#003F87]">
                  {profile?.designation || profile?.employee_roles?.role_name || user?.role || 'Staff'}
                </p>
              </div>
              
              <div className="mt-6 space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[14px]">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-slate-700">{user?.email}</span>
                </div>
                {profile && (
                  <div className="flex items-center gap-3 text-[14px]">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-slate-700">{profile.phone || 'Not provided'}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[14px]">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-slate-700">Joined {profile?.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={18} className="text-[#003F87]" /> Personal Information
            </h3>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase">First Name</label>
                  <input 
                    type="text" 
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase">New Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current"
                    className="border border-slate-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</p>
                  <p className="text-[15px] text-slate-800 font-medium">
                    {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Admin User'}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</p>
                  <p className="text-[15px] text-slate-800 font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Number</p>
                  <p className="text-[15px] text-slate-800 font-medium">{profile?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Role</p>
                  <p className="text-[15px] text-slate-800 font-medium">{user?.role}</p>
                </div>
              </div>
            )}
          </div>

          {profile && (
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase size={18} className="text-[#003F87]" /> Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Employee ID</p>
                  <p className="text-[15px] text-slate-800 font-medium">{profile.employee_code}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department</p>
                  <p className="text-[15px] text-slate-800 font-medium">{profile.employee_roles?.role_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Designation</p>
                  <p className="text-[15px] text-slate-800 font-medium">{profile.designation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide mb-1">Status</p>
                  <p className="text-[15px] text-slate-800 font-medium">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {profile.status}
                    </span>
                  </p>
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
