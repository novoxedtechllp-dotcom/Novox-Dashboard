import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, MessageSquare, X, Send, AlertCircle, ExternalLink, FileText } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import CloudinaryPdfViewer from '../../../components/CloudinaryPdfViewer';

const LeaveManagementContent = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState('');
  
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [currentDocUrl, setCurrentDocUrl] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/leaves');
      const formattedData = (res.data || []).map(req => {
        let requesterName = 'Unknown User';
        let role = 'N/A';
        let avatar = '??';
        
        if (req.employee_profiles) {
          requesterName = `${req.employee_profiles.first_name} ${req.employee_profiles.last_name}`;
          role = req.employee_profiles.designation || 'Employee';
          avatar = req.employee_profiles.first_name[0] + (req.employee_profiles.last_name ? req.employee_profiles.last_name[0] : '');
        } else if (req.students) {
          requesterName = `${req.students.first_name} ${req.students.last_name}`;
          role = `Student (${req.students.student_code})`;
          avatar = req.students.first_name[0] + (req.students.last_name ? req.students.last_name[0] : '');
        }

        return {
          ...req,
          requesterName,
          role,
          avatar
        };
      });
      setLeaveRequests(formattedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setError("Failed to load leave requests from server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient(`/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'APPROVED' })
      });
      // Update local state without refetching for speed
      setLeaveRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'APPROVED' } : req
      ));
    } catch (err) {
      alert("Failed to approve leave: " + err.message);
    }
  };

  const handleOpenRejectModal = (id) => {
    setSelectedRequestId(id);
    setRejectionMessage('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequestId) return;
    
    try {
      await apiClient(`/leaves/${selectedRequestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'REJECTED', adminMessage: rejectionMessage })
      });
      
      setLeaveRequests(prev => prev.map(req => 
        req.id === selectedRequestId ? { ...req, status: 'REJECTED', admin_message: rejectionMessage } : req
      ));
      
      setIsRejectModalOpen(false);
      setSelectedRequestId(null);
    } catch (err) {
      alert("Failed to reject leave: " + err.message);
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-[#E5F7ED] text-[#008A2E] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 w-max"><CheckCircle size={14} /> Approved</span>;
      case 'REJECTED':
        return <span className="bg-[#FDE2E2] text-[#D80000] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 w-max"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="bg-[#FFF4E5] text-[#B26E00] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 w-max"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-[#003F87]">Leave Management</h2>
          <p className="text-slate-500 text-[14px] mt-1">Review and manage employee leave requests</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDE2E2] border border-[#D80000]/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-[#D80000] shrink-0 mt-0.5" size={18} />
          <p className="text-[14px] font-bold text-[#D80000]">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-4 items-center justify-between w-full mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-[240px] md:w-[280px] shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leave requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-medium outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:border-[#003F87]/30 transition-colors w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-3 shrink-0">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer relative py-0.5"
            >
              <option value="ALL">All Requests</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-slate-500">
            Loading leave requests...
          </div>
        ) : filteredRequests.length > 0 ? filteredRequests.map((req) => (
          <div key={req.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-6 md:items-center">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[16px] flex items-center justify-center shrink-0">
                {req.avatar}
              </div>
              <div className="space-y-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-[16px] text-slate-900">{req.requesterName} <span className="text-[13px] font-medium text-slate-500 ml-2">({req.role})</span></h3>
                  {getStatusBadge(req.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                  <div className="text-[13px] text-slate-600">
                    <span className="font-semibold">Type:</span> {req.type}
                  </div>
                  <div className="text-[13px] text-slate-600">
                    <span className="font-semibold">Dates:</span> <span className="font-bold text-slate-800">{req.start_date}</span> to <span className="font-bold text-slate-800">{req.end_date}</span>
                  </div>
                  <div className="text-[13px] text-slate-500">
                    <span className="font-semibold">Applied:</span> {new Date(req.applied_on).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[13px] text-slate-700"><span className="font-bold text-slate-800">Reason:</span> {req.reason}</p>
                  
                  {req.document_url && (
                    <div className="mt-2 flex items-center">
                      <button 
                        onClick={() => {
                          setCurrentDocUrl(req.document_url);
                          setIsDocModalOpen(true);
                        }}
                        className="text-[13px] font-bold text-[#003F87] hover:text-[#002B5E] flex items-center gap-1"
                      >
                        <ExternalLink size={14} /> View Attached Document
                      </button>
                    </div>
                  )}

                  {req.admin_message && (
                    <p className="text-[13px] text-[#D80000] mt-2"><span className="font-bold">Rejection Note:</span> {req.admin_message}</p>
                  )}
                </div>
              </div>
            </div>

            {req.status === 'PENDING' && (
              <div className="flex gap-3 md:flex-col shrink-0">
                <button 
                  onClick={() => handleApprove(req.id)}
                  className="flex-1 md:w-32 bg-[#008A2E] hover:bg-[#007025] text-white px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button 
                  onClick={() => handleOpenRejectModal(req.id)}
                  className="flex-1 md:w-32 bg-white border border-[#D80000] text-[#D80000] hover:bg-[#FFF0F0] px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
            
          </div>
        )) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center text-slate-500">
            No leave requests found matching your filters.
          </div>
        )}
      </div>

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
              <p className="text-[14px] text-slate-600 mb-4">Please provide a reason or message for rejecting this leave request. The employee will see this message.</p>
              <textarea
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows="4"
                className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] transition-colors resize-none mb-6"
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

    </div>
  );
};

export default LeaveManagementContent;
