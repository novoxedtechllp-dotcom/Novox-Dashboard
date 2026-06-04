import React, { useState, useMemo } from 'react';
import { ChevronRight, Star, GitMerge, Users, Code, Layers, MoreHorizontal, Filter, Share2, X } from 'lucide-react';

const baseStudents = [
  { name: 'Sarah Jenkins', course: 'Advanced UI/UX Design', avatar: 'sarah', baseScore: 3125, trend: '↗ +150 this week', trendColor: 'text-[#008A2E]' },
  { name: 'Ethan Wright', course: 'Full Stack Development', avatar: 'ethan', baseScore: 2840, trend: '↗ +120 this week', trendColor: 'text-[#008A2E]' },
  { name: 'Aarav Patel', course: 'Cloud Architecture', avatar: 'aarav', baseScore: 2610, trend: '— No change', trendColor: 'text-[#555F6B]' },
  { name: 'Maya Rodriguez', course: 'Digital Marketing Professional', avatar: 'maya', baseScore: 2450, trend: '↗ +142 this week', trendColor: 'text-[#008A2E]' },
  { name: 'Lucas Bennett', course: 'Data Science Immersion', avatar: 'lucas', baseScore: 2280, trend: '— No change', trendColor: 'text-[#555F6B]' },
  { name: 'Elena Kozlova', course: 'Cyber Security Specialist', avatar: 'elena', baseScore: 2115, trend: '↘ -1 rank', trendColor: 'text-[#D80000]' },
  { name: 'David Kim', course: 'Frontend Engineering', avatar: 'david', baseScore: 2050, trend: '↗ +50 this week', trendColor: 'text-[#008A2E]' },
  { name: 'Sophie Chen', course: 'Backend Systems', avatar: 'sophie', baseScore: 1980, trend: '— No change', trendColor: 'text-[#555F6B]' },
  { name: 'James Wilson', course: 'AI & Machine Learning', avatar: 'james', baseScore: 1850, trend: '↘ -2 rank', trendColor: 'text-[#D80000]' },
  { name: 'Olivia Davis', course: 'Mobile App Development', avatar: 'olivia', baseScore: 1720, trend: '↗ +80 this week', trendColor: 'text-[#008A2E]' },
  { name: 'Liam Martinez', course: 'DevOps Engineering', avatar: 'liam', baseScore: 1650, trend: '— No change', trendColor: 'text-[#555F6B]' },
  { name: 'Isabella Taylor', course: 'Database Administration', avatar: 'isabella', baseScore: 1580, trend: '↗ +30 this week', trendColor: 'text-[#008A2E]' },
  { name: 'Noah Thomas', course: 'Blockchain Development', avatar: 'noah', baseScore: 1510, trend: '— No change', trendColor: 'text-[#555F6B]' },
  { name: 'Mia White', course: 'Game Design', avatar: 'mia', baseScore: 1450, trend: '↘ -1 rank', trendColor: 'text-[#D80000]' },
  { name: 'William Lee', course: 'Software Testing', avatar: 'william', baseScore: 1390, trend: '↗ +20 this week', trendColor: 'text-[#008A2E]' }
];

const mockData = baseStudents.map((s, i) => {
  const multipliers = { 'GitHub': 0.8, 'LinkedIn': 0.6, 'Behance': 0.5, 'LeetCode': 0.9, 'Other': 0.3 };
  const timeMultipliers = { 'All Time': 1, 'Monthly': 0.15, 'Weekly': 0.04 };
  
  const scores = {};
  ['All Time', 'Monthly', 'Weekly'].forEach(time => {
    scores[time] = {};
    ['Internal', 'GitHub', 'LinkedIn', 'Behance', 'LeetCode', 'Other'].forEach(plat => {
      const platMult = plat === 'Internal' ? 1 : multipliers[plat];
      const timeMult = timeMultipliers[time];
      const randomJitter = (i * 7 + plat.length * 11 + time.length * 13) % 20 - 10;
      scores[time][plat] = Math.max(0, Math.floor(s.baseScore * platMult * timeMult) + randomJitter);
    });
  });
  
  return {
    id: i + 1,
    ...s,
    avatar: `https://i.pravatar.cc/150?u=${s.avatar}`,
    coursesCompleted: 18 - Math.floor(i / 2),
    scores
  };
});

const platforms = [
  { id: 'Internal', label: 'Internal', sub: 'Coursework', Icon: Star, color: '#003F87' },
  { id: 'GitHub', label: 'GitHub', sub: 'Code Contrib.', Icon: GitMerge, color: '#555F6B' },
  { id: 'LinkedIn', label: 'LinkedIn', sub: 'Professional', Icon: Users, color: '#0A66C2' },
  { id: 'Behance', label: 'Behance', sub: 'Design Portfolio', Icon: Layers, color: '#1769FF' },
  { id: 'LeetCode', label: 'LeetCode', sub: 'Algorithms', Icon: Code, color: '#FFA116' },
  { id: 'Other', label: 'Other', sub: 'External API', Icon: MoreHorizontal, color: '#555F6B' },
];

const LeaderboardContent = () => {
  const [timeframe, setTimeframe] = useState('All Time');
  const [platform, setPlatform] = useState('Internal');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const sortedData = useMemo(() => {
    return [...mockData].sort((a, b) => b.scores[timeframe][platform] - a.scores[timeframe][platform]);
  }, [timeframe, platform]);

  const podium = sortedData.slice(0, 3);
  const list = sortedData.slice(3, visibleCount);

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full overflow-y-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87] leading-tight mb-1">Student Achievement Leaderboard</h2>
          <p className="text-[13px] text-[#555F6B]">Recognizing excellence across internal courses and professional platforms.</p>
        </div>
        <div className="flex flex-col items-end gap-[12px]">
          <div className="flex bg-[#F8FAFC] rounded-[8px] p-[4px] border border-[#C2C6D4]">
            {['All Time', 'Monthly', 'Weekly'].map(tf => (
              <button 
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-[12px] py-[4px] text-[12px] font-bold rounded-[4px] transition-colors ${timeframe === tf ? 'text-[#003F87] bg-white shadow-sm' : 'text-[#555F6B] hover:text-slate-900'}`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-[6px] text-[12px] font-bold text-[#555F6B] border border-[#C2C6D4] px-[12px] py-[6px] rounded-[6px] hover:bg-slate-50 transition-colors"
          >
            <Filter size={14} /> Advanced Filters
          </button>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-[12px] overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
        {platforms.map(plat => {
          const isActive = platform === plat.id;
          return (
            <div 
              key={plat.id}
              onClick={() => setPlatform(plat.id)}
              className={`flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] bg-white cursor-pointer min-w-[180px] shrink-0 transition-opacity border-[2px] ${isActive ? 'border-[#003F87] opacity-100' : 'border-transparent ring-1 ring-[#C2C6D4] opacity-60 hover:opacity-100'}`}
            >
              <plat.Icon size={20} className={isActive ? 'text-[#003F87]' : plat.color} style={{ fill: (isActive && plat.id === 'Internal') ? '#003F87' : 'none' }} />
              <div className="leading-tight">
                <p className={`text-[13px] font-bold ${isActive ? 'text-[#003F87]' : 'text-slate-800'}`}>{plat.label}</p>
                <p className="text-[11px] text-[#555F6B]">{plat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Podium Area */}
      <div className="flex justify-center items-end mt-[24px] gap-[24px]">
        {/* Rank 2 */}
        {podium[1] && (
          <div className="flex flex-col items-center bg-white rounded-[16px] p-[24px] border border-[#C2C6D4] shadow-sm w-[280px]">
            <div className="relative mb-[16px]">
              <img src={podium[1].avatar} alt={podium[1].name} className="w-[80px] h-[80px] rounded-[16px] object-cover border-4 border-white shadow-md" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[28px] h-[28px] bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[14px] border-2 border-white">2</div>
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 text-center">{podium[1].name}</h3>
            <p className="text-[12px] text-[#555F6B] text-center mb-[24px]">{podium[1].course}</p>
            <div className="bg-[#F8FAFC] w-full py-[16px] rounded-[8px] text-center">
              <p className="text-[28px] font-bold text-[#003F87] leading-none">{podium[1].scores[timeframe][platform].toLocaleString()}</p>
              <p className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider mt-1">Points</p>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {podium[0] && (
          <div className="flex flex-col items-center bg-white rounded-[16px] p-[24px] border-[2px] border-[#003F87] shadow-lg w-[320px] relative z-10 -mt-[40px]">
            <div className="absolute -top-[16px]">
              <Star size={32} className="text-[#FFB800] fill-[#FFB800]" />
            </div>
            <div className="relative mb-[16px] mt-[12px]">
              <img src={podium[0].avatar} alt={podium[0].name} className="w-[100px] h-[100px] rounded-[20px] object-cover border-4 border-[#003F87] shadow-md" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[32px] h-[32px] bg-[#003F87] text-white rounded-full flex items-center justify-center font-bold text-[16px] border-2 border-white">1</div>
            </div>
            <h3 className="text-[22px] font-bold text-[#003F87] text-center">{podium[0].name}</h3>
            <p className="text-[13px] text-[#555F6B] text-center mb-[24px]">{podium[0].course}</p>
            <div className="bg-[#003F87] w-full py-[20px] rounded-[12px] text-center">
              <p className="text-[36px] font-bold text-white leading-none">{podium[0].scores[timeframe][platform].toLocaleString()}</p>
              <p className="text-[10px] font-bold text-[#93C5FD] uppercase tracking-widest mt-2">Elite Achievement Score</p>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {podium[2] && (
          <div className="flex flex-col items-center bg-white rounded-[16px] p-[24px] border border-[#C2C6D4] shadow-sm w-[280px]">
            <div className="relative mb-[16px]">
              <img src={podium[2].avatar} alt={podium[2].name} className="w-[80px] h-[80px] rounded-[16px] object-cover border-4 border-white shadow-md" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[28px] h-[28px] bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-[14px] border-2 border-white">3</div>
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 text-center">{podium[2].name}</h3>
            <p className="text-[12px] text-[#555F6B] text-center mb-[24px]">{podium[2].course}</p>
            <div className="bg-[#F8FAFC] w-full py-[16px] rounded-[8px] text-center">
              <p className="text-[28px] font-bold text-[#003F87] leading-none">{podium[2].scores[timeframe][platform].toLocaleString()}</p>
              <p className="text-[10px] font-bold text-[#555F6B] uppercase tracking-wider mt-1">Points</p>
            </div>
          </div>
        )}
      </div>

      {/* List View */}
      <div className="flex flex-col border border-[#C2C6D4] rounded-[12px] bg-white shadow-sm mt-[8px] relative">
        {list.map((student, idx) => {
          const rank = idx + 4;
          return (
            <div 
              key={student.id} 
              onClick={() => setSelectedStudent(student)}
              className={`flex items-center justify-between p-[20px] border-b border-[#C2C6D4] hover:bg-slate-50 transition-colors cursor-pointer ${idx === list.length - 1 ? 'rounded-b-[12px] border-b-0' : ''}`}
            >
              <div className="flex items-center gap-[24px]">
                <span className="text-[18px] font-bold text-slate-900 w-[24px] text-center">{rank}</span>
                <img src={student.avatar} alt={student.name} className="w-[48px] h-[48px] rounded-[8px] object-cover" />
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">{student.name}</h4>
                  <p className="text-[12px] text-[#555F6B]">{student.course}</p>
                </div>
              </div>
              <div className="flex items-center gap-[24px]">
                <div className="flex items-center gap-[12px] border-r border-[#C2C6D4] pr-[24px]">
                  <div className="flex gap-2 opacity-60 items-center">
                    <Star size={16} /> <GitMerge size={16} /> <Users size={16} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800">{student.coursesCompleted} Courses Completed</span>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-[18px] font-bold text-[#003F87] leading-none">{student.scores[timeframe][platform].toLocaleString()}</p>
                  <p className={`text-[11px] font-bold mt-1 ${student.trendColor}`}>{student.trend}</p>
                </div>
                <ChevronRight size={20} className="text-[#C2C6D4]" />
              </div>
            </div>
          );
        })}
        
        {/* Floating Share Button on the right edge */}
        <button 
          onClick={() => alert('Leaderboard link copied to clipboard!')}
          className="fixed right-[40px] bottom-[40px] bg-[#003F87] text-white p-[16px] rounded-full shadow-xl hover:bg-[#002B5E] transition-all hover:scale-105 z-40"
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* Footer Load More */}
      {visibleCount < sortedData.length && (
        <div className="w-full flex flex-col items-center mt-[24px] pb-[12px]">
          <button 
            onClick={() => setVisibleCount(v => Math.min(v + 6, sortedData.length))}
            className="border border-[#C2C6D4] text-[#003F87] bg-white hover:bg-slate-50 transition-colors px-[24px] py-[8px] rounded-[6px] text-[13px] font-bold mb-[12px] shadow-sm"
          >
            Load More Students
          </button>
          <p className="text-[11px] text-[#555F6B]">Showing {visibleCount} of {sortedData.length} enrolled students</p>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Advanced Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cohort</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white">
                  <option>All Cohorts</option>
                  <option>Spring 2023</option>
                  <option>Fall 2023</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white">
                  <option>Global</option>
                  <option>North America</option>
                  <option>Europe</option>
                  <option>Asia</option>
                </select>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Student Profile</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center gap-2">
              <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-[80px] h-[80px] rounded-[16px] object-cover shadow-sm mb-2" />
              <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
              <p className="text-sm text-[#555F6B] mb-4">{selectedStudent.course}</p>
              
              <div className="w-full bg-slate-50 rounded-lg p-4 border border-slate-200 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Courses Completed</p>
                  <p className="text-sm font-semibold">{selectedStudent.coursesCompleted}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Current Score</p>
                  <p className="text-sm font-semibold text-[#003F87]">{selectedStudent.scores[timeframe][platform].toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Trend</p>
                  <p className={`text-sm font-semibold ${selectedStudent.trendColor}`}>{selectedStudent.trend}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaderboardContent;
