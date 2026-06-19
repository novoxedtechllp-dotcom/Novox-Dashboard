import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const EmployeeCalendarModal = ({ employee, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMonthlyAttendance = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate();

        const from = `${year}-${month}-01`;
        const to = `${year}-${month}-${lastDay}`;

        const type = employee.type === 'Student' ? 'student' : 'employee';
        const res = await fetch(`/api/v1/attendance?userId=${employee.userId}&type=${type}&from=${from}&to=${to}`, {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setAttendance(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching calendar data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (employee) {
      fetchMonthlyAttendance();
    }
  }, [currentDate, employee]);

  if (!employee) return null;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getStatusForDay = (day) => {
    if (!day) return null;
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    const record = attendance.find(a => a.attendance_date === dateStr || a.attendance_date?.startsWith(dateStr));
    return record ? record.status : null;
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-50 text-slate-400 border-slate-200';
    switch(status.toUpperCase()) {
      case 'PRESENT': return 'bg-emerald-50 text-emerald-600 border-emerald-600';
      case 'LATE': return 'bg-amber-50 text-amber-600 border-amber-600';
      case 'ABSENT': return 'bg-rose-50 text-rose-600 border-rose-600';
      case 'HALF_DAY': return 'bg-blue-50 text-blue-600 border-blue-600';
      default: return 'bg-slate-50 text-slate-400 border-slate-200';
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{employee.name || employee.first_name}</h2>
            <p className="text-sm text-slate-500">Attendance Calendar</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-md hover:bg-slate-50">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-800">
              {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-md hover:bg-slate-50">
              <ChevronRight size={20} />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner text="Loading calendar..." />
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                  const status = getStatusForDay(day);
                  return (
                    <div 
                      key={idx} 
                      className={`h-16 border rounded-md p-1 flex flex-col items-center justify-center ${day ? getStatusColor(status) : 'border-transparent bg-transparent'}`}
                    >
                      {day && (
                        <>
                          <span className="font-semibold text-sm">{day}</span>
                          {status && <span className="text-[10px] font-bold uppercase mt-1 leading-tight text-center">{status.replace('_', ' ')}</span>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">Present</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">Late</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">Half Day</div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">Absent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendarModal;
