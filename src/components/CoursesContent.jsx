import React from 'react';
import { Clock, Plus, CreditCard } from 'lucide-react';

const courses = [
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
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      {/* Header Container: 972 x 56 */}
      <div className="w-full flex justify-between items-center h-[56px]">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight">Course Management</h2>
          <p className="text-[13px] text-[#555F6B] mt-1">Manage institutional academic offerings and mentor assignments.</p>
        </div>
        <button className="bg-[#003F87] text-white px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Filter Section: 972 x 44 */}
      <div className="flex items-center gap-[16px] h-[44px] overflow-x-auto pb-2 sm:pb-0" style={{scrollbarWidth: 'none'}}>
        <span className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wide whitespace-nowrap">FILTER BY CATEGORY:</span>
        <div className="flex items-center gap-[8px]">
          <button className="bg-[#003F87] text-white px-[16px] py-[6px] rounded-full text-[12px] font-bold whitespace-nowrap shadow-sm">All Courses</button>
          <button className="bg-[#F8FAFC] text-[#555F6B] hover:bg-[#E2E8F0] px-[16px] py-[6px] rounded-full text-[12px] font-bold transition-colors whitespace-nowrap">Development</button>
          <button className="bg-[#F8FAFC] text-[#555F6B] hover:bg-[#E2E8F0] px-[16px] py-[6px] rounded-full text-[12px] font-bold transition-colors whitespace-nowrap">Marketing</button>
          <button className="bg-[#F8FAFC] text-[#555F6B] hover:bg-[#E2E8F0] px-[16px] py-[6px] rounded-full text-[12px] font-bold transition-colors whitespace-nowrap">Design</button>
          <button className="bg-[#F8FAFC] text-[#555F6B] hover:bg-[#E2E8F0] px-[16px] py-[6px] rounded-full text-[12px] font-bold transition-colors whitespace-nowrap">HR</button>
        </div>
      </div>

      {/* Grid Container: 972 x 982 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[24px]">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-[8px] border border-[#C2C6D4] h-[493px] flex flex-col overflow-hidden">
            {/* Image Section */}
            <div className="relative h-[200px] w-full shrink-0">
              <img src={course.imgUrl} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute top-[16px] right-[16px] bg-[#003F87] text-white text-[10px] font-bold px-[12px] py-[4px] rounded-full uppercase tracking-wider">
                {course.category}
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-[24px] flex flex-col flex-1">
              <h3 className="text-[18px] font-bold text-slate-900 leading-tight mb-3">{course.title}</h3>
              
              <div className="flex items-center gap-2 text-[#555F6B] text-[12px] mb-2 font-medium">
                <Clock size={14} /> Duration: {course.duration}
              </div>
              <div className="flex items-center gap-2 text-[#003F87] text-[13px] font-bold mb-4">
                <CreditCard size={14} /> {course.price}
              </div>
              
              <div className="h-[1px] w-full bg-slate-200 my-4"></div>
              
              <div className="flex items-center gap-3 mb-auto">
                <div className="w-[32px] h-[32px] rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[11px] flex items-center justify-center shrink-0">
                  {course.mentorInitials}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider">MENTOR</div>
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">{course.mentorName}</div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex items-center gap-[12px] mt-6">
                <button className="flex-1 border border-[#C2C6D4] text-[#003F87] font-bold text-[13px] py-[8px] rounded-[6px] hover:bg-blue-50 transition-colors shadow-sm">
                  View
                </button>
                <button className="flex-1 bg-[#F8FAFC] text-[#555F6B] font-bold text-[13px] py-[8px] rounded-[6px] hover:bg-[#E2E8F0] transition-colors border border-[#C2C6D4] shadow-sm">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Create New Course Card */}
        <div className="bg-[#F8FAFC] rounded-[8px] border border-dashed border-[#C2C6D4] h-[493px] flex flex-col items-center justify-center p-[32px] cursor-pointer hover:bg-slate-100 transition-colors text-center">
          <div className="w-[48px] h-[48px] rounded-full bg-[#E5F0FF] flex items-center justify-center text-[#003F87] mb-4">
            <Plus size={24} />
          </div>
          <h3 className="text-[16px] font-bold text-slate-900 mb-2">Create New Course</h3>
          <p className="text-[13px] text-[#555F6B] max-w-[200px]">Design a new curriculum and assign expert mentors to your institution.</p>
        </div>

      </div>
    </div>
  );
};

export default CoursesContent;
