import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, MessageSquare, X, Send } from 'lucide-react';

const LeaveManagementContent = () => {
  // Mock data for Admin/HR
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employeeName: 'Sarah Jenkins',
      role: 'Sales Executive',
      avatar: 'SJ',
      type: 'Sick Leave',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
      reason: 'Not feeling well, running a fever.',
      appliedOn: '2026-06-13',
      status: 'PENDING'
    },
    {
      id: 2,
      employeeName: 'Michael Chang',
      role: 'Frontend Developer',
      avatar: 'MC',
      type: 'Casual Leave',
      startDate: '2026-06-20',
      endDate: '2026-06-22',
      reason: 'Attending a family wedding out of town.',
      appliedOn: '2026-06-10',
      status: 'PENDING'
    },
    {
      id: 3,
      employeeName: 'Emily Davis',
      role: 'Marketing Manager',
      avatar: 'ED',
      type: 'Earned Leave',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
      reason: 'Pre-planned vacation.',
      appliedOn: '2026-06-05',
      status: 'APPROVED'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState('');

  const handleApprove = (id) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'APPROVED' } : req
    ));
  };

  const handleOpenRejectModal = (id) => {
    setSelectedRequestId(id);
    setRejectionMessage('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedRequestId) {
      setLeaveRequests(prev => prev.map(req => 
        req.id === selectedRequestId ? { ...req, status: 'REJECTED', adminMessage: rejectionMessage } : req
      ));
    }
    setIsRejectModalOpen(false);
    setSelectedRequestId(null);
  };

  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
          <h2 className="text-[24px] font-bold text-slate-900">Leave Management</h2>
          <p className="text-slate-500 text-[14px] mt-1">Review and manage employee leave requests</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by employee name or leave type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] text-[14px] px-10 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
          />
        </div>
        
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                filterStatus === status 
                  ? 'bg-[#003F87] text-white' 
                  : 'bg-white text-slate-600 border border-[#E2E8F0] hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'All Requests' : status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? filteredRequests.map((req) => (
          <div key={req.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-6 md:items-center">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[16px] flex items-center justify-center shrink-0">
                {req.avatar}
              </div>
              <div className="space-y-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-[16px] text-slate-900">{req.employeeName} <span className="text-[13px] font-medium text-slate-500 ml-2">({req.role})</span></h3>
                  {getStatusBadge(req.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                  <div className="text-[13px] text-slate-600">
                    <span className="font-semibold">Type:</span> {req.type}
                  </div>
                  <div className="text-[13px] text-slate-600">
                    <span className="font-semibold">Dates:</span> <span className="font-bold text-slate-800">{req.startDate}</span> to <span className="font-bold text-slate-800">{req.endDate}</span>
                  </div>
                  <div className="text-[13px] text-slate-500">
                    <span className="font-semibold">Applied:</span> {req.appliedOn}
                  </div>
                </div>

                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[13px] text-slate-700"><span className="font-bold text-slate-800">Reason:</span> {req.reason}</p>
                  {req.adminMessage && (
                    <p className="text-[13px] text-[#D80000] mt-2"><span className="font-bold">Rejection Note:</span> {req.adminMessage}</p>
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

    </div>
  );
};

export default LeaveManagementContent;
