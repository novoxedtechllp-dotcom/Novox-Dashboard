import React, { useState, useMemo } from 'react';
import { Clock, Plus, X, Upload, BookOpen, User, Trash2 } from 'lucide-react';

const initialCourses = [
  {
    id: 1,
    category: 'DEVELOPMENT',
    title: 'Full Stack Web Engineering',
    duration: '24 Weeks',
    price: '$1,200.00',
    mentorName: 'Sarah Mitchell',
    mentorInitials: 'SM',
    imgUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'
  },
  {
    id: 2,
    category: 'MARKETING',
    title: 'Advanced Digital Strategy',
    duration: '12 Weeks',
    price: '$850.00',
    mentorName: 'David Chen',
    mentorInitials: 'DC',
    imgUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80'
  },
  {
    id: 3,
    category: 'DESIGN',
    title: 'UI/UX Design Masterclass',
    duration: '16 Weeks',
    price: '$990.00',
    mentorName: 'Elena Lopez',
    mentorInitials: 'EL',
    imgUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80'
  },
  {
    id: 4,
    category: 'HR',
    title: 'Strategic HR Management',
    duration: '8 Weeks',
    price: '$600.00',
    mentorName: 'James Baxter',
    mentorInitials: 'JB',
    imgUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&q=80'
  },
  {
    id: 5,
    category: 'DEVELOPMENT',
    title: 'Data Science & Analytics',
    duration: '20 Weeks',
    price: '$1,450.00',
    mentorName: 'Rajiv Kapoor',
    mentorInitials: 'RK',
    imgUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80'
  }
];

const CoursesContent = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'DEVELOPMENT',
    duration: '',
    price: '',
    mentorName: '',
    imgUrl: null
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewCourse({ ...newCourse, imgUrl: url });
    }
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.mentorName) return;

    const newId = courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    
    const words = newCourse.mentorName.trim().split(' ');
    const mentorInitials = words.length > 1 
      ? (words[0][0] + words[1][0]).toUpperCase() 
      : words[0][0].toUpperCase();

    const addedCourse = {
      id: newId,
      title: newCourse.title,
      category: newCourse.category,
      duration: newCourse.duration || '12 Weeks',
      price: newCourse.price || '$0.00',
      mentorName: newCourse.mentorName,
      mentorInitials,
      imgUrl: newCourse.imgUrl || `https://i.pravatar.cc/150?u=${newId + 100}`
    };

    setCourses([...courses, addedCourse]);
    setIsModalOpen(false);
    setNewCourse({ title: '', category: 'DEVELOPMENT', duration: '', price: '', mentorName: '', imgUrl: null });
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const filteredCourses = useMemo(() => {
    if (categoryFilter === 'All Categories') return courses;
    return courses.filter(c => c.category === categoryFilter);
  }, [courses, categoryFilter]);

  const uniqueCategories = ['All Categories', 'DEVELOPMENT', 'MARKETING', 'DESIGN', 'HR'];

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative">
      {/* Top Filter Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[8px] p-[24px] flex flex-col sm:flex-row gap-[24px] h-auto sm:h-[108px] items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-[24px] w-full sm:w-auto flex-1">
          <div className="flex-1 w-full max-w-none sm:max-w-[240px]">
            <label className="block text-[11px] font-bold text-[#555F6B] uppercase tracking-wide mb-2">Category Filter</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#C2C6D4] px-[16px] py-[10px] rounded-[6px] text-[13px] text-slate-800 outline-none appearance-none"
            >
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        <div className="shrink-0 mt-4 sm:mt-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#003F87] text-white px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-[8px] hover:bg-[#002B5E] transition-colors"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-[8px] border border-[#C2C6D4] p-[24px] flex flex-col h-[247px] relative group hover:border-[#003F87] transition-colors">
            
            <button 
              onClick={(e) => { e.stopPropagation(); setCourseToDelete(course.id); }}
              className="absolute top-[16px] right-[16px] text-[#C2C6D4] hover:text-[#D80000] opacity-0 group-hover:opacity-100 transition-all"
              title="Delete Course"
            >
              <Trash2 size={16} />
            </button>

            <div className="flex items-start gap-4 mb-auto">
              <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                {course.imgUrl ? (
                  <img src={course.imgUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={24} className="text-slate-400" />
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#003F87] border-[2px] border-white rounded-full"></div>
              </div>
              <div>
                <span className="inline-block bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] mb-1">{course.category}</span>
                <h3 className="text-[16px] font-bold text-slate-900 leading-tight line-clamp-2">{course.title}</h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 mb-4">
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <Clock size={14} /> Duration: {course.duration}
              </div>
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px]">
                <User size={14} /> Mentor: {course.mentorName}
              </div>
            </div>
            
            <div className="border-t border-dashed border-[#C2C6D4] pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-semibold text-[#555F6B]">
                  Price: <span className="font-bold text-[#008A2E]">{course.price}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#555F6B]">
                  <span onClick={() => setSelectedCourse(course)} className="text-[#003F87] font-bold cursor-pointer hover:underline">View Details</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Course Card */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-[8px] border border-dashed border-[#C2C6D4] p-[24px] flex flex-col items-center justify-center h-[247px] cursor-pointer hover:bg-slate-50 transition-colors text-center"
        >
          <div className="w-[40px] h-[40px] rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#555F6B] mb-3">
            <Plus size={20} />
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Create New Course</h3>
          <p className="text-[11px] text-[#555F6B] mt-1 max-w-[180px]">Design curriculum & assign mentors</p>
        </div>
      </div>

      <div className="w-full flex justify-between items-center pt-[8px]">
        <div className="text-[13px] text-[#555F6B] font-medium">Showing all {filteredCourses.length} courses</div>
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Create New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCourse} className="p-6 flex flex-col gap-4 overflow-y-auto">
              
              <div className="flex items-center gap-4">
                <div className="w-[64px] h-[64px] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {newCourse.imgUrl ? (
                    <img src={newCourse.imgUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={32} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Course Image</label>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded inline-flex items-center gap-2 transition-colors border border-slate-200">
                    <Upload size={14} /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Course Title</label>
                <input 
                  type="text" 
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  placeholder="e.g. Advanced Web Development"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                <select 
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  <option value="DEVELOPMENT">DEVELOPMENT</option>
                  <option value="MARKETING">MARKETING</option>
                  <option value="DESIGN">DESIGN</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Duration</label>
                  <input 
                    type="text" 
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    placeholder="e.g. 12 Weeks"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Price</label>
                  <input 
                    type="text" 
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    placeholder="e.g. $800.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mentor Name</label>
                <input 
                  type="text" 
                  required
                  value={newCourse.mentorName}
                  onChange={(e) => setNewCourse({...newCourse, mentorName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  placeholder="e.g. Jane Smith"
                />
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
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="relative h-[160px] w-full shrink-0 bg-slate-100">
              {selectedCourse.imgUrl ? (
                <img src={selectedCourse.imgUrl} alt={selectedCourse.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <BookOpen size={48} />
                </div>
              )}
              <div className="absolute top-[16px] right-[16px] bg-[#003F87] text-white text-[10px] font-bold px-[12px] py-[4px] rounded-full uppercase tracking-wider">
                {selectedCourse.category}
              </div>
              <button 
                onClick={() => setSelectedCourse(null)} 
                className="absolute top-[16px] left-[16px] w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedCourse.title}</h2>
              <div className="flex flex-col gap-3 text-sm text-slate-600 mt-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2"><Clock size={16} className="text-[#003F87]" /> Duration: <span className="font-bold text-slate-800">{selectedCourse.duration}</span></div>
                <div className="flex items-center gap-2"><User size={16} className="text-[#003F87]" /> Mentor: <span className="font-bold text-slate-800">{selectedCourse.mentorName}</span></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Enrollment Price</span>
                <span className="text-lg font-bold text-[#008A2E]">{selectedCourse.price}</span>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="mt-2 w-full py-2 bg-[#F8FAFC] border border-slate-200 text-slate-600 font-bold text-sm rounded-md hover:bg-slate-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600">Are you sure you want to delete this course? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => setCourseToDelete(null)} 
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleDeleteCourse(courseToDelete); setCourseToDelete(null); }} 
                className="px-4 py-2 bg-[#D80000] text-white rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesContent;
