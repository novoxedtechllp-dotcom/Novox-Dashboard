import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  FileText, 
  Pencil,
  X,
  AlertCircle
} from 'lucide-react';

const StudentProfile = ({ userInfo }) => {
  const studentId = userInfo?.id || userInfo?.student_profile_id;
  const token = userInfo?.token || sessionStorage.getItem('token');
  
  const [profileData, setProfileData] = useState({
    firstName: userInfo?.first_name || '',
    lastName: userInfo?.last_name || '',
    studentCode: userInfo?.student_code || '',
    phone: userInfo?.phone || '',
    email: userInfo?.email || '',
    address: userInfo?.address || '',
    avatar: userInfo?.avatar_url || userInfo?.avatar || null,
    joiningDate: userInfo?.joining_date || '',
    status: userInfo?.status || '',
    batch: 'N/A',
    course: 'No Course Enrolled',
    department: 'N/A',
    gpa: 'N/A',
    earnedCredits: 0,
    totalCredits: 0
  });

  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStudentData = async () => {
    if (!studentId || !token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Fetch Student profile details
      const studentRes = await fetch(`/api/v1/students/${studentId}`, { headers });
      let profileDetails = {};
      if (studentRes.ok) {
        const resData = await studentRes.json();
        if (resData.data) {
          const s = resData.data;
          profileDetails = {
            firstName: s.first_name || '',
            lastName: s.last_name || '',
            studentCode: s.student_code || '',
            phone: s.phone || '',
            email: s.users?.email || s.email || '',
            address: s.address || '',
            avatar: s.avatar_url || null,
            joiningDate: s.joining_date || '',
            status: s.status || ''
          };
        }
      }

      // 2. Fetch Course/Progress info
      const progressRes = await fetch(`/api/v1/students/${studentId}/progress`, { headers });
      let courseInfo = {
        course: 'No Course Enrolled',
        department: 'N/A'
      };
      if (progressRes.ok) {
        const resData = await progressRes.json();
        const progressList = resData.data || [];
        if (progressList.length > 0) {
          const primaryCourse = progressList[0];
          courseInfo = {
            course: primaryCourse.courses?.name || 'Enrolled Course',
            department: primaryCourse.courses?.track || 'N/A'
          };
        }
      }

      // 3. Fetch Tasks to calculate GPA & Credits dynamically
      const tasksRes = await fetch(`/api/v1/students/${studentId}/tasks`, { headers });
      let statsInfo = {
        gpa: 'N/A',
        earnedCredits: 0,
        totalCredits: 0
      };
      if (tasksRes.ok) {
        const resData = await tasksRes.json();
        const tasksList = resData.data || [];
        
        if (tasksList.length > 0) {
          const total = tasksList.length;
          const approved = tasksList.filter(t => t.status === 'APPROVED').length;
          
          statsInfo = {
            earnedCredits: approved * 10,
            totalCredits: total * 10
          };

          let sumGrades = 0;
          let gradedCount = 0;
          tasksList.forEach(t => {
            if (t.grade) {
              const numericPart = t.grade.replace(/[^0-9.]/g, '');
              const val = parseFloat(numericPart);
              if (!isNaN(val)) {
                const normalized = val > 10 ? (val / 100) * 4.0 : val;
                sumGrades += normalized;
                gradedCount++;
              }
            }
          });
          if (gradedCount > 0) {
            statsInfo.gpa = (sumGrades / gradedCount).toFixed(2);
          }
        }
      }

      setProfileData(prev => ({
        ...prev,
        ...profileDetails,
        ...courseInfo,
        ...statsInfo
      }));

    } catch (error) {
      console.error('Error loading profile page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId, token]);

  const openEditModal = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      address: profileData.address,
      avatarUrl: profileData.avatar || ''
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editForm.firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (editForm.phone && editForm.phone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const payload = {
        first_name: editForm.firstName.trim(),
        last_name: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        avatar_url: editForm.avatarUrl.trim() || null
      };

      const res = await fetch(`/api/v1/students/${studentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchStudentData();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedAdmissionDate = () => {
    if (!profileData.joiningDate) return 'N/A';
    try {
      const date = new Date(profileData.joiningDate);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const displayName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Student User';
  const displayStatus = profileData.status === 'ACTIVE' ? 'Active Student' : (profileData.status ? `${profileData.status} Student` : 'N/A');

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFC] px-6 py-4 md:px-8 md:py-5">
      
      {/* Compact Header aligned matching Figma Dimensions */}
      <div className="max-w-7xl mx-auto w-full mb-5 border-b border-slate-100 pb-3 flex flex-col justify-end">
        <h1 className="text-[26px] font-extrabold text-[#003F87] leading-none mb-1 tracking-tight">Student Profile</h1>
        <p className="text-slate-500 font-medium text-[12px] max-w-xl leading-relaxed">
          Manage your academic identity and preferences.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#003F87] rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Grid Layout matching mockup layout structure */
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* ROW 1 Left: Academic Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] min-h-[220px] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100">
                {/* Profile Photo */}
                <div className="relative w-[76px] h-[76px] shrink-0">
                  <div className="w-full h-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#003F87] font-black text-2xl">
                        {profileData.firstName ? profileData.firstName[0] : 'S'}
                        {profileData.lastName ? profileData.lastName[0] : ''}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={openEditModal}
                    className="absolute -bottom-1 -right-1 bg-[#003F87] border-2 border-white hover:bg-[#002b5e] w-6.5 h-6.5 rounded-full flex items-center justify-center text-white shadow-sm transition-transform active:scale-95"
                  >
                    <Pencil size={10} />
                  </button>
                </div>

                {/* Name & Badges */}
                <div className="flex-1 text-center sm:text-left pt-0.5">
                  <h2 className="text-[20px] font-extrabold text-slate-800 leading-tight mb-2">{displayName || 'Student Profile'}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      ID: {profileData.studentCode || 'N/A'}
                    </span>
                    <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Batch: {profileData.batch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Current Course</span>
                  <span className="text-sm font-extrabold text-slate-800 leading-snug">{profileData.course}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Department</span>
                  <span className="text-sm font-extrabold text-slate-800 leading-snug">{profileData.department}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Admission Date</span>
                  <span className="text-sm font-extrabold text-slate-800 leading-snug">{formattedAdmissionDate()}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Status</span>
                  <span className="text-sm font-extrabold text-slate-800 flex items-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block mr-2"></span>
                    {displayStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 1 Right: GPA Card */}
          <div className="h-full">
            <div className="bg-[#003F87] rounded-2xl p-5 text-white flex flex-col justify-between min-h-[220px] h-full shadow-[0_8px_25px_rgba(0,63,135,0.08)] relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-blue-500/10 blur-xl"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <GraduationCap size={16} className="text-white" />
                  </div>
                  {profileData.gpa !== 'N/A' && parseFloat(profileData.gpa) >= 3.5 && (
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Top Student
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <span className="text-[9px] font-extrabold text-blue-200/80 uppercase tracking-widest block mb-0.5">Overall Grade</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-4xl font-black">{profileData.gpa}</span>
                    {profileData.gpa !== 'N/A' && <span className="text-blue-200 text-base font-bold">/ 4.0</span>}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[9px] font-extrabold text-blue-200/80 uppercase mb-1.5 tracking-wider">
                    <span>Earned Credits</span>
                    <span className="text-white font-black">{profileData.earnedCredits} / {profileData.totalCredits}</span>
                  </div>
                  <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-1000"
                      style={{ width: `${profileData.totalCredits > 0 ? (profileData.earnedCredits / profileData.totalCredits) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2 Left: Contact Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-3.5 uppercase tracking-wider">
                <svg className="w-4 h-4 text-[#003F87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Contact Information
              </h3>
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3.5">
                
                {/* Email */}
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    <Mail size={14} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Institutional Email</span>
                    <span className="text-sm font-semibold text-slate-700 leading-snug">{profileData.email || 'N/A'}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    <Phone size={14} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Phone Number</span>
                    <span className="text-sm font-semibold text-slate-700 leading-snug">{profileData.phone || 'N/A'}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Residential Address</span>
                    <span className="text-sm font-semibold text-slate-700 leading-snug">{profileData.address || 'N/A'}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Empty space next to contact info for grid alignment */}
          <div className="hidden lg:block"></div>

          {/* ROW 3: Large gray placeholder block matching mockup bottom */}
          <div className="lg:col-span-3 bg-[#EAECEF]/30 border border-slate-100 h-36 rounded-2xl flex items-center justify-center">
            {/* Visual placeholder matching the empty gray banner */}
          </div>

        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800">Edit Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update your personal contact details</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">First Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.firstName}
                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={editForm.lastName}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                  placeholder="10-digit number"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Residential Address</label>
                <textarea 
                  rows={3}
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all resize-none"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Avatar Image URL</label>
                <input 
                  type="url" 
                  value={editForm.avatarUrl}
                  onChange={e => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#003F87] hover:bg-[#002b5e] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
