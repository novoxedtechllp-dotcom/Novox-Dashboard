import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) return;

      const headers = { 'Authorization': `Bearer ${userInfo.token}` };
      
      // Fetch attendance for the employee
      const attRes = await fetch('/api/v1/attendance', { headers });
      if (attRes.ok) {
        const data = await attRes.json();
        // Backend returns response inside data.data usually, let's check
        const attData = data.data || data;
        const myAttendance = attData.filter(a => a.employee_id === userInfo.id || a.employee_id === userInfo.employee_profile_id);
        setAttendance(myAttendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handlePunchIn = async () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const res = await fetch('/api/v1/attendance/check-in', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Checked in successfully');
        fetchAttendance();
      } else {
        alert(data.message || 'Failed to check in');
      }
    } catch (err) {
      console.error(err);
      alert('Error checking in');
    }
  };

  const handlePunchOut = async () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const res = await fetch('/api/v1/attendance/check-out', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Checked out successfully');
        fetchAttendance();
      } else {
        alert(data.message || 'Failed to check out');
      }
    } catch (err) {
      console.error(err);
      alert('Error checking out');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  if (loading) return <LoadingSpinner text="Loading your attendance..." />;

  return (
    <div className="p-[24px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">My Attendance</h2>
          <p className="text-slate-500 text-[14px] mt-1">Track your daily punches and working hours</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePunchIn} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 transition-colors">
            <Clock size={18} /> Punch In
          </button>
          <button onClick={handlePunchOut} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-bold text-[14px] flex items-center gap-2 transition-colors">
            <Clock size={18} /> Punch Out
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#003F87]" /> Recent Attendance
          </h3>
          <select className="border border-[#C2C6D4] rounded-md px-3 py-1.5 text-[14px] outline-none">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-[12px] uppercase text-slate-500 border-b border-[#E2E8F0]">
              <th className="py-4 px-6 font-semibold">Date</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Punch In</th>
              <th className="py-4 px-6 font-semibold">Punch Out</th>
              <th className="py-4 px-6 font-semibold">Total Hours</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {attendance.length > 0 ? attendance.map(record => (
              <tr key={record.id} className="border-b border-[#E2E8F0] hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-800">{formatDate(record.attendance_date)}</td>
                <td className="py-4 px-6">
                  {record.status === 'PRESENT' || record.status === 'HALF_DAY' || record.status === 'LATE' ? (
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                      <CheckCircle2 size={14} /> {record.status.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[12px] font-semibold">
                      <XCircle size={14} /> Absent
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-slate-600">{formatTime(record.check_in)}</td>
                <td className="py-4 px-6 text-slate-600">{formatTime(record.check_out)}</td>
                <td className="py-4 px-6 font-medium text-slate-800">{calculateHours(record.check_in, record.check_out)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
