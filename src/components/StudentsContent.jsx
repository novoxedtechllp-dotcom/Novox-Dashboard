import React, { useState, useMemo, useEffect } from 'react';
import { GraduationCap, Phone, Plus, X, Upload, User, Trash2, Pencil } from 'lucide-react';

const fallbackCourses = [
  'Full Stack Web Engineering',
  'Advanced Digital Strategy',
  'UI/UX Design Masterclass',
  'Strategic HR Management',
  'Data Science & Analytics'
];

const StudentsContent = ({ searchQuery = '', courses = [] }) => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToEdit, setStudentToEdit] = useState(null);
  
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [monthFilter, setMonthFilter] = useState('All Months');

  const [newStudent, setNewStudent] = useState({
    name: '',
    course: '',
    phone: '',
    feeStatus: 'Paid',
    remainingFees: '',
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

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) return;

      const response = await fetch('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.course) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      
      const payload = {
        name: newStudent.name,
        course: newStudent.course,
        phone: newStudent.phone || '+1 (555) 000-0000',
        feeStatus: newStudent.feeStatus,
        remainingFees: newStudent.remainingFees || '$0.00',
        enrollmentMonth: newStudent.enrollmentMonth,
        avatar: newStudent.avatarUrl
      };

      const addLocally = () => {
        const newId = students.length ? Math.max(...students.map(s => s.id || s._id || 0)) + 1 : 1;
        const addedStudent = {
          id: newId,
          sid: `202401${newId.toString().padStart(2, '0')}`,
          attendance: '100%',
          ...payload,
          avatar: payload.avatar || null
        };
        setStudents([addedStudent, ...students]);
        setIsModalOpen(false);
        setNewStudent({ name: '', course: '', phone: '', feeStatus: 'Paid', remainingFees: '', enrollmentMonth: 'January', avatarUrl: null });
      };

      if (!userInfo.token) {
        addLocally();
        return;
      }

      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const mergedStudent = {
          ...data,
          remainingFees: payload.remainingFees,
          attendance: '100%',
          sid: data.sid || `20240199`
        };
        setStudents([mergedStudent, ...students]);
        setIsModalOpen(false);
        setNewStudent({ name: '', course: '', phone: '', feeStatus: 'Paid', remainingFees: '', enrollmentMonth: 'January', avatarUrl: null });
      } else {
        addLocally();
      }
    } catch (error) {
      console.error('Error creating student:', error);
      addLocally();
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      if (userInfo.token) {
        await fetch(`http://localhost:5000/api/students/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
      }
    } catch (e) {
      console.error('Delete error', e);
    }
    setStudents(students.filter(s => (s.id || s._id) !== id));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setStudents(students.map(s => {
      if ((s.id || s._id) === (studentToEdit.id || studentToEdit._id)) {
        return { ...s, ...studentToEdit };
      }
      return s;
    }));
    setStudentToEdit(null);
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

  const activeCourses = courses.length > 0 ? courses.map(c => c.title || c) : fallbackCourses;
  const uniqueCourses = ['All Courses', ...activeCourses];
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
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-500 font-semibold">Loading Students...</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        
        {filteredStudents.map(student => (
          <div key={student._id || student.id} className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px] relative group hover:border-[#003F87] transition-colors">
            
            <div className="absolute top-[16px] right-[16px] flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => { e.stopPropagation(); setStudentToEdit(student); }}
                className="text-[#C2C6D4] hover:text-[#003F87]"
                title="Edit Student"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setStudentToDelete(student._id || student.id); }}
                className="text-[#C2C6D4] hover:text-[#D80000]"
                title="Delete Student"
              >
                <Trash2 size={16} />
              </button>
            </div>

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
            
            <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-semibold text-[#555F6B]">
                  Fee Status: <span className={`font-bold ${student.feeStatus === 'Paid' ? 'text-[#008A2E]' : student.feeStatus === 'Partially Paid' ? 'text-[#B26E00]' : 'text-[#D80000]'}`}>{student.feeStatus}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#555F6B]">
                  Att: <span className="text-[#003F87] font-bold">{student.attendance}</span>
                </div>
              </div>
              {student.feeStatus === 'Partially Paid' && student.remainingFees && (
                <div className="text-[11px] font-bold text-[#D80000]">
                  Remaining: {student.remainingFees}
                </div>
              )}
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
      )}

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
                  {activeCourses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Fee Status</label>
                  <select 
                    value={newStudent.feeStatus}
                    onChange={(e) => setNewStudent({...newStudent, feeStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                {newStudent.feeStatus === 'Partially Paid' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Remaining Fees</label>
                    <input 
                      type="text" 
                      value={newStudent.remainingFees}
                      onChange={(e) => setNewStudent({...newStudent, remainingFees: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                      placeholder="e.g. $500.00"
                    />
                  </div>
                )}
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

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => setStudentToDelete(null)} 
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleDeleteStudent(studentToDelete); setStudentToDelete(null); }} 
                className="px-4 py-2 bg-[#D80000] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Edit Student</h2>
              <button onClick={() => setStudentToEdit(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStudent} className="p-6 flex flex-col gap-4 overflow-y-auto">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={studentToEdit.name}
                  onChange={(e) => setStudentToEdit({...studentToEdit, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Course</label>
                <select 
                  required
                  value={studentToEdit.course}
                  onChange={(e) => setStudentToEdit({...studentToEdit, course: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  <option value="" disabled>Select a course</option>
                  {activeCourses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={studentToEdit.phone}
                    onChange={(e) => setStudentToEdit({...studentToEdit, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Month</label>
                  <select 
                    value={studentToEdit.enrollmentMonth}
                    onChange={(e) => setStudentToEdit({...studentToEdit, enrollmentMonth: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                  >
                    {uniqueMonths.slice(1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Fee Status</label>
                  <select 
                    value={studentToEdit.feeStatus}
                    onChange={(e) => setStudentToEdit({...studentToEdit, feeStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                {studentToEdit.feeStatus === 'Partially Paid' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Remaining Fees</label>
                    <input 
                      type="text" 
                      value={studentToEdit.remainingFees || ''}
                      onChange={(e) => setStudentToEdit({...studentToEdit, remainingFees: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setStudentToEdit(null)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E] transition-colors"
                >
                  Save Changes
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
