import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Plus, Search, Calendar, Briefcase } from 'lucide-react';

const WorkReportsContent = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    // Mock Fetch Data
    setProjects([
      { id: 'proj-1', name: 'Frontend Refactor', status: 'ACTIVE' },
      { id: 'proj-2', name: 'Database Migration', status: 'ACTIVE' }
    ]);
    
    setEmployees([
      { id: 'emp-1', name: 'Alice Johnson', department: 'Engineering' },
      { id: 'emp-2', name: 'Bob Smith', department: 'Marketing' }
    ]);

    setReports([
      { id: 'wr-1', employee_id: 'emp-1', project_id: 'proj-1', report_type: 'DAILY', work_done: 'Completed React components.', blockers: 'None', submitted_at: new Date().toISOString(), approval_status: 'PENDING' },
      { id: 'wr-2', employee_id: 'emp-2', project_id: 'proj-2', report_type: 'WEEKLY', work_done: 'Analyzed user behavior.', blockers: 'Waiting on data team.', submitted_at: new Date(Date.now() - 86400000).toISOString(), approval_status: 'APPROVED' }
    ]);
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setReports(reports.map(r => r.id === id ? { ...r, approval_status: newStatus } : r));
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'ALL' && r.approval_status !== statusFilter) return false;
    const emp = employees.find(e => e.id === r.employee_id);
    if (searchQuery && emp && !emp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87]">Work Reports</h2>
          <p className="text-[13px] text-[#555F6B]">Manage daily and weekly employee submissions.</p>
        </div>
        <button className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
          <Plus size={16} /> Submit Report
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 border border-[#C2C6D4] rounded-lg">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md flex-1">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-sm outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(report => {
          const emp = employees.find(e => e.id === report.employee_id) || {};
          const proj = projects.find(p => p.id === report.project_id) || {};
          
          return (
            <div key={report.id} className="bg-white border border-[#C2C6D4] rounded-xl p-5 hover:border-[#003F87] transition-colors flex flex-col relative group shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003F87] flex items-center justify-center font-bold text-sm">
                    {emp.name ? emp.name.substring(0, 2).toUpperCase() : '??'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{emp.name}</h3>
                    <p className="text-xs text-slate-500">{new Date(report.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  report.approval_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  report.approval_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {report.approval_status}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                    <Briefcase size={12} /> {proj.name}
                  </div>
                  <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{report.report_type}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Work Done</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded">{report.work_done}</p>
                </div>
                {report.blockers && report.blockers !== 'None' && (
                  <div>
                    <h4 className="text-xs font-bold text-red-700 mb-1">Blockers</h4>
                    <p className="text-sm text-red-600 leading-relaxed bg-red-50 p-2 rounded">{report.blockers}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-auto border-t border-slate-100 pt-4 flex gap-2">
                <button 
                  onClick={() => handleStatusChange(report.id, 'APPROVED')}
                  disabled={report.approval_status === 'APPROVED'}
                  className="flex-1 bg-green-50 text-green-700 py-2 rounded-md text-xs font-bold hover:bg-green-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button 
                  onClick={() => handleStatusChange(report.id, 'REJECTED')}
                  disabled={report.approval_status === 'REJECTED'}
                  className="flex-1 bg-red-50 text-red-700 py-2 rounded-md text-xs font-bold hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkReportsContent;
