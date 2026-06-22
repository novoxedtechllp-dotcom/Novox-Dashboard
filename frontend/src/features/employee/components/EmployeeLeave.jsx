import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Send, FileText, Info, UploadCloud, Trash2, X, MessageSquare } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import CloudinaryPdfViewer from '../../../components/CloudinaryPdfViewer';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EmployeeLeave = () => {
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);
  const [viewMode, setViewMode] = useState('My Record');
  const [activeTab, setActiveTab] = useState('Request Leave');
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [currentDocUrl, setCurrentDocUrl] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rejection modal states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/leaves');
      const allLeaves = res.data || [];
      
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const profileId = userInfo?.employee_profile_id;
      
      // Filter the leaves based on who requested them
      setLeaveHistory(allLeaves.filter(l => l.employee_id === profileId));
      setStudentLeaves(allLeaves.filter(l => l.employee_id !== profileId));
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setError("Failed to load leave history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveStudentLeave = async (id) => {
    try {
      await apiClient(`/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'APPROVED' })
      });
      setStudentLeaves(prev => prev.map(leave => 
        leave.id === id ? { ...leave, status: 'APPROVED' } : leave
      ));
    } catch (err) {
      alert("Failed to approve student leave: " + err.message);
    }
  };

  const handleOpenRejectModal = (id) => {
    setRejectLeaveId(id);
    setRejectionMessage('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectLeaveId) return;
    try {
      await apiClient(`/leaves/${rejectLeaveId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'REJECTED', adminMessage: rejectionMessage })
      });
      setStudentLeaves(prev => prev.map(leave => 
        leave.id === rejectLeaveId ? { ...leave, status: 'REJECTED', admin_message: rejectionMessage } : leave
      ));
      setIsRejectModalOpen(false);
      setRejectLeaveId(null);
    } catch (err) {
      alert("Failed to reject student leave: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpeg|jpg|png|pdf)$/i)) {
        alert("Invalid file type. Please upload a JPG, JPEG, PNG, or PDF file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpeg|jpg|png|pdf)$/i)) {
        alert("Invalid file type. Please upload a JPG, JPEG, PNG, or PDF file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      let documentUrl = null;

      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/v1/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${userInfo?.token}` },
          body: fileFormData
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.data?.url) {
          documentUrl = uploadData.data.url;
        } else {
          throw new Error(uploadData.message || "File upload failed");
        }
      }

      await apiClient('/leaves', {
        method: 'POST',
        body: JSON.stringify({ ...formData, documentUrl })
      });
      
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        leaveType: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh list
      fetchLeaves();

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to submit leave request:", err);
      setError(err.message || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteLeave = async () => {
    if (!leaveToDelete) return;
    try {
      setIsDeleting(true);
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const res = await fetch(`/api/v1/leaves/${leaveToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete leave request");
      }
      fetchLeaves();
      setIsDeleteModalOpen(false);
      setLeaveToDelete(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setLeaveToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-[#E5F7ED] text-[#008A2E] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5"><CheckCircle size={14} /> Approved</span>;
      case 'REJECTED':
        return <span className="bg-[#FDE2E2] text-[#D80000] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="bg-[#FFF4E5] text-[#B26E00] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Leaves</h1>
          <p className="text-slate-500 mt-1">Apply for leaves and track your application status.</p>
        </div>
      </div>

      {/* Top Level Toggle */}
      <div className="flex bg-[#F8FAFC] rounded-[4px] p-[4px] border border-[#C2C6D4] w-fit mb-6 shadow-sm">
        <button
          onClick={() => setViewMode('My Record')}
          className={`px-8 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${viewMode === 'My Record' ? 'bg-[#003F87] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          My Record
        </button>
        <button
          onClick={() => setViewMode('Manage Leaves')}
          className={`px-8 py-2 rounded-[4px] text-[14px] font-semibold transition-all ${viewMode === 'Manage Leaves' ? 'bg-[#003F87] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          Manage Leaves
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDE2E2] border border-[#D80000]/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-[#D80000] shrink-0 mt-0.5" size={18} />
          <p className="text-[14px] font-bold text-[#D80000]">{error}</p>
        </div>
      )}

      {viewMode === 'My Record' && (
        <>
          <div className="flex gap-4 border-b border-[#E2E8F0] mb-6">
            <button
              onClick={() => setActiveTab('Request Leave')}
              className={`pb-3 px-1 text-[14px] font-bold transition-all relative ${
                activeTab === 'Request Leave' 
                  ? 'text-[#003F87]' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Request Leave
              {activeTab === 'Request Leave' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#003F87] rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('My Leave History')}
              className={`pb-3 px-1 text-[14px] font-bold transition-all relative ${
                activeTab === 'My Leave History' 
                  ? 'text-[#003F87]' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Leave History
              {activeTab === 'My Leave History' && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#003F87] rounded-t-full"></div>
              )}
            </button>
          </div>

          {activeTab === 'Request Leave' && (
            <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-300 fade-in">
          
          {/* Form Column */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50">
              <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                <FileText size={18} className="text-[#003F87]" />
                New Leave Application
              </h3>
            </div>
            
            <div className="p-6">
              {submitSuccess && (
                <div className="mb-6 p-4 bg-[#E5F7ED] border border-[#008A2E]/20 rounded-lg flex items-start gap-3">
                  <CheckCircle className="text-[#008A2E] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#008A2E]">Leave Request Submitted</h4>
                    <p className="text-[13px] text-[#008A2E]/80 mt-1">Your leave request has been sent to the administration for approval. You can track its status in the history tab.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Leave Type</label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] transition-colors"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-2">Start Date</label>
                     <div className="relative flex items-center">
                       <DatePicker
                         ref={startDatePickerRef}
                         selected={formData.startDate ? new Date(formData.startDate) : null}
                         onChange={(date) => {
                           if (date) {
                             const yyyy = date.getFullYear();
                             const mm = String(date.getMonth() + 1).padStart(2, '0');
                             const dd = String(date.getDate()).padStart(2, '0');
                             setFormData(prev => ({ ...prev, startDate: `${yyyy}-${mm}-${dd}` }));
                           } else {
                             setFormData(prev => ({ ...prev, startDate: '' }));
                           }
                         }}
                         dateFormat="dd/MM/yyyy"
                         placeholderText="dd/mm/yyyy"
                         showMonthDropdown
                         showYearDropdown
                         scrollableYearDropdown
                         dropdownMode="scroll"
                         required
                         className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] transition-colors cursor-pointer"
                       />
                       <Calendar 
                         size={16} 
                         className="text-slate-400 absolute right-3 cursor-pointer" 
                         onClick={() => startDatePickerRef.current?.setFocus()} 
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-[13px] font-bold text-slate-700 mb-2">End Date</label>
                     <div className="relative flex items-center">
                       <DatePicker
                         ref={endDatePickerRef}
                         selected={formData.endDate ? new Date(formData.endDate) : null}
                         onChange={(date) => {
                           if (date) {
                             const yyyy = date.getFullYear();
                             const mm = String(date.getMonth() + 1).padStart(2, '0');
                             const dd = String(date.getDate()).padStart(2, '0');
                             setFormData(prev => ({ ...prev, endDate: `${yyyy}-${mm}-${dd}` }));
                           } else {
                             setFormData(prev => ({ ...prev, endDate: '' }));
                           }
                         }}
                         dateFormat="dd/MM/yyyy"
                         placeholderText="dd/mm/yyyy"
                         showMonthDropdown
                         showYearDropdown
                         scrollableYearDropdown
                         dropdownMode="scroll"
                         required
                         minDate={formData.startDate ? new Date(formData.startDate) : null}
                         className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] transition-colors cursor-pointer"
                       />
                       <Calendar 
                         size={16} 
                         className="text-slate-400 absolute right-3 cursor-pointer" 
                         onClick={() => endDatePickerRef.current?.setFocus()} 
                       />
                     </div>
                   </div>
                 </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Reason for Leave</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    placeholder="Please provide a brief reason for your leave request..."
                    rows="4"
                    className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-500 tracking-wider uppercase mb-2">Supporting Document (Optional)</label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-relative
                      ${dragActive ? "border-[#003F87] bg-[#E5F0FF]" : "border-slate-300 hover:bg-slate-50"}
                      ${selectedFile ? "bg-slate-50" : "cursor-pointer"}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    
                    {selectedFile ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-3 bg-white border border-slate-200 py-2 px-4 rounded-lg shadow-sm">
                          <FileText className="text-[#003F87]" size={20} />
                          <div className="text-left max-w-[200px]">
                            <p className="text-[13px] font-bold text-slate-800 truncate">{selectedFile.name}</p>
                            <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove file"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className={`mb-3 ${dragActive ? "text-[#003F87]" : "text-slate-500"}`} size={32} />
                        <p className={`text-[14px] font-bold mb-1 ${dragActive ? "text-[#003F87]" : "text-slate-700"}`}>
                          Click to upload or drag & drop
                        </p>
                        <p className="text-[12px] text-slate-500">JPG, JPEG, PNG, PDF (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#003F87] hover:bg-[#002B5E] text-white px-6 py-3 rounded-lg font-bold text-[14px] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
        </div>
      )}

      {activeTab === 'My Leave History' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300 fade-in">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading leave history...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-[#E2E8F0]">
                    <th className="py-4 px-6">Leave Type</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Reason</th>
                    <th className="py-4 px-6">Applied On</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.length > 0 ? leaveHistory.map((leave) => (
                    <tr key={leave.id} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors text-[13px]">
                      <td className="py-4 px-6 font-bold text-slate-800">{leave.type}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {leave.start_date} to {leave.end_date}
                      </td>
                      <td className="py-4 px-6 text-slate-600 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                        {leave.document_url && (
                          <div className="mt-1">
                            <button 
                              onClick={() => {
                                setCurrentDocUrl(leave.document_url);
                                setIsDocModalOpen(true);
                              }}
                              className="text-[#003F87] hover:underline text-[11px] flex items-center gap-1 font-bold"
                            >
                              View Doc
                            </button>
                          </div>
                        )}
                        {leave.admin_message && leave.status === 'REJECTED' && (
                          <div className="text-[#D80000] text-[11px] mt-1 font-medium">Reason: {leave.admin_message}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{new Date(leave.applied_on).toLocaleDateString()}</td>
                      <td className="py-4 px-6">{getStatusBadge(leave.status)}</td>
                      <td className="py-4 px-6 text-right">
                        {(leave.status === 'PENDING' || !leave.status) && (
                          <button
                            onClick={() => handleDeleteClick(leave.id)}
                            className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                            title="Delete request"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-8 px-6 text-center text-slate-500">No leave requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </>
      )}

      {viewMode === 'Manage Leaves' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300 fade-in">
          <div className="p-5 border-b border-[#E2E8F0] bg-slate-50">
            <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
              <FileText size={18} className="text-[#003F87]" />
              Manage Leaves
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">Review and approve/reject leave requests from your team.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-[#E2E8F0]">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Leave Type</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Applied On</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentLeaves.length > 0 ? studentLeaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors text-[13px]">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <img 
                          src={leave.students?.avatar_url || leave.employee_profiles?.avatar_url || `https://ui-avatars.com/api/?name=${leave.students?.first_name || leave.employee_profiles?.first_name}+${leave.students?.last_name || leave.employee_profiles?.last_name}&background=F0F4F8&color=003F87`} 
                          alt="avatar" 
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-[14px]">
                            {leave.students?.first_name || leave.employee_profiles?.first_name} {leave.students?.last_name || leave.employee_profiles?.last_name}
                          </p>
                          <p className="text-[12px] text-slate-500 font-medium">
                            {leave.students?.student_code || leave.employee_profiles?.designation || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{leave.type}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {leave.start_date} to {leave.end_date}
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-[200px] truncate" title={leave.reason}>
                      {leave.reason}
                      {leave.document_url && (
                        <div className="mt-1">
                          <button 
                            onClick={() => {
                              setCurrentDocUrl(leave.document_url);
                              setIsDocModalOpen(true);
                            }}
                            className="text-[#003F87] hover:underline text-[11px] flex items-center gap-1 font-bold"
                          >
                            View Doc
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{new Date(leave.applied_on).toLocaleDateString()}</td>
                    <td className="py-4 px-6">{getStatusBadge(leave.status)}</td>
                    <td className="py-4 px-6 text-right">
                      {leave.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApproveStudentLeave(leave.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(leave.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-slate-500">No leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${currentDocUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? 'w-fit max-w-[95vw] max-h-[95vh]' : 'w-full max-w-4xl h-[85vh]'}`}>
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-[#003F87]" />
                Attached Document
              </h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative overflow-auto flex justify-center items-center">
              {currentDocUrl && currentDocUrl.split('?')[0].match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img src={currentDocUrl} alt="Attached Document" className="max-w-full max-h-[calc(95vh-60px)] object-contain" />
              ) : currentDocUrl && currentDocUrl.split('?')[0].match(/\.pdf$/i) ? (
                <CloudinaryPdfViewer pdfUrl={currentDocUrl} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full space-y-4 p-8 text-center bg-white">
                  <div className="max-w-md border border-slate-200 rounded-xl p-8 bg-slate-50">
                    <h4 className="text-[18px] font-bold text-slate-800 mb-2">Unsupported Document</h4>
                    <p className="text-slate-500 text-[14px] mb-6 leading-relaxed">
                      This document format requires direct download to view.
                    </p>
                    <a 
                      href={currentDocUrl ? currentDocUrl.replace('/upload/', '/upload/fl_attachment/') : '#'} 
                      className="bg-[#003F87] hover:bg-[#002B5E] text-white px-8 py-3 rounded-lg font-bold text-[14px] transition-colors inline-flex items-center justify-center shadow-sm w-full"
                    >
                      Download Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Trash2 size={18} className="text-[#D80000]" />
                Delete Leave Request
              </h3>
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setLeaveToDelete(null);
                }} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-slate-600 mb-6">Are you sure you want to delete this leave request? This action cannot be undone.</p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setLeaveToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteLeave}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-[14px] font-bold bg-[#D80000] text-white hover:bg-[#B80000] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#D80000]" />
                Reject Leave Request
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-slate-600 mb-4">Please provide a reason for rejecting this leave request. The student will be able to see this message.</p>
              
              <textarea
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                placeholder="E.g., Please provide a valid medical certificate..."
                className="w-full h-32 p-3 border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003F87] focus:border-transparent resize-none mb-6"
                autoFocus
              ></textarea>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-5 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmReject}
                  disabled={!rejectionMessage.trim()}
                  className="px-5 py-2.5 text-[14px] font-bold bg-[#D80000] text-white hover:bg-[#B80000] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} /> Send & Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeLeave;
