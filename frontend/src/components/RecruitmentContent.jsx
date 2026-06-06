import React, { useState, useEffect } from 'react';
import { Users, FileText, Phone } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const RecruitmentContent = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const response = await fetch('/api/v1/recruitment', {
          headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        const resData = await response.json();
        if (response.ok) {
          const cArray = resData.data?.candidates || resData.data || [];
          setCandidates(cArray);
        }
      } catch (error) {
        console.error('Error fetching recruitment candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ full_name: '', email: '', phone: '', source_platform: 'INDEED' });

  const stages = ['APPLIED', 'SCREENED', 'SCHEDULED', 'HIRED', 'REJECTED'];

  const advanceStage = (id, newStage) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStage } : c));
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newCandidate.full_name) return;
    const candidate = {
      id: `c-${Date.now()}`,
      ...newCandidate,
      status: 'APPLIED',
      resume_url: '/docs/pending.pdf'
    };
    setCandidates([...candidates, candidate]);
    setIsModalOpen(false);
    setNewCandidate({ full_name: '', email: '', phone: '', source_platform: 'INDEED' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading recruitment data..." />;
  }

  return (
    <>
    <div className="p-[24px] flex flex-col gap-[24px] w-full h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87]">Recruitment Pipeline</h2>
          <p className="text-[13px] text-[#555F6B]">Manage candidates and schedule interviews.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
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
                    {stage === 'APPLIED' && (
                      <>
                        <button onClick={() => advanceStage(c.id, 'SCREENED')} className="flex-1 bg-blue-50 text-[#003F87] text-xs font-bold py-1.5 rounded hover:bg-blue-100">Screen</button>
                        <button onClick={() => advanceStage(c.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-700 text-xs font-bold py-1.5 rounded hover:bg-red-100">Reject</button>
                      </>
                    )}
                    {stage === 'SCREENED' && (
                      <>
                        <button onClick={() => advanceStage(c.id, 'SCHEDULED')} className="flex-1 bg-amber-50 text-amber-700 text-xs font-bold py-1.5 rounded hover:bg-amber-100">Schedule</button>
                        <button onClick={() => advanceStage(c.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-700 text-xs font-bold py-1.5 rounded hover:bg-red-100">Reject</button>
                      </>
                    )}
                    {stage === 'SCHEDULED' && (
                      <>
                        <button onClick={() => advanceStage(c.id, 'HIRED')} className="flex-1 bg-green-50 text-green-700 text-xs font-bold py-1.5 rounded hover:bg-green-100">Hire</button>
                        <button onClick={() => advanceStage(c.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-700 text-xs font-bold py-1.5 rounded hover:bg-red-100">Reject</button>
                      </>
                    )}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Add Candidate</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddCandidate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" required value={newCandidate.full_name} onChange={e => setNewCandidate({...newCandidate, full_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input type="email" value={newCandidate.email} onChange={e => setNewCandidate({...newCandidate, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                  <input type="text" value={newCandidate.phone} onChange={e => setNewCandidate({...newCandidate, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source</label>
                <select value={newCandidate.source_platform} onChange={e => setNewCandidate({...newCandidate, source_platform: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-white text-sm">
                  <option value="INDEED">Indeed</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="NAUKRI">Naukri</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruitmentContent;
