import React, { useState, useMemo, useEffect } from 'react';
import { GraduationCap, Phone, Plus, X, Upload, User, Trash2, MapPin, FileText, Download, Briefcase } from 'lucide-react';

const StudentsContent = ({ searchQuery = '', courses = [] }) => {
  // DB Tables (Mocked)
  const [students, setStudents] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [studentDocuments, setStudentDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  
  // "View Details" Modal State
  const [activeStudent, setActiveStudent] = useState(null);
  const [detailsTab, setDetailsTab] = useState('overview'); // overview, courses, documents

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Form States
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    student_code: '',
    phone: '',
    parent_phone: '',
    address: '',
    joining_date: '',
    status: 'ACTIVE',
    avatarUrl: null
  });

  const [newEnrollment, setNewEnrollment] = useState('');
  const [newDocName, setNewDocName] = useState('');

  // Initial Fetch (Mocked with local state generation instead of backend to respect the "have the details from the backend" but making sure it works robustly with the new schema)
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/students', {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const resData = await response.json();
      if (response.ok) {
        const studentsList = resData.data?.students || resData.data || [];
        // Map old data to new schema if necessary, or assume backend is updated
        const mappedData = studentsList.map(d => ({
          id: d.id || d._id,
          student_code: d.student_code || d.sid || `STD-${Math.floor(Math.random()*1000)}`,
          first_name: d.first_name || (d.name ? d.name.split(' ')[0] : 'Unknown'),
          last_name: d.last_name || (d.name ? d.name.split(' ')[1] || '' : ''),
          phone: d.phone || '',
          parent_phone: d.parent_phone || '',
          address: d.address || 'N/A',
          joining_date: d.joining_date || new Date().toISOString().split('T')[0],
          status: d.status || 'ACTIVE',
          avatar: d.avatar || null
        }));
        setStudents(mappedData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewStudent({ ...newStudent, avatarUrl: url });
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.student_code) return;

    const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const addedStudent = {
      id: newId,
      student_code: newStudent.student_code,
      first_name: newStudent.first_name,
      last_name: newStudent.last_name,
      phone: newStudent.phone,
      parent_phone: newStudent.parent_phone,
      address: newStudent.address,
      joining_date: newStudent.joining_date || new Date().toISOString().split('T')[0],
      status: newStudent.status,
      avatar: newStudent.avatarUrl
    };
    
    setStudents([addedStudent, ...students]);
    setIsAddModalOpen(false);
    setNewStudent({
      first_name: '', last_name: '', student_code: '', phone: '', parent_phone: '', address: '', joining_date: '', status: 'ACTIVE', avatarUrl: null
    });
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
    setStudentCourses(studentCourses.filter(sc => sc.student_id !== id));
    setStudentDocuments(studentDocuments.filter(sd => sd.student_id !== id));
  };

  // Mappings Logic
  const handleEnrollCourse = () => {
    if(!newEnrollment) return;
    const scId = studentCourses.length ? Math.max(...studentCourses.map(sc => sc.id)) + 1 : 1;
    setStudentCourses([...studentCourses, {
      id: scId,
      student_id: activeStudent.id,
      course_id: parseInt(newEnrollment),
      enrolled_at: new Date().toISOString().split('T')[0],
      progress_percentage: '0.00',
      completion_status: 'IN_PROGRESS'
    }]);
    setNewEnrollment('');
  };

  const handleAddDocument = () => {
    if(!newDocName) return;
    const sdId = studentDocuments.length ? Math.max(...studentDocuments.map(sd => sd.id)) + 1 : 1;
    setStudentDocuments([...studentDocuments, {
      id: sdId,
      student_id: activeStudent.id,
      document_type: newDocName,
      document_url: `/docs/mock_${Date.now()}.pdf`,
      uploaded_at: new Date().toISOString().split('T')[0]
    }]);
    setNewDocName('');
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchStatus = statusFilter === 'All Statuses' || student.status === statusFilter;
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      const matchSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          student.student_code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [students, statusFilter, searchQuery]);

  const uniqueStatuses = ['All Statuses', 'ACTIVE', 'COMPLETED', 'DROPPED'];

  const getStatusColor = (status) => {
    if(status === 'ACTIVE') return 'bg-green-100 text-green-700 border-green-200';
    if(status === 'COMPLETED') return 'bg-blue-100 text-[#003F87] border-blue-200';
    if(status === 'DROPPED') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {/* Top Filter Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col sm:flex-row gap-[24px] items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-[24px] w-full sm:w-auto flex-1">
          <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
            <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Status Filter</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none"
            >
              {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="shrink-0 mt-4 sm:mt-0">
          <button 
            onClick={() => setIsAddModalOpen(true)}
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
        
        {filteredStudents.map(student => {
          const studentEnrolledCourses = studentCourses.filter(sc => sc.student_id === student.id);
          
          return (
            <div key={student.id} className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col relative group hover:border-[#003F87] transition-all shadow-sm hover:shadow-md h-[260px]">
              
              <div className="absolute top-[16px] right-[16px] flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={(e) => { e.stopPropagation(); setStudentToDelete(student.id); }}
                  className="w-7 h-7 rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                  title="Delete Student"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-auto">
                <div className="relative w-[56px] h-[56px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center border-2 border-slate-100">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#003F87] font-bold text-xl">{student.first_name[0]}{student.last_name[0]}</span>
                  )}
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-[2px] border-white rounded-full ${student.status === 'ACTIVE' ? 'bg-[#008A2E]' : student.status === 'COMPLETED' ? 'bg-[#003F87]' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1 tracking-wide">{student.student_code}</span>
                  <h3 className="text-[17px] font-bold text-slate-900 leading-tight">{student.first_name} {student.last_name}</h3>
                  <div className={`mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(student.status)}`}>
                    {student.status}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-5 mb-5">
                <div className="flex items-center gap-2 text-[#555F6B] text-[12px] font-medium">
                  <Phone size={14} className="text-[#003F87]" /> {student.phone || 'No phone provided'}
                </div>
                <div className="flex items-center gap-2 text-[#555F6B] text-[12px] font-medium">
                  <GraduationCap size={14} className="text-[#003F87]" /> {studentEnrolledCourses.length} Enrolled Courses
                </div>
              </div>
              
              <div className="border-t border-[#C2C6D4] pt-4 mt-auto">
                <button 
                  onClick={() => { setActiveStudent(student); setDetailsTab('overview'); }}
                  className="w-full text-center py-2 bg-slate-50 text-[#003F87] text-[13px] font-bold rounded-md hover:bg-[#E5F0FF] transition-colors border border-transparent hover:border-[#003F87]"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}

        {/* Enroll Card */}
        <div 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-50 rounded-[8px] border-2 border-dashed border-[#C2C6D4] p-[24px] flex flex-col items-center justify-center h-[260px] cursor-pointer hover:bg-slate-100 hover:border-[#003F87] transition-colors group"
        >
          <div className="w-[48px] h-[48px] rounded-full bg-white shadow-sm flex items-center justify-center text-[#555F6B] group-hover:text-[#003F87] mb-3 transition-colors">
            <Plus size={24} />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">Enroll New Student</h3>
          <p className="text-[12px] text-[#555F6B] mt-1 text-center px-4">Register a new profile in the database</p>
        </div>

      </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="text-xl font-black text-slate-800">Enroll New Student</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 flex flex-col gap-6 overflow-y-auto">
              
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="w-[80px] h-[80px] rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {newStudent.avatarUrl ? (
                    <img src={newStudent.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload size={20} className="text-white" />
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Profile Photo</h3>
                  <p className="text-xs text-slate-500">Upload a clear photo. Supported formats: JPG, PNG, WEBP (Max 2MB).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">First Name</label>
                  <input type="text" required value={newStudent.first_name} onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Last Name</label>
                  <input type="text" required value={newStudent.last_name} onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Student Code</label>
                  <input type="text" required value={newStudent.student_code} onChange={(e) => setNewStudent({...newStudent, student_code: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm font-mono text-[#003F87] bg-[#F8FAFC]" placeholder="STD-XXXX" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Joining Date</label>
                  <input type="date" required value={newStudent.joining_date} onChange={(e) => setNewStudent({...newStudent, joining_date: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Student Phone</label>
                  <input type="text" required value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Parent Phone</label>
                  <input type="text" value={newStudent.parent_phone} onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Address</label>
                <textarea rows="2" value={newStudent.address} onChange={(e) => setNewStudent({...newStudent, address: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm resize-none" placeholder="123 Street Name, City, Country" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Account Status</label>
                <select value={newStudent.status} onChange={(e) => setNewStudent({...newStudent, status: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm bg-white">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="DROPPED">DROPPED</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-2 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[#003F87] rounded-lg text-sm font-bold text-white hover:bg-[#002B5E] shadow-sm transition-colors">
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setStudentToDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Delete Student?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">This will permanently remove the student profile, all their enrolled course data, and uploaded documents. This cannot be undone.</p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => setStudentToDelete(null)} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex-1">
                Cancel
              </button>
              <button onClick={() => { handleDeleteStudent(studentToDelete); setStudentToDelete(null); }} className="px-5 py-2.5 bg-[#D80000] text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors flex-1">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Command Center Modal */}
      {activeStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveStudent(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="px-8 py-6 bg-[#003F87] text-white flex items-start justify-between shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-xl bg-white/10 border-2 border-white/20 p-1 flex items-center justify-center shrink-0">
                  {activeStudent.avatar ? (
                    <img src={activeStudent.avatar} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <User size={36} className="text-white/80" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black">{activeStudent.first_name} {activeStudent.last_name}</h2>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${activeStudent.status === 'ACTIVE' ? 'bg-green-500' : activeStudent.status === 'COMPLETED' ? 'bg-blue-400' : 'bg-red-500'}`}>
                      {activeStudent.status}
                    </span>
                  </div>
                  <p className="text-blue-200 text-sm font-medium flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-white font-mono text-xs">{activeStudent.student_code}</span>
                    • Joined {new Date(activeStudent.joining_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button onClick={() => setActiveStudent(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors relative z-10">
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex px-8 border-b border-slate-200 bg-slate-50 shrink-0">
              <button 
                onClick={() => setDetailsTab('overview')} 
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${detailsTab === 'overview' ? 'border-[#003F87] text-[#003F87]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <User size={16} /> Overview
              </button>
              <button 
                onClick={() => setDetailsTab('courses')} 
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${detailsTab === 'courses' ? 'border-[#003F87] text-[#003F87]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <GraduationCap size={16} /> Course Enrollments
                <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{studentCourses.filter(c => c.student_id === activeStudent.id).length}</span>
              </button>
              <button 
                onClick={() => setDetailsTab('documents')} 
                className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${detailsTab === 'documents' ? 'border-[#003F87] text-[#003F87]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <FileText size={16} /> Documents
                <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] ml-1">{studentDocuments.filter(d => d.student_id === activeStudent.id).length}</span>
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              
              {/* Overview Tab */}
              {detailsTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={16} className="text-[#003F87]" /> Contact & Location</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Phone</div>
                        <div className="text-sm font-semibold text-slate-800">{activeStudent.phone || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Parent Phone</div>
                        <div className="text-sm font-semibold text-slate-800">{activeStudent.parent_phone || 'N/A'}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Address</div>
                        <div className="text-sm font-semibold text-slate-800">{activeStudent.address || 'No address provided'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={16} className="text-[#003F87]" /> Account Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Code</div>
                        <div className="text-sm font-mono font-bold text-[#003F87] bg-blue-50 inline-block px-2 py-0.5 rounded">{activeStudent.student_code}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Joining Date</div>
                        <div className="text-sm font-semibold text-slate-800">{new Date(activeStudent.joining_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">System Status</div>
                        <div className="text-sm font-semibold text-slate-800">{activeStudent.status}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Courses Tab (student_courses) */}
              {detailsTab === 'courses' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex gap-4 items-end bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Enroll in New Course</label>
                      <select 
                        value={newEnrollment}
                        onChange={(e) => setNewEnrollment(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm bg-white"
                      >
                        <option value="" disabled>Select an available course...</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handleEnrollCourse}
                      disabled={!newEnrollment}
                      className="px-6 py-2.5 bg-[#003F87] text-white rounded-lg text-sm font-bold hover:bg-[#002B5E] disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Enroll
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mt-8 mb-4">Current Enrollments</h3>
                    {studentCourses.filter(sc => sc.student_id === activeStudent.id).length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <GraduationCap size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 font-medium">No courses enrolled yet.</p>
                      </div>
                    ) : (
                      studentCourses.filter(sc => sc.student_id === activeStudent.id).map(sc => {
                        const courseData = courses.find(c => c.id === sc.course_id);
                        return (
                          <div key={sc.id} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-[#003F87] hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 text-[#003F87] rounded-lg flex items-center justify-center">
                                <GraduationCap size={20} />
                              </div>
                              <div>
                                <h4 className="text-[15px] font-bold text-slate-900">{courseData ? courseData.title : 'Unknown Course'}</h4>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                                  <span>Enrolled: {new Date(sc.enrolled_at).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className={`px-2 py-0.5 rounded font-bold ${sc.completion_status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : sc.completion_status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {sc.completion_status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Progress</div>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#003F87]" style={{ width: `${sc.progress_percentage}%` }}></div>
                                </div>
                                <span className="text-sm font-bold text-slate-800 w-10">{sc.progress_percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Documents Tab (student_documents) */}
              {detailsTab === 'documents' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex gap-4 items-end bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Upload New Document</label>
                      <div className="flex items-center gap-3">
                        <select 
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          className="w-48 px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] text-sm bg-white"
                        >
                          <option value="" disabled>Document Type</option>
                          <option value="ID Proof">ID Proof</option>
                          <option value="Previous Marksheet">Previous Marksheet</option>
                          <option value="Enrollment Agreement">Enrollment Agreement</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="flex-1 relative">
                          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="w-full px-4 py-2.5 border border-slate-300 border-dashed rounded-lg text-sm text-slate-500 bg-white flex items-center gap-2">
                            <Upload size={16} /> Choose File...
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleAddDocument}
                      disabled={!newDocName}
                      className="px-6 py-2.5 bg-[#003F87] text-white rounded-lg text-sm font-bold hover:bg-[#002B5E] disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Upload
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {studentDocuments.filter(sd => sd.student_id === activeStudent.id).length === 0 ? (
                      <div className="col-span-full text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 font-medium">No documents uploaded.</p>
                      </div>
                    ) : (
                      studentDocuments.filter(sd => sd.student_id === activeStudent.id).map(sd => (
                        <div key={sd.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#003F87] transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-[#003F87] rounded-lg flex items-center justify-center">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-bold text-slate-900">{sd.document_type}</h4>
                              <div className="text-xs font-medium text-slate-500 mt-0.5">Uploaded {new Date(sd.uploaded_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-[#003F87] hover:bg-[#003F87] hover:text-white transition-colors border border-slate-200 hover:border-transparent">
                            <Download size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsContent;

