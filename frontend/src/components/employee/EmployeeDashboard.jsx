import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, Calendar, ChevronRight, LogIn, LogOut, Check, FileText, Briefcase, Award, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EmployeeDashboard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [greeting, setGreeting] = useState('');
  
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedUserInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!storedUserInfo || !storedUserInfo.token) return;
        setUserInfo(storedUserInfo);
        
        const headers = { 'Authorization': `Bearer ${storedUserInfo.token}` };
        
        // Fetch tasks
        const tasksRes = await fetch('/api/v1/tasks', { headers });
        if (tasksRes.ok) {
          const resData = await tasksRes.json();
          const tasksArray = resData.data?.tasks || resData.data || [];
          setRecentTasks(tasksArray.slice(0, 3));
        }

        // Fetch payroll
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
    setToastMessage(isCheckedIn 
      ? "You have successfully checked out." 
      : "You have successfully checked in for the day at " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownloadPDF = (month) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Payslip - ${month}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Employee: ${userInfo?.first_name || 'Staff'} ${userInfo?.last_name || ''}`, 14, 30);
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
    
    doc.save(`payslip_${month?.replace(' ', '_').toLowerCase() || 'latest'}.pdf`);
  };

  const employeeName = userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() : 'Staff Member';

  if (loading) {
    return <LoadingSpinner text="Loading your workspace..." />;
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto pb-24">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003F87] via-blue-800 to-indigo-900 shadow-xl border border-blue-400/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl mix-blend-overlay"></div>
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-white">
            <p className="text-blue-200 font-medium mb-1 text-sm md:text-base tracking-wide uppercase">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Welcome back, {employeeName}!</h1>
            <p className="text-blue-100/80 text-sm md:text-base max-w-xl leading-relaxed">
              Here is your daily workspace overview. Stay updated with your pending tasks, latest payslips, and daily attendance records.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
            <button 
              onClick={handleCheckInOut}
              className={`
                relative overflow-hidden px-8 py-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all duration-300 shadow-md group
                ${isCheckedIn 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-orange-500/30' 
                  : 'bg-white text-[#003F87] hover:shadow-white/30'}
              `}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isCheckedIn ? <LogOut size={18} /> : <LogIn size={18} />}
                {isCheckedIn ? 'Check Out' : 'Punch In Now'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Quick Actions */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Quick Actions (Requested Placeholder) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 hover:text-[#003F87] transition-all group cursor-pointer text-slate-600">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-[#003F87]">
                  <CheckSquare size={18} />
                </div>
                <span className="text-xs font-semibold text-center">Mark Attendance</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all group cursor-pointer text-slate-600">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-purple-600">
                  <Award size={18} />
                </div>
                <span className="text-xs font-semibold text-center">Grade Assessments</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all group cursor-pointer text-slate-600">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-emerald-600">
                  <FileText size={18} />
                </div>
                <span className="text-xs font-semibold text-center">Request Leave</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all group cursor-pointer text-slate-600">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-orange-600">
                  <Briefcase size={18} />
                </div>
                <span className="text-xs font-semibold text-center">View Policies</span>
              </button>
            </div>
          </div>

          {/* Recent Tasks Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CheckSquare size={20} className="text-blue-500" />
                My Recent Tasks
              </h3>
              <Link to="/employee/tasks" className="text-sm font-semibold text-[#003F87] hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="flex flex-col gap-3 flex-1">
              {recentTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                    <CheckSquare size={20} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">You're all caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending tasks for today.</p>
                </div>
              ) : (
                recentTasks.map((task, i) => (
                  <div key={i} className="group flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                        <CheckSquare size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-[#003F87] transition-colors">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> {task.due || 'No Deadline'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg border border-amber-100 shadow-sm shrink-0">
                      {task.status || 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>

        {/* Right Column: Stats & Payslips */}
        <div className="flex flex-col gap-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#003F87] transition-all">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hours Logged</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-black text-slate-800">32.5</p>
                  <p className="text-sm font-semibold text-slate-500 mb-1">hrs</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#003F87] group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Rate</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-black text-slate-800">98%</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 mt-1">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-bold">+2% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
                <Calendar size={20} />
              </div>
            </div>
          </div>

          {/* Recent Payslips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileText size={20} className="text-indigo-500" />
                Latest Payslips
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {recentPayslips.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText size={24} className="text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">No payslips generated yet.</p>
                </div>
              ) : (
                recentPayslips.map((ps, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black uppercase">{ps.monthName ? ps.monthName.substring(0,3) : 'CUR'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{ps.monthName || 'Current Month'}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Processed on {ps.processedDate || new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadPDF(ps.monthName)} 
                      className="text-[#003F87] bg-blue-50 p-2 rounded-lg hover:bg-[#003F87] hover:text-white transition-colors"
                      title="Download PDF"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <Link to="/employee/payroll" className="w-full mt-auto pt-4 border-t border-slate-100 text-sm font-bold text-slate-500 hover:text-[#003F87] text-center transition-colors">
              View All Payslips
            </Link>
          </div>
          
        </div>
      </div>
      
      {/* Toast Notification */}
      <div 
        className={`
          fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 transition-all duration-300 transform
          ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}
        `}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        </div>
        <p className="text-sm font-medium tracking-wide">{toastMessage}</p>
      </div>
      
    </div>
  );
};

export default EmployeeDashboard;
