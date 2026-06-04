import React from 'react';
import { Clock, Plus, CreditCard } from 'lucide-react';
import {useState} from 'react';
import AddStudentBtn from './AddBtn';
import AddBtn from './AddBtn';

const CoursesContent = ({ courses = [], setCourses }) => {
  const handleAddCourse = () => {
    if (!setCourses) return;
    const title = window.prompt("Enter new course title:");
    if (!title) return;
    const category = window.prompt("Enter course category (e.g. DEVELOPMENT):") || "GENERAL";
    
    const newCourse = {
      id: courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1,
      category: category.toUpperCase(),
      title,
      duration: '12 Weeks',
      price: '$999.00',
      mentorName: 'New Mentor',
      mentorInitials: 'NM',
      imgUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80'
    };
    setCourses([...courses, newCourse]);
  };
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full">
      {/* Header Container: 972 x 56 */}
      <div className="w-full flex justify-between items-center h-[56px]">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight">Course Management</h2>
          <p className="text-[13px] text-[#555F6B] mt-1">Manage institutional academic offerings and mentor assignments.</p>
        </div>
<<<<<<< HEAD
        <AddBtn title="Add Course" />
=======
        <button onClick={handleAddCourse} className="bg-[#003F87] text-white px-[20px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
          <Plus size={16} /> Add Course
        </button>
>>>>>>> 3ed7742abbb34d709942173671f0e8468e85b94d
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
