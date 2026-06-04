import React, { useState, useEffect } from 'react';
import { Users, Search, Calendar, FileText, CheckCircle, Video, Play, Phone } from 'lucide-react';

const RecruitmentContent = () => {
  const [candidates, setCandidates] = useState([]);
  
  useEffect(() => {
    setCandidates([
      { id: 'c-1', full_name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', source_platform: 'INDEED', status: 'APPLIED', resume_url: '/docs/resume1.pdf' },
      { id: 'c-2', full_name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321', source_platform: 'NAUKRI', status: 'SCREENED', resume_url: '/docs/resume2.pdf' },
      { id: 'c-3', full_name: 'Sam Wilson', email: 'sam@example.com', phone: '555-555-5555', source_platform: 'OTHER', status: 'SCHEDULED', resume_url: '/docs/resume3.pdf' }
    ]);
  }, []);

  const stages = ['APPLIED', 'SCREENED', 'SCHEDULED', 'HIRED', 'REJECTED'];

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87]">Recruitment Pipeline</h2>
          <p className="text-[13px] text-[#555F6B]">Manage candidates and schedule interviews.</p>
        </div>
        <button className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
          <Users size={16} /> Add Candidate
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage} className="w-[300px] min-w-[300px] bg-slate-50 border border-slate-200 rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100 rounded-t-xl">
              <h3 className="font-bold text-slate-700 text-sm tracking-wide">{stage.replace('_', ' ')}</h3>
              <span className="bg-white text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                {candidates.filter(c => c.status === stage).length}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              {candidates.filter(c => c.status === stage).map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-[#003F87] transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{c.full_name}</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">{c.source_platform}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {c.phone}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><FileText size={12} /> Resume Uploaded</div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex gap-2">
                    {stage === 'APPLIED' && <button className="flex-1 bg-blue-50 text-[#003F87] text-xs font-bold py-1.5 rounded hover:bg-blue-100">Screen</button>}
                    {stage === 'SCREENED' && <button className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold py-1.5 rounded hover:bg-amber-100">Schedule</button>}
                    {stage === 'SCHEDULED' && <button className="flex-1 bg-green-50 text-green-700 text-xs font-bold py-1.5 rounded hover:bg-green-100">Evaluate</button>}
                  </div>
                </div>
              ))}
              {candidates.filter(c => c.status === stage).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">No candidates</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruitmentContent;
