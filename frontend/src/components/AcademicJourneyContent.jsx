import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ChevronRight, ChevronLeft, Download, FileText, Code, Palette, MousePointerClick, 
  Users, Award, TrendingDown, Gauge, Search, Filter, X, Plus, Trash2 
} from 'lucide-react';

const AcademicJourneyContent = () => {
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [participationFilter, setParticipationFilter] = useState('All');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedDept, setSelectedDept] = useState('Web Development');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDuration, setNewModuleDuration] = useState('');
  const [curriculumData, setCurriculumData] = useState({
    'Web Development': [
      { id: 1, title: 'HTML & CSS Basics', duration: '2 weeks' },
      { id: 2, title: 'JavaScript Fundamentals', duration: '3 weeks' },
      { id: 3, title: 'React JS', duration: '4 weeks' },
    ],
    'Mobile Development': [
      { id: 4, title: 'Dart Programming', duration: '2 weeks' },
      { id: 5, title: 'Flutter UI', duration: '3 weeks' },
    ],
    'Design': [
      { id: 6, title: 'Color Theory', duration: '1 week' },
      { id: 7, title: 'Figma Prototyping', duration: '3 weeks' },
    ],
    'Marketing': [
      { id: 8, title: 'SEO Basics', duration: '2 weeks' },
      { id: 9, title: 'Social Media Strategy', duration: '3 weeks' },
    ]
  });

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    setCurriculumData(prev => ({
      ...prev,
      [selectedDept]: [
        ...prev[selectedDept],
        { id: Date.now(), title: newModuleTitle, duration: newModuleDuration || '1 week' }
      ]
    }));
    setNewModuleTitle('');
    setNewModuleDuration('');
  };

  const handleDeleteModule = (id) => {
    setCurriculumData(prev => ({
      ...prev,
      [selectedDept]: prev[selectedDept].filter(mod => mod.id !== id)
    }));
  };

  const handleReset = () => {
    setCourseFilter('All Courses');
    setCategoryFilter('All Categories');
    setBatchFilter('All Batches');
    setParticipationFilter('All');
  };

  const handleDownload = () => {
    generateReportPDF();
  };

  const generateReportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 63, 135); // #003F87
    doc.text('Novox Edtech', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(85, 95, 107);
    doc.text('Detailed Institutional Report', 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

    // Summary Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 14, 50);
    doc.setFontSize(10);
    doc.text('Overall completion rate has increased by 4% this quarter.', 14, 58);
    doc.text('MERN Stack Development shows the highest engagement.', 14, 64);
    doc.text('Drop-out risk has steadily declined over the last 6 months.', 14, 70);

    // Metrics Table
    autoTable(doc, {
      startY: 80,
      head: [['Metric', 'Current Value', 'Trend']],
      body: [
        ['Active Students', '1,240', '+12%'],
        ['Avg. Completion Rate', '72%', '+4%'],
        ['Certifications Issued', '342', '+18%'],
        ['Drop-out Risk', '4.2%', '-1.5%'],
        ['Learning Velocity', '1.4x', 'Stable'],
      ],
      headStyles: { fillColor: [0, 63, 135] }
    });

    // Save PDF
    doc.save('Academic_Journey_Report.pdf');
    setActiveModal(null);
  };
  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full overflow-y-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Top Banner */}
      <div className="w-full bg-[#003F87] rounded-[16px] flex overflow-hidden relative shadow-md min-h-[248px]">
        {/* Left Content */}
        <div className="p-[32px] flex flex-col justify-center w-[60%] z-10">
          <h2 className="text-[28px] font-bold text-white leading-tight mb-2">Institutional Academic Journey</h2>
          <p className="text-[14px] text-blue-100 mb-[32px] max-w-[420px]">
            Aggregate view of student progression across all active courses. Currently monitoring 3 core institutional stages.
          </p>
          <div className="flex gap-[16px]">
            <button 
              onClick={() => setActiveModal('report')}
              className="bg-white text-[#003F87] px-[16px] py-[10px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText size={16} /> View Detailed Report
            </button>
            <button 
              onClick={() => setActiveModal('curriculum')}
              className="border border-blue-300 text-white px-[16px] py-[10px] rounded-[6px] text-[13px] font-bold hover:bg-blue-800 transition-colors"
            >
              Manage Curriculum
            </button>
          </div>
        </div>
        
        {/* Right Stats Card - inside banner */}
        <div className="w-[40%] p-[24px] flex items-center justify-end z-10">
          <div className="bg-white rounded-[12px] p-[20px] w-[308px] shadow-lg flex flex-col gap-[16px]">
            <p className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider">Avg. Completion Rate</p>
            <div className="flex items-end gap-[12px]">
              <h3 className="text-[42px] font-bold text-[#003F87] leading-none">72%</h3>
              <p className="text-[12px] text-[#555F6B] font-medium pb-1">Institutional Average</p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#F3F4F6] h-[6px] rounded-full">
              <div className="bg-[#003F87] w-[72%] h-full rounded-full"></div>
            </div>
            {/* Split stats */}
            <div className="flex gap-[12px] pt-[8px] border-t border-slate-100">
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[20px] font-bold text-[#003F87] text-center leading-none">1,240</p>
                <p className="text-[10px] text-[#555F6B] text-center leading-tight mt-1">Active<br/>Students</p>
              </div>
              <div className="w-[1px] bg-slate-100"></div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[20px] font-bold text-[#003F87] text-center leading-none">342</p>
                <p className="text-[10px] text-[#555F6B] text-center leading-tight mt-1">Certs<br/>Issued</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements behind stats */}
        <div className="absolute right-[140px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="w-[180px] h-[180px] border-[6px] border-white rounded-full absolute -top-[90px] -right-[90px]"></div>
          <div className="w-[100px] h-[100px] border-[6px] border-white rounded-full absolute top-[70px] -right-[20px] bg-[#003F87]"></div>
          <div className="w-[140px] h-[12px] bg-white absolute top-[120px] right-[70px] rotate-45 rounded-full"></div>
          <div className="w-[40px] h-[40px] border-[6px] border-white rounded-full absolute top-[10px] right-[120px] bg-[#003F87]"></div>
          <div className="w-[100px] h-[6px] bg-white absolute top-[40px] right-[40px] -rotate-45 rounded-full"></div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between border border-[#C2C6D4] bg-white rounded-[8px] p-[16px] shadow-sm">
        <div className="flex items-center gap-[24px]">
          <div className="flex items-center gap-[8px] text-[#555F6B]">
            <Filter size={16} />
            <span className="text-[13px] font-bold">Filters:</span>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#555F6B] uppercase mb-1 tracking-wider">Course</span>
              <select 
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="border border-[#C2C6D4] rounded-[4px] text-[13px] px-[12px] py-[6px] min-w-[140px] text-slate-800 outline-none bg-transparent"
              >
                <option>All Courses</option>
                <option>MERN Stack Development</option>
                <option>Flutter App Development</option>
                <option>Graphic Design</option>
                <option>Digital Marketing</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#555F6B] uppercase mb-1 tracking-wider">Category</span>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-[#C2C6D4] rounded-[4px] text-[13px] px-[12px] py-[6px] min-w-[140px] text-slate-800 outline-none bg-transparent"
              >
                <option>All Categories</option>
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#555F6B] uppercase mb-1 tracking-wider">Batch</span>
              <select 
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="border border-[#C2C6D4] rounded-[4px] text-[13px] px-[12px] py-[6px] min-w-[140px] text-slate-800 outline-none bg-transparent"
              >
                <option>All Batches</option>
                <option>Spring 2023</option>
                <option>Fall 2023</option>
                <option>Spring 2024</option>
              </select>
            </div>
          </div>
        </div>
        <button onClick={handleReset} className="text-[13px] font-bold text-[#003F87] hover:underline px-[16px]">Reset</button>
      </div>

      {/* Main Content Progression Container */}
      <div className="bg-white rounded-[12px] border border-[#C2C6D4] shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Section Header */}
        <div className="p-[24px] flex justify-between items-start border-b border-[#C2C6D4]">
          <div>
            <h3 className="text-[18px] font-bold text-[#003F87] mb-1">Institutional Stage Progression</h3>
            <p className="text-[13px] text-[#555F6B]">Global student distribution and performance metrics across curriculum phases</p>
          </div>
          <div className="flex gap-[12px] items-center relative z-30 mt-2">
            <button 
              onClick={() => setParticipationFilter(prev => prev === 'High' ? 'All' : 'High')}
              className={`flex items-center gap-[10px] px-[20px] py-[10px] rounded-[8px] transition-all border-2 cursor-pointer ${
                participationFilter === 'High' || participationFilter === 'All' 
                  ? 'bg-[#E5F0FF] border-[#003F87] shadow-sm scale-100' 
                  : 'bg-white border-[#C2C6D4] opacity-60 hover:opacity-100 hover:border-[#94A3B8] scale-95'
              }`}
            >
              <div className={`w-[12px] h-[12px] rounded-full transition-colors ${participationFilter === 'High' || participationFilter === 'All' ? 'bg-[#003F87]' : 'bg-[#C2C6D4]'}`}></div>
              <span className={`text-[14px] font-bold transition-colors ${participationFilter === 'High' || participationFilter === 'All' ? 'text-[#003F87]' : 'text-[#555F6B]'}`}>High Participation</span>
            </button>
            <button 
              onClick={() => setParticipationFilter(prev => prev === 'Scaling' ? 'All' : 'Scaling')}
              className={`flex items-center gap-[10px] px-[20px] py-[10px] rounded-[8px] transition-all border-2 cursor-pointer ${
                participationFilter === 'Scaling' || participationFilter === 'All' 
                  ? 'bg-slate-100 border-[#94A3B8] shadow-sm scale-100' 
                  : 'bg-white border-[#C2C6D4] opacity-60 hover:opacity-100 hover:border-[#94A3B8] scale-95'
              }`}
            >
              <div className={`w-[12px] h-[12px] rounded-full transition-colors ${participationFilter === 'Scaling' || participationFilter === 'All' ? 'bg-[#94A3B8]' : 'bg-[#C2C6D4]'}`}></div>
              <span className={`text-[14px] font-bold transition-colors ${participationFilter === 'Scaling' || participationFilter === 'All' ? 'text-slate-700' : 'text-[#555F6B]'}`}>Scaling Phase</span>
            </button>
          </div>
        </div>

        {/* Floating Download Button */}
        <button 
          onClick={handleDownload}
          title="Download Institutional Report PDF"
          className="absolute right-[24px] top-[110px] bg-[#003F87] text-white p-[10px] rounded-[6px] shadow-sm hover:bg-[#002B5E] transition-colors z-20"
        >
          <Download size={18} />
        </button>

        {/* Progression Rows */}
        <div className="p-[32px] flex flex-col gap-[32px] relative before:content-[''] before:absolute before:left-[52px] before:top-[40px] before:bottom-[40px] before:w-[2px] before:bg-slate-200 before:z-0">
          
          {/* Row 1 (High Participation) */}
          {(participationFilter === 'All' || participationFilter === 'High') && (
            <div className="flex items-start gap-[32px] relative z-10">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-[#003F87] flex items-center justify-center shrink-0 shadow-md">
                <Code size={22} className="text-white" />
              </div>
              <div className="flex-1 bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-[20px] shadow-sm">
                <h4 className="text-[15px] font-bold text-[#003F87] mb-[16px]">MERN Stack Development</h4>
                <div className="flex gap-[12px] flex-wrap">
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Alex<br/>Johnson</span>
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 3</span>
                  </div>
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Sarah Chen</span>
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 2</span>
                  </div>
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Mike Ross</span>
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 1</span>
                  </div>
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Emma<br/>Watson</span>
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 4</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Row 2 (Scaling Phase) */}
          {(participationFilter === 'All' || participationFilter === 'Scaling') && (
            <div className="flex items-start gap-[32px] relative z-10">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-slate-400 flex items-center justify-center shrink-0 shadow-md">
                <ChevronLeft size={22} className="text-white" />
              </div>
              <div className="flex-1 bg-white border border-[#C2C6D4] rounded-[8px] p-[20px] shadow-sm">
                <h4 className="text-[15px] font-bold text-slate-700 mb-[16px]">Flutter App Development</h4>
                <div className="flex gap-[12px] flex-wrap">
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">James Miller</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 2</span>
                  </div>
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Lily Evans</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 1</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Row 3 (High Participation) */}
          {(participationFilter === 'All' || participationFilter === 'High') && (
            <div className="flex items-start gap-[32px] relative z-10">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-[#003F87] flex items-center justify-center shrink-0 shadow-md">
                <Palette size={22} className="text-white" />
              </div>
              <div className="flex-1 bg-slate-50 border border-[#C2C6D4] rounded-[8px] p-[20px] shadow-sm">
                <h4 className="text-[15px] font-bold text-[#003F87] mb-[16px]">Graphic Design</h4>
                <div className="flex gap-[12px] flex-wrap">
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">David<br/>Gandy</span>
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 3</span>
                  </div>
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Chloe Price</span>
                    <span className="bg-[#E5F0FF] text-[#003F87] text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 2</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Row 4 (Scaling Phase) */}
          {(participationFilter === 'All' || participationFilter === 'Scaling') && (
            <div className="flex items-start gap-[32px] relative z-10">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-slate-400 flex items-center justify-center shrink-0 shadow-md">
                <MousePointerClick size={22} className="text-white" />
              </div>
              <div className="flex-1 bg-white border border-[#C2C6D4] rounded-[8px] p-[20px] shadow-sm">
                <h4 className="text-[15px] font-bold text-slate-700 mb-[16px]">Digital Marketing</h4>
                <div className="flex gap-[12px] flex-wrap">
                  <div className="bg-white border border-[#C2C6D4] rounded-[6px] px-[12px] py-[8px] flex items-center gap-[12px] min-w-[120px]">
                    <span className="text-[13px] font-bold text-slate-900 leading-tight">Tom Hardy</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-[6px] py-[2px] rounded uppercase ml-auto">Level 1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="w-full bg-transparent flex flex-col gap-[32px] mt-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[24px]">
          
          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <Users size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Active Cohorts</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#003F87] leading-none mb-1">24</h3>
              <p className="text-[11px] text-[#555F6B]">Across 8 departments</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <Award size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Certifications</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#003F87] leading-none mb-1">342</h3>
              <p className="text-[11px] text-[#555F6B]">+18% this quarter</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <TrendingDown size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Drop-out Risk</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#D80000] leading-none mb-1">4.2%</h3>
              <p className="text-[11px] text-[#555F6B]">Decreasing trend</p>
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-[20px] flex flex-col justify-between shadow-sm border border-[#C2C6D4]">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <div className="bg-[#E5F0FF] p-[6px] rounded-[6px]">
                <Gauge size={16} className="text-[#003F87]" />
              </div>
              <span className="text-[13px] font-bold text-slate-900">Learning Velocity</span>
            </div>
            <div>
              <h3 className="text-[28px] font-bold text-[#003F87] leading-none mb-1">1.4x</h3>
              <p className="text-[11px] text-[#555F6B]">Above global average</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Absolute Bottom Footer text */}
      <div className="w-full flex justify-center pb-[16px] pt-[8px]">
        <p className="text-[10px] text-[#555F6B] font-bold uppercase tracking-wider">
          © 2024 Novox Edtech Institutional Management System. Global Institutional Dashboard - V2.4.0
        </p>
      </div>

      {/* Modals */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Detailed Institutional Report</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-sm text-slate-600">
              <p className="mb-4">This report contains a comprehensive breakdown of student progress, graduation rates, and detailed metrics for all active courses.</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <h4 className="font-bold text-slate-800 mb-2">Key Highlights</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Overall completion rate has increased by 4% this quarter.</li>
                  <li>MERN Stack Development shows the highest engagement.</li>
                  <li>Drop-out risk has steadily declined over the last 6 months.</li>
                </ul>
              </div>
              <button onClick={generateReportPDF} className="w-full bg-[#003F87] text-white py-2 rounded-md font-bold hover:bg-[#002B5E]">Download PDF Report</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'curriculum' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Manage Curriculum</h2>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
              
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-slate-600 uppercase mb-1 block">Department</label>
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm font-semibold text-slate-800"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-slate-800 text-sm">Modules for {selectedDept}</h3>
                  <span className="text-xs font-semibold text-[#003F87] bg-[#E5F0FF] px-2 py-1 rounded">{curriculumData[selectedDept]?.length || 0} Modules</span>
                </div>
                
                <div className="p-4 flex flex-col gap-2">
                  {curriculumData[selectedDept]?.length > 0 ? (
                    curriculumData[selectedDept].map((mod, idx) => (
                      <div key={mod.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                          <span className="text-sm font-semibold text-slate-800">{mod.title}</span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{mod.duration}</span>
                        </div>
                        <button onClick={() => handleDeleteModule(mod.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Remove Module">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No modules found for this department. Add one below.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Add New Module</h4>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Module Title (e.g. Node.js Basics)" 
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <input 
                      type="text" 
                      placeholder="Duration" 
                      value={newModuleDuration}
                      onChange={(e) => setNewModuleDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleAddModule}
                    disabled={!newModuleTitle.trim()}
                    className="px-4 py-2 bg-[#003F87] text-white rounded-md text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#002B5E] disabled:opacity-50 transition-colors shrink-0"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AcademicJourneyContent;
