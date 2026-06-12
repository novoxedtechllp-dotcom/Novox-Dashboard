import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Send, FileText } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

const EmployeeLeave = () => {
  const [activeTab, setActiveTab] = useState('Request Leave');
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/leaves');
      setLeaveHistory(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setError("Failed to load leave history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient('/leaves', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        leaveType: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: ''
      });

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
          <h2 className="text-[24px] font-bold text-slate-900">Leave Requests</h2>
          <p className="text-slate-500 text-[14px] mt-1">Apply for leave and track your request status</p>
        </div>
      </div>

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

      {error && (
        <div className="mb-6 p-4 bg-[#FDE2E2] border border-[#D80000]/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-[#D80000] shrink-0 mt-0.5" size={18} />
          <p className="text-[14px] font-bold text-[#D80000]">{error}</p>
        </div>
      )}

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
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      min={formData.startDate}
                      className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] transition-colors"
                    />
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
                        {leave.admin_message && leave.status === 'REJECTED' && (
                          <div className="text-[#D80000] text-[11px] mt-1 font-medium">Reason: {leave.admin_message}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{new Date(leave.applied_on).toLocaleDateString()}</td>
                      <td className="py-4 px-6">{getStatusBadge(leave.status)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-6 text-center text-slate-500">No leave requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
