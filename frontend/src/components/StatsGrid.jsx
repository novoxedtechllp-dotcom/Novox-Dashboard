import React, { useState, useEffect } from 'react';
import { Users, Briefcase, BookOpen, CreditCard, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStudents, getEmployees, getCourses } from '../features/employee/api/employeeApi';

const StatsGrid = () => {
  const [stats, setStats] = useState({
    students: 0,
    employees: 0,
    courses: 0,
    jobApplications: 247 // Mock data since backend API is pending
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [studRes, empRes, courseRes] = await Promise.all([
          getStudents().catch(() => []),
          getEmployees().catch(() => []),
          getCourses().catch(() => [])
        ]);

        let studentsCount = Array.isArray(studRes) ? studRes.length : 0;
        let employeesCount = Array.isArray(empRes) ? empRes.length : 0;
        let coursesCount = Array.isArray(courseRes) ? courseRes.length : 0;

        setStats({
          students: studentsCount,
          employees: employeesCount,
          courses: coursesCount,
          jobApplications: 247 // Keeping mock data until backend is ready
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading stats..." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
      {/* Total Students */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[250px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003F87]">
            <Users size={20} />
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Live Data</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Total Students</p>
          <h3 className="text-3xl font-bold text-slate-800">{stats.students}</h3>
        </div>
      </div>

      {/* Total Employees */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[250px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003F87]">
            <Briefcase size={20} />
          </div>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">Live Data</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Total Employees</p>
          <h3 className="text-3xl font-bold text-slate-800">{stats.employees}</h3>
        </div>
      </div>

      {/* Active Courses */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[250px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003F87]">
            <BookOpen size={20} />
          </div>
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">Live Data</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Active Courses</p>
          <h3 className="text-3xl font-bold text-slate-800">{stats.courses}</h3>
        </div>
      </div>

      {/* Total Job Applications */}

    </div>
  );
};

export default StatsGrid;
