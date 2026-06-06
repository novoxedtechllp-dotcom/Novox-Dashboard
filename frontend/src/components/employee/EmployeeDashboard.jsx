import React, { useState } from 'react';
import { CheckSquare, Clock, Calendar, ChevronRight, LogIn, LogOut, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EmployeeDashboard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const headers = { 'Authorization': `Bearer ${userInfo.token}` };
        
        const tasksRes = await fetch('/api/v1/tasks', { headers });
        if (tasksRes.ok) {
          const resData = await tasksRes.json();
          const tasksArray = resData.data?.tasks || resData.data || [];
          setRecentTasks(tasksArray.slice(0, 2));
        }

        const prRes = await fetch('/api/v1/payroll', { headers });
        if (prRes.ok) {
          const resData = await prRes.json();
          const prArray = resData.data?.payroll || resData.data || [];
          setRecentPayslips(prArray.slice(0, 2));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleCheckInOut = () => {
    setIsCheckedIn(!isCheckedIn);
    setToastMessage(isCheckedIn ? "You have successfully checked out." : "You have successfully checked in for the day at " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownloadPDF = (month) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Payslip - ${month}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Employee: Staff Member`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
    
    doc.autoTable({
      head: [['Description', 'Amount']],
      body: [
        ['Basic Salary', '₹45,000'],
        ['Allowances', '₹8,500'],
        ['Deductions', '₹2,000'],
        ['Net Pay', '₹51,500'],
      ],
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [0, 63, 135] }
    });
    
    doc.save(`payslip_${month.replace(' ', '_').toLowerCase()}.pdf`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">Welcome Back, Staff!</h2>
          <p className="text-[#555F6B] text-[14px] mt-1">Here is an overview of your work today.</p>
        </div>
        <button 
          onClick={handleCheckInOut}
          className={`${isCheckedIn ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#003F87] hover:bg-[#002B5E]'} text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm`}
        >
          {isCheckedIn ? <LogOut size={16} /> : <LogIn size={16} />}
          {isCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/employee/tasks" className="bg-white p-6 rounded-2xl border border-[#C2C6D4] shadow-sm flex items-center gap-4 hover:border-[#003F87] transition-colors group cursor-pointer">
          <div className="bg-amber-100 text-amber-600 p-4 rounded-xl group-hover:scale-105 transition-transform">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Pending Tasks</p>
            <p className="text-3xl font-bold text-slate-800">12</p>
          </div>
        </Link>
        <Link to="/employee/attendance" className="bg-white p-6 rounded-2xl border border-[#C2C6D4] shadow-sm flex items-center gap-4 hover:border-[#003F87] transition-colors group cursor-pointer">
          <div className="bg-blue-100 text-[#003F87] p-4 rounded-xl group-hover:scale-105 transition-transform">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Hours Logged</p>
            <p className="text-3xl font-bold text-slate-800">32.5<span className="text-sm font-normal text-slate-500 ml-1">hrs</span></p>
          </div>
        </Link>
        <Link to="/employee/attendance" className="bg-white p-6 rounded-2xl border border-[#C2C6D4] shadow-sm flex items-center gap-4 hover:border-[#003F87] transition-colors group cursor-pointer">
          <div className="bg-green-100 text-green-600 p-4 rounded-xl group-hover:scale-105 transition-transform">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Attendance Rate</p>
            <p className="text-3xl font-bold text-slate-800">98%</p>
          </div>
        </Link>
      </div>

      {/* Quick Links / Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Recent Tasks */}
        <div className="bg-white border border-[#C2C6D4] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">My Recent Tasks</h3>
            <Link to="/employee/tasks" className="text-sm font-semibold text-[#003F87] hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No recent tasks found.</p>
            ) : (
              recentTasks.map((task, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Due: {task.due}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">{task.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payslips */}
        <div className="bg-white border border-[#C2C6D4] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Recent Payslips</h3>
            <Link to="/employee/payroll" className="text-sm font-semibold text-[#003F87] hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentPayslips.length === 0 ? (
              <p className="text-sm text-slate-500">No recent payslips found.</p>
            ) : (
              recentPayslips.map((ps, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-800">{ps.monthName}</p>
                    <p className="text-xs text-slate-500 mt-1">Processed on {ps.processedDate}</p>
                  </div>
                  <button onClick={() => handleDownloadPDF(ps.monthName)} className="text-sm font-bold text-[#003F87] hover:underline">Download PDF</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check size={14} className="text-white" />
          </div>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
