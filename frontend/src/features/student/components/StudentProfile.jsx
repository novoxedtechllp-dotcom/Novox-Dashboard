import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Pencil,
  X,
  AlertCircle,
  GitBranch,
  Briefcase,
  Camera,
  Terminal,
  User,
  Upload,
  CreditCard,
  Receipt,
  IndianRupee
} from 'lucide-react';

const StudentProfile = ({ userInfo }) => {
  const studentId = userInfo?.student_profile_id || userInfo?.id;
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
    totalCredits: 0,
    socialLinks: {
      github: '',
      linkedin: '',
      instagram: '',
      leetcode: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    avatarUrl: '',
    socialLinks: {
      github: '',
      linkedin: '',
      instagram: '',
      leetcode: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 5;
  const [tempSocialLinks, setTempSocialLinks] = useState({
    github: '',
    linkedin: '',
    instagram: '',
    leetcode: ''
  });

  const [studentFees, setStudentFees] = useState([]);
  const [feeTotals, setFeeTotals] = useState({ total: 0, paid: 0, balance: 0 });

  const handleSaveSocials = () => {
    localStorage.setItem(`student_social_links_${studentId}`, JSON.stringify(tempSocialLinks));
    setProfileData(prev => ({
      ...prev,
      socialLinks: { ...tempSocialLinks }
    }));
    setIsEditingSocials(false);
    
    if (tempSocialLinks.github || tempSocialLinks.linkedin) {
      setShowNotification(false);
    }
  };

  const toggleEditSocials = () => {
    if (!isEditingSocials) {
      setTempSocialLinks({ ...profileData.socialLinks });
    }
    setIsEditingSocials(!isEditingSocials);
  };

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
            status: s.status || '',
            guardianName: s.guardian_name || '',
            guardianPhone: s.parent_phone || ''
          };
        }
      }

      // 2. Fetch Course/Progress info
      const progressRes = await fetch(`/api/v1/students/${studentId}/progress`, { headers });
      let courseInfo = {
        courses: []
      };
      if (progressRes.ok) {
        const resData = await progressRes.json();
        const progressList = resData.data || [];
        courseInfo.courses = progressList.map(p => ({
          course: p.courses?.name || 'Enrolled Course',
          department: p.courses?.track || 'N/A',
          price: p.courses?.price || '₹0'
        }));
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
        
        let totalC = 0;
        let earnedC = 0;
        let totalPoints = 0;

        tasksList.forEach(task => {
          const credits = task.course_tasks?.points || 10;
          totalC += credits;
          if (task.status === 'COMPLETED') {
            earnedC += credits;
            const score = task.score || 0;
            // Rough conversion: 90+ = 4.0, 80+ = 3.0, etc.
            let pt = 0;
            if (score >= 90) pt = 4.0;
            else if (score >= 80) pt = 3.0;
            else if (score >= 70) pt = 2.0;
            else if (score >= 60) pt = 1.0;
            
            totalPoints += (pt * credits);
          }
        });

        const gpa = earnedC > 0 ? (totalPoints / earnedC).toFixed(1) : 'N/A';
        statsInfo = {
          gpa,
          earnedCredits: earnedC,
          totalCredits: totalC
        };
      }

      // 4. Load stored social links
      const storedSocialLinks = localStorage.getItem(`student_social_links_${studentId}`);
      let mergedSocialLinks = { ...profileData.socialLinks };
      if (storedSocialLinks) {
        try {
          mergedSocialLinks = { ...mergedSocialLinks, ...JSON.parse(storedSocialLinks) };
        } catch (e) {
          console.error("Error parsing stored social links:", e);
        }
      } else if (profileDetails.socialLinks) {
         mergedSocialLinks = { ...mergedSocialLinks, ...profileDetails.socialLinks };
      }

      // 5. Optionally fetch notifications from localStorage or similar if needed
      // (Mock logic kept simple here)
      const mockNotifications = localStorage.getItem('mock_notifications') 
        ? JSON.parse(localStorage.getItem('mock_notifications')) 
        : [];
      const hasRecentDocs = mockNotifications.some(n => n.type === 'document' && n.studentId === studentId);
      
      if (hasRecentDocs) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      } else {
        setShowNotification(false);
      }

      setProfileData(prev => ({
        ...prev,
        ...profileDetails,
        avatar: profileDetails.avatar,
        ...courseInfo,
        ...statsInfo,
        socialLinks: mergedSocialLinks
      }));

    } catch (error) {
      console.error('Error loading profile page data:', error);
    } finally {
      setLoading(false);
      setAvatarError(false);
    }
  };

  useEffect(() => {
    try {
      const storedFees = localStorage.getItem('novox_student_fees');
      let myFees = [];
      if (storedFees && studentId) {
        const allFees = JSON.parse(storedFees);
        myFees = allFees.filter(f => f.studentId === studentId);
      }
      setStudentFees(myFees);
    } catch(e) {
      console.error(e);
    }
  }, [studentId]);

  useEffect(() => {
    const hasEnrolledCourses = profileData.courses && profileData.courses.length > 0;
    const total = hasEnrolledCourses ? profileData.courses.reduce((sum, c) => sum + (parseInt(String(c.price || '0').replace(/[^0-9]/g, ''), 10) || 0), 0) : 0;
    const paid = studentFees.reduce((sum, f) => sum + (Number(f.paidAmount) || parseInt(String(f.amount).replace(/[^0-9]/g, ''), 10) || 0), 0);
    const balance = Math.max(0, total - paid);
    
    setFeeTotals({ total, paid, balance });
  }, [studentFees, profileData.courses]);

  useEffect(() => {
    fetchStudentData();
  }, [studentId, token]);

  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  const openEditModal = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      guardianName: profileData.guardianName,
      guardianPhone: profileData.guardianPhone,
      address: profileData.address,
      socialLinks: { ...profileData.socialLinks }
    });
    setSelectedAvatarFile(null);
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedAvatarFile(e.target.files[0]);
    }
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
      let finalAvatarUrl = profileData.avatar;
      
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append('file', selectedAvatarFile);

        const uploadRes = await fetch('/api/v1/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.data?.url) {
          finalAvatarUrl = uploadData.data.url;
        } else {
          throw new Error(uploadData.message || "File upload failed");
        }
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        first_name: editForm.firstName.trim(),
        last_name: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        guardian_name: editForm.guardianName?.trim() || null,
        parent_phone: editForm.guardianPhone?.trim() || null,
        address: editForm.address.trim(),
        avatar_url: finalAvatarUrl
      };

      const res = await fetch(`/api/v1/students/${studentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        localStorage.setItem(`student_social_links_${studentId}`, JSON.stringify(editForm.socialLinks));
        
        // Update session storage so global header updates immediately
        if (finalAvatarUrl !== profileData.avatar) {
          const userInfoStr = sessionStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            userInfo.avatar_url = finalAvatarUrl;
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            window.dispatchEvent(new Event('userInfoUpdated'));
          }
        }

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
    <div className="flex flex-col min-h-screen bg-[#FAFBFC] p-4 md:p-6 lg:p-8">
      
      {/* Compact Header aligned matching Figma Dimensions */}
      <div className="max-w-7xl mx-auto w-full mb-6 border-b border-slate-100 pb-0 md:h-24 md:min-h-[96px] flex flex-col md:flex-row md:items-end justify-between">
        <div className="mb-4 md:mb-0 pb-3 flex flex-col justify-end h-full">
          <h1 className="text-[28px] font-extrabold text-[#003F87] leading-none mb-1.5 tracking-tight">Student Profile</h1>
          <p className="text-slate-500 font-medium text-[13px] max-w-xl leading-relaxed">
            Manage your academic identity and preferences.
          </p>
        </div>
        
        <div className="flex gap-6 shrink-0 pb-3">
          <button 
            onClick={openEditModal}
            className="flex px-4 py-2 bg-white border border-[#003F87] text-[#003F87] hover:bg-[#003F87] hover:text-white rounded-lg text-sm font-bold items-center gap-2 transition-colors shadow-sm active:scale-95"
          >
            <Pencil size={14} /> Edit Profile
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="max-w-7xl mx-auto w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-[14px] font-bold text-amber-800">Action Required: Complete Your Profile</h4>
            <p className="text-[13px] text-amber-700/80 mt-1">Please add your GitHub and LinkedIn profile links. These are required to help instructors review your projects and build your professional network.</p>
          </div>
          <button onClick={() => setShowNotification(false)} className="text-amber-400 hover:text-amber-600 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#003F87] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
        {/* Grid Layout matching mockup layout structure */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ROW 1 Left: Academic Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm min-h-[220px] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100">
                {/* Profile Photo */}
                <div className="relative w-[76px] h-[76px] shrink-0">
                  <div className="w-full h-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {profileData.avatar && !avatarError ? (
                      <img 
                        src={profileData.avatar} 
                        alt={displayName} 
                        className="w-full h-full object-cover" 
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="text-[#003F87] font-black text-2xl">
                        {profileData.firstName ? profileData.firstName[0] : 'S'}
                        {profileData.lastName ? profileData.lastName[0] : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Badges */}
                <div className="flex-1 text-center sm:text-left pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <h2 className="text-[20px] font-extrabold text-slate-800 leading-tight">{displayName || 'Student Profile'}</h2>
                    <button 
                      onClick={openEditModal}
                      className="sm:hidden self-center px-4 py-1.5 bg-white border border-[#003F87] text-[#003F87] hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Pencil size={12} /> Edit Profile
                    </button>
                  </div>
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
                <div className="sm:col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Enrolled Courses</span>
                  <div className="flex flex-col gap-2">
                    {profileData.courses && profileData.courses.length > 0 ? (
                      profileData.courses.map((c, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                          <span className="text-sm font-extrabold text-slate-800 leading-snug block">{c.course}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.department}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm font-extrabold text-slate-800 leading-snug block">No Course Enrolled</span>
                    )}
                  </div>
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
            <div className="bg-[#003F87] rounded-xl p-5 text-white flex flex-col justify-between min-h-[220px] h-full shadow-[0_8px_25px_rgba(0,63,135,0.08)] relative overflow-hidden">
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
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
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

                {/* Guardian Phone */}
                {(profileData.guardianPhone || profileData.guardianName) && (
                  <div className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <Phone size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Guardian Phone {profileData.guardianName ? `(${profileData.guardianName})` : ''}</span>
                      <span className="text-sm font-semibold text-slate-700 leading-snug">{profileData.guardianPhone || 'N/A'}</span>
                    </div>
                  </div>
                )}

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

          {/* ROW 2 Right: Social Links */}
          <div className="h-full">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm min-h-[200px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <GitBranch className="w-4 h-4 text-[#003F87]" />
                  Social Profiles
                </h3>
                {!isEditingSocials ? (
                  <button
                    onClick={toggleEditSocials}
                    className="text-[12px] font-bold text-[#003F87] hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                  >
                    <Pencil size={12} />
                    Edit Links
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleEditSocials}
                      className="text-[12px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSocials}
                      className="text-[12px] font-bold text-white bg-[#003F87] hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {/* GitHub */}
                <div className="flex items-center justify-between border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-700">
                      <GitBranch size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700">GitHub</span>
                  </div>
                  {isEditingSocials ? (
                    <input 
                      type="url"
                      value={tempSocialLinks.github}
                      onChange={e => setTempSocialLinks({...tempSocialLinks, github: e.target.value})}
                      placeholder="https://github.com/..."
                      className="flex-1 min-w-0 max-w-[180px] sm:max-w-[200px] text-[12px] px-2.5 py-1.5 border border-slate-200 rounded-md outline-none focus:border-[#003F87]"
                    />
                  ) : profileData.socialLinks.github ? (
                    <a href={profileData.socialLinks.github} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-blue-600 hover:underline truncate max-w-[200px]">View</a>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">Not Added</span>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="flex items-center justify-between border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0A66C2]">
                      <Briefcase size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700">LinkedIn</span>
                  </div>
                  {isEditingSocials ? (
                    <input 
                      type="url"
                      value={tempSocialLinks.linkedin}
                      onChange={e => setTempSocialLinks({...tempSocialLinks, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/..."
                      className="flex-1 min-w-0 max-w-[180px] sm:max-w-[200px] text-[12px] px-2.5 py-1.5 border border-slate-200 rounded-md outline-none focus:border-[#003F87]"
                    />
                  ) : profileData.socialLinks.linkedin ? (
                    <a href={profileData.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-blue-600 hover:underline truncate max-w-[200px]">View</a>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">Not Added</span>
                  )}
                </div>

                {/* Leetcode */}
                <div className="flex items-center justify-between border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-orange-500">
                      <Terminal size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700">Leetcode</span>
                  </div>
                  {isEditingSocials ? (
                    <input 
                      type="url"
                      value={tempSocialLinks.leetcode}
                      onChange={e => setTempSocialLinks({...tempSocialLinks, leetcode: e.target.value})}
                      placeholder="https://leetcode.com/..."
                      className="flex-1 min-w-0 max-w-[180px] sm:max-w-[200px] text-[12px] px-2.5 py-1.5 border border-slate-200 rounded-md outline-none focus:border-[#003F87]"
                    />
                  ) : profileData.socialLinks.leetcode ? (
                    <a href={profileData.socialLinks.leetcode} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-blue-600 hover:underline truncate max-w-[200px]">View</a>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">Not Added</span>
                  )}
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-between border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-pink-600">
                      <Camera size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700">Instagram</span>
                  </div>
                  {isEditingSocials ? (
                    <input 
                      type="url"
                      value={tempSocialLinks.instagram}
                      onChange={e => setTempSocialLinks({...tempSocialLinks, instagram: e.target.value})}
                      placeholder="https://instagram.com/..."
                      className="flex-1 min-w-0 max-w-[180px] sm:max-w-[200px] text-[12px] px-2.5 py-1.5 border border-slate-200 rounded-md outline-none focus:border-[#003F87]"
                    />
                  ) : profileData.socialLinks.instagram ? (
                    <a href={profileData.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-blue-600 hover:underline truncate max-w-[200px]">View</a>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">Not Added</span>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

          {/* ROW 3: Financial Overview */}
          <div className="w-full mt-6 mb-8">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#003F87]" />
              Financial Overview
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Summary */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Course Fees</p>
                      <h4 className="text-lg font-black text-slate-800">₹{feeTotals.total.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <IndianRupee size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Amount Paid</p>
                      <h4 className="text-lg font-black text-emerald-600">₹{feeTotals.paid.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>

                <div className="bg-[#003F87] rounded-xl border border-[#003F87] p-5 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Remaining Balance</p>
                      <h4 className="text-2xl font-black text-white">₹{feeTotals.balance.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Transaction History */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recent Transactions</h4>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    {studentFees.length > 0 ? (
                      <div className="flex flex-col h-full">
                        <div className="flex flex-col gap-3 min-h-[380px]">
                          {studentFees.slice((transactionPage - 1) * transactionsPerPage, transactionPage * transactionsPerPage).map((fee, idx) => (
                            <div key={fee.id || idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{fee.course} Fee Payment</span>
                                <span className="text-xs font-medium text-slate-500 mt-0.5">{fee.date} • {fee.type}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-emerald-600">₹{(Number(fee.paidAmount) || 0).toLocaleString()}</span>
                                <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${fee.status === 'Paid' || fee.status === 'Full Paid' ? 'text-emerald-500' : fee.status === 'Partially Paid' ? 'text-amber-500' : 'text-rose-500'}`}>
                                  {fee.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {studentFees.length > transactionsPerPage && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center items-center gap-2">
                            <button 
                              onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                              disabled={transactionPage === 1}
                              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                            >&lt;</button>
                            {Array.from({ length: Math.ceil(studentFees.length / transactionsPerPage) }, (_, i) => i + 1).map(page => (
                              <button 
                                key={page}
                                onClick={() => setTransactionPage(page)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all shadow-sm ${
                                  transactionPage === page ? 'bg-[#003F87] text-white shadow-[#003F87]/20' : 'text-slate-600 hover:bg-slate-50 border border-slate-200 bg-white'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            <button 
                              onClick={() => setTransactionPage(p => Math.min(Math.ceil(studentFees.length / transactionsPerPage), p + 1))}
                              disabled={transactionPage === Math.ceil(studentFees.length / transactionsPerPage)}
                              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                            >&gt;</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                        <Receipt size={32} className="mb-3 text-slate-300" />
                        <p className="text-sm font-bold">No transactions found</p>
                        <p className="text-xs text-slate-400 mt-1">There are no fee records available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
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

            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

              <div className="flex flex-col items-center justify-center pt-2 pb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                    {editForm.avatarUrl ? (
                      <img src={editForm.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#C2C6D4] text-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-slate-50 transition-colors">
                    <Upload size={14} />
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleAvatarFileChange(e);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditForm({ ...editForm, avatarUrl: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">JPG, PNG or GIF. Max 5MB.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Student ID</label>
                  <input 
                    type="text" 
                    value={profileData.studentCode || 'N/A'}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 text-sm font-semibold cursor-not-allowed"
                  />
                </div>
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
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={editForm.lastName}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                  />
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
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Residential Address</label>
                <textarea 
                  rows={2}
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all resize-none"
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Guardian Name</label>
                  <input 
                    type="text" 
                    value={editForm.guardianName || ''}
                    onChange={e => setEditForm({ ...editForm, guardianName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                    placeholder="Parent / Guardian Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Guardian Phone</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    value={editForm.guardianPhone || ''}
                    onChange={e => setEditForm({ ...editForm, guardianPhone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              {/* Social Links Form Section */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3">Social Profiles</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">GitHub URL</label>
                    <input 
                      type="url" 
                      value={editForm.socialLinks.github}
                      onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, github: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">LinkedIn URL</label>
                    <input 
                      type="url" 
                      value={editForm.socialLinks.linkedin}
                      onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, linkedin: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Leetcode URL</label>
                    <input 
                      type="url" 
                      value={editForm.socialLinks.leetcode}
                      onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, leetcode: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                      placeholder="https://leetcode.com/u/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Instagram URL</label>
                    <input 
                      type="url" 
                      value={editForm.socialLinks.instagram}
                      onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, instagram: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[#003F87] text-sm font-semibold transition-all"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
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
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
