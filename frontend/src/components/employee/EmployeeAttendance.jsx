import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Filter, Eye, X, ChevronLeft, ChevronRight, UserCheck, UserX, AlertTriangle, UserMinus } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const EmployeeAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const response = await fetch('/api/v1/attendance', {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        const resData = await response.json();
        if (response.ok) {
          const attArray = resData.data?.attendance || resData.data || [];
          setAttendanceData(attArray);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const [viewRecord, setViewRecord] = useState(null);
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState('2023');

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><UserCheck size={12}/> Present</span>;
      case 'Late': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Late</span>;
      case 'Half Day': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><UserMinus size={12}/> Half Day</span>;
      case 'Absent': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><UserX size={12}/> Absent</span>;
      default: return null;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading attendance..." />;
  }

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative pb-[100px]">
      <div className="w-full flex justify-between items-end h-[60px]">
        <div className="flex flex-col justify-end">
          <h2 className="text-[24px] font-bold text-[#003F87] leading-tight">My Attendance</h2>
          <p className="text-[#555F6B] text-[14px] mt-1">View your check-ins and attendance history.</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e=>setMonth(e.target.value)} className="bg-white border border-[#C2C6D4] text-sm font-semibold rounded-md px-3 py-2 outline-none">
            <option value="October">October</option>
            <option value="September">September</option>
            <option value="August">August</option>
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)} className="bg-white border border-[#C2C6D4] text-sm font-semibold rounded-md px-3 py-2 outline-none">
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-[#003F87] p-3 rounded-lg"><CalendarIcon size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Attendance %</p>
            <p className="text-2xl font-bold text-slate-800">92%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-green-100 text-green-700 p-3 rounded-lg"><UserCheck size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Present Days</p>
            <p className="text-2xl font-bold text-slate-800">18</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 text-amber-700 p-3 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Late Arrivals</p>
            <p className="text-2xl font-bold text-slate-800">2</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#C2C6D4] shadow-sm flex items-center gap-4">
          <div className="bg-red-100 text-red-700 p-3 rounded-lg"><UserX size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Absent Days</p>
            <p className="text-2xl font-bold text-slate-800">1</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="bg-white border border-[#C2C6D4] rounded-xl shadow-sm p-6 lg:col-span-1 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Calendar View</h3>
            <div className="flex gap-2 text-slate-500">
              <button className="hover:text-slate-800"><ChevronLeft size={20}/></button>
              <button className="hover:text-slate-800"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} className="text-xs font-bold text-slate-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Dummy Calendar Days */}
            {Array.from({length: 31}).map((_, i) => {
              const day = i + 1;
              let bg = 'bg-slate-50 text-slate-700 hover:bg-slate-100'; // default
              if (day === 24 || day === 20) bg = 'bg-green-100 text-green-700 font-bold'; // present
              if (day === 23) bg = 'bg-amber-100 text-amber-700 font-bold'; // late
              if (day === 22) bg = 'bg-blue-100 text-blue-700 font-bold'; // half day
              if (day === 21) bg = 'bg-red-100 text-red-700 font-bold'; // absent
              
              return (
                <div key={i} className={`aspect-square rounded-md flex items-center justify-center text-sm cursor-pointer ${bg}`}>
                  {day}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-green-200"></span> Present</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-200"></span> Late</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-blue-200"></span> Half Day</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><span className="w-3 h-3 rounded-full bg-red-200"></span> Absent</div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-[#C2C6D4] rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-[#C2C6D4] flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-lg">Attendance Log</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#C2C6D4]">
                <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Check In</th>
                <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Check Out</th>
                <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Hours</th>
                <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-[#555F6B] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(record => (
                <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-sm text-slate-800">{record.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{record.checkIn}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{record.checkOut}</td>
                  <td className="py-3 px-4 font-bold text-sm text-slate-800">{record.hours}</td>
                  <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setViewRecord(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="View Details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Detail Modal */}
      {viewRecord && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Attendance Details</h2>
              <button onClick={() => setViewRecord(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#003F87]">{new Date(viewRecord.date).toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</h3>
                {getStatusBadge(viewRecord.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Check In</p>
                  <p className="text-lg font-bold text-slate-800">{viewRecord.checkIn}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Check Out</p>
                  <p className="text-lg font-bold text-slate-800">{viewRecord.checkOut}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-600">Total Working Hours</p>
                <p className="text-lg font-bold text-[#003F87]">{viewRecord.hours} <span className="text-sm font-normal text-slate-500">hrs</span></p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                  {viewRecord.status === 'Absent' ? 'Employee was on leave.' : viewRecord.status === 'Late' ? 'Arrived 15 minutes late due to traffic.' : 'Regular shift completed.'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={() => setViewRecord(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md font-semibold text-sm hover:bg-slate-300 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
