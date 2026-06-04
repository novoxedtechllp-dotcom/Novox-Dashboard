import React, { useState, useMemo } from 'react';
import { GraduationCap, Phone, Plus, X, Upload, User } from 'lucide-react';

const StudentsContent = ({ searchQuery = '', courses = [] }) => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [monthFilter, setMonthFilter] = useState('All Months');

  const [newStudent, setNewStudent] = useState({
    name: '',
    course: '',
    phone: '',
    feeStatus: 'Paid',
    enrollmentMonth: 'January',
    avatarUrl: null
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewStudent({ ...newStudent, avatarUrl: url });
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.course) return;

    const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const addedStudent = {
      id: newId,
      sid: `202401${newId.toString().padStart(2, '0')}`,
      name: newStudent.name,
      course: newStudent.course,
      phone: newStudent.phone || '+1 (555) 000-0000',
      feeStatus: newStudent.feeStatus,
      attendance: '100%',
      enrollmentMonth: newStudent.enrollmentMonth,
      avatar: newStudent.avatarUrl
    };

    setStudents([addedStudent, ...students]);
    setIsModalOpen(false);
    setNewStudent({ name: '', course: '', phone: '', feeStatus: 'Paid', enrollmentMonth: 'January', avatarUrl: null });
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchCourse = courseFilter === 'All Courses' || student.course === courseFilter;
      const matchMonth = monthFilter === 'All Months' || student.enrollmentMonth === monthFilter;
      const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.sid.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCourse && matchMonth && matchSearch;
    });
  }, [students, courseFilter, monthFilter, searchQuery]);

  // Extract unique courses from global courses array
  const uniqueCourses = ['All Courses', ...courses.map(c => c.title)];
  const uniqueMonths = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {/* Top Filter Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col sm:flex-row gap-[24px] h-auto sm:h-[108px] items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-[24px] w-full sm:w-auto flex-1">
          <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
            <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Course Filter</label>
            <select 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none"
            >
              {uniqueCourses.map(course => <option key={course} value={course}>{course}</option>)}
            </select>
          </div>
          <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
            <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Enrollment Month</label>
            <select 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none"
            >
              {uniqueMonths.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
        </div>
        <div className="shrink-0 mt-4 sm:mt-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003F87] text-white px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-[8px] hover:bg-[#002B5E] transition-colors"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        
        {filteredStudents.map(student => (
          <div key={student.id || student._id} className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px]">
            <div className="flex items-start gap-4 mb-auto">
              <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-slate-400" />
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#008A2E] border-[2px] border-white rounded-full"></div>
              </div>
              <div>
                <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">SID: {student.sid}</span>
                <h3 className="text-[16px] font-bold text-slate-900 leading-tight">{student.name}</h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 mb-4">
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <GraduationCap size={14} /> {student.course}
              </div>
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <Phone size={14} /> {student.phone}
              </div>
            </div>
            
            <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex justify-between items-center">
              <div className="text-[11px] font-semibold text-[#555F6B]">
                Fee Status: <span className={`font-bold ${student.feeStatus === 'Paid' ? 'text-[#008A2E]' : 'text-[#D80000]'}`}>{student.feeStatus}</span>
              </div>
              <div className="text-[11px] font-semibold text-[#555F6B]">
                Att: <span className="text-[#003F87] font-bold">{student.attendance}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Enroll Card */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-[8px] border border-dashed border-[#C2C6D4] p-[24px] flex flex-col items-center justify-center h-[247px] cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="w-[40px] h-[40px] rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#555F6B] mb-3">
            <Plus size={20} />
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Enroll New Student</h3>
          <p className="text-[11px] text-[#555F6B] mt-1">Quick intake form</p>
        </div>

      </div>

      {/* Pagination (Removed for infinite scroll/all-on-one-page) */}
      <div className="w-full flex justify-between items-center pt-[8px]">
        <div className="text-[13px] text-[#555F6B] font-medium">Showing all {filteredStudents.length} students</div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Enroll New Student</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 flex flex-col gap-4 overflow-y-auto">
              
              <div className="flex items-center gap-4">
                <div className="w-[64px] h-[64px] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {newStudent.avatarUrl ? (
                    <img src={newStudent.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Profile Picture</label>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded inline-flex items-center gap-2 transition-colors border border-slate-200">
                    <Upload size={14} /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Course</label>
                <select 
                  required
                  value={newStudent.course}
                  onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    placeholder="e.g. +1 (555)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Month</label>
                  <select 
                    value={newStudent.enrollmentMonth}
                    onChange={(e) => setNewStudent({...newStudent, enrollmentMonth: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Fee Status</label>
                <select 
                  value={newStudent.feeStatus}
                  onChange={(e) => setNewStudent({...newStudent, feeStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E] transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsContent;
