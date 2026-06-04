import React, { useState, useMemo } from 'react';
import { Paperclip, MessageSquare, Phone, Mail, Zap, CheckCircle, XCircle, MoreHorizontal, Plus, X, Calendar, Clock, User } from 'lucide-react';

const stages = ['NEW', 'CONTACTED', 'FOLLOWUP', 'COUNSELLING', 'ENROLLED', 'LOST'];

const initialSources = [
  { id: 'src_1', source_name: 'Meta Ads' },
  { id: 'src_2', source_name: 'Google Ads' },
  { id: 'src_3', source_name: 'Website' },
  { id: 'src_4', source_name: 'Referral' },
  { id: 'src_5', source_name: 'Indeed' },
  { id: 'src_6', source_name: 'Naukri' }
];

const initialLeads = [
  { id: 'ld_1', name: 'Sarah Jenkins', phone: '+1 555-0100', email: 'sarah@example.com', source_id: 'src_1', interested_course_id: 1, assigned_sales_id: 'sales_1', stage: 'NEW', created_at: '2023-10-25T10:00:00Z' },
  { id: 'ld_2', name: 'David Miller', phone: '+1 555-0200', email: 'david@example.com', source_id: 'src_2', interested_course_id: 2, assigned_sales_id: 'sales_1', stage: 'CONTACTED', created_at: '2023-10-24T14:30:00Z' },
  { id: 'ld_3', name: 'Sophie Martin', phone: '+1 555-0300', email: 'sophie@example.com', source_id: 'src_4', interested_course_id: 1, assigned_sales_id: 'sales_2', stage: 'FOLLOWUP', created_at: '2023-10-23T09:15:00Z' }
];

const initialActivities = [
  { id: 'act_1', lead_id: 'ld_2', activity_type: 'CALL', notes: 'Discussed course duration and pricing.', performed_by: 'sales_1', created_at: '2023-10-24T15:00:00Z' }
];

const initialFollowups = [
  { id: 'fup_1', lead_id: 'ld_3', followup_time: '2023-10-26T10:00:00Z', reminder_sent: false }
];

const SalesCrmContent = ({ courses = [] }) => {
  const [leads, setLeads] = useState(initialLeads);
  const [leadSources] = useState(initialSources);
  const [activities, setActivities] = useState(initialActivities);
  const [followups, setFollowups] = useState(initialFollowups);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', source_id: 'src_1', interested_course_id: courses[0]?.id || ''
  });

  // Activity / Followup Form State for Selected Lead
  const [newActivity, setNewActivity] = useState({ type: 'CALL', notes: '' });
  const [newFollowup, setNewFollowup] = useState({ time: '' });

  const getCourseName = (id) => {
    const c = courses.find(c => c.id === Number(id));
    return c ? c.title : 'Unknown Course';
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name) return;
    const newId = `ld_${Date.now()}`;
    setLeads([...leads, { ...newLead, id: newId, stage: 'NEW', created_at: new Date().toISOString(), assigned_sales_id: 'sales_me' }]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', phone: '', email: '', source_id: 'src_1', interested_course_id: courses[0]?.id || '' });
  };

  const handleUpdateStage = (leadId, newStage) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, stage: newStage });
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.notes) return;
    const act = {
      id: `act_${Date.now()}`,
      lead_id: selectedLead.id,
      activity_type: newActivity.type,
      notes: newActivity.notes,
      performed_by: 'sales_me',
      created_at: new Date().toISOString()
    };
    setActivities([act, ...activities]);
    setNewActivity({ type: 'CALL', notes: '' });
  };

  const handleAddFollowup = (e) => {
    e.preventDefault();
    if (!newFollowup.time) return;
    const fup = {
      id: `fup_${Date.now()}`,
      lead_id: selectedLead.id,
      followup_time: new Date(newFollowup.time).toISOString(),
      reminder_sent: false
    };
    setFollowups([fup, ...followups]);
    setNewFollowup({ time: '' });
  };

  const renderKanbanCard = (lead) => {
    const leadFollowups = followups.filter(f => f.lead_id === lead.id);
    const leadActivities = activities.filter(a => a.lead_id === lead.id);
    const hasFollowup = leadFollowups.length > 0;
    const courseName = getCourseName(lead.interested_course_id);

    return (
      <div 
        key={lead.id} 
        onClick={() => setSelectedLead(lead)}
        className="bg-white rounded-[8px] p-[16px] border border-[#C2C6D4] shadow-sm flex flex-col gap-[12px] cursor-pointer hover:shadow-md hover:border-[#003F87] transition-all shrink-0"
      >
        <div className="flex justify-between items-start">
          <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{lead.name}</h4>
          {lead.stage === 'ENROLLED' && <CheckCircle size={16} className="text-[#008A2E]" />}
          {lead.stage === 'LOST' && <XCircle size={16} className="text-[#D80000]" />}
        </div>
        
        <p className="text-[12px] text-[#555F6B] leading-snug line-clamp-1">{courseName}</p>
        
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2">
            {hasFollowup && (
              <span className="bg-[#FFF4E5] text-[#B26E00] px-[6px] py-[2px] text-[10px] font-bold rounded-[4px] flex items-center gap-1">
                <Calendar size={10} /> Followup set
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[#555F6B] text-[10px] font-semibold">
            {leadActivities.length > 0 && <span className="flex items-center gap-1"><MessageSquare size={12}/> {leadActivities.length}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-[24px] h-full flex flex-col w-full overflow-hidden relative">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-[20px] font-bold text-slate-900">Sales Pipeline</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#003F87] text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors"
        >
          <Plus size={16} /> Add New Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-[24px] h-full overflow-x-auto pb-[24px]" style={{scrollbarWidth: 'thin'}}>
        {stages.map(stage => {
          const colLeads = leads.filter(l => l.stage === stage);
          return (
            <div key={stage} className="flex flex-col min-w-[280px] w-[280px] bg-slate-50/50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-[16px] px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-slate-700 capitalize">{stage.toLowerCase()}</h3>
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-[6px] py-[2px] rounded-full">{colLeads.length}</span>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] flex-1 overflow-y-auto pr-1" style={{scrollbarWidth: 'none'}}>
                {colLeads.map(renderKanbanCard)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Add New Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Phone</label>
                  <input 
                    type="text" required value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                  <input 
                    type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Source</label>
                <select 
                  value={newLead.source_id} onChange={e => setNewLead({...newLead, source_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  {leadSources.map(s => <option key={s.id} value={s.id}>{s.source_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Interested Course</label>
                <select 
                  value={newLead.interested_course_id} onChange={e => setNewLead({...newLead, interested_course_id: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-[#F8FAFC]">
              <div className="flex items-center gap-4">
                <div className="w-[40px] h-[40px] rounded-full bg-[#003F87] text-white flex items-center justify-center font-bold text-lg">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedLead.name}</h2>
                  <p className="text-[12px] text-slate-500">{getCourseName(selectedLead.interested_course_id)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  value={selectedLead.stage}
                  onChange={(e) => handleUpdateStage(selectedLead.id, e.target.value)}
                  className="bg-white border border-slate-300 px-3 py-1.5 rounded-md text-sm font-semibold outline-none focus:border-[#003F87]"
                >
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left Panel - Info */}
              <div className="w-full md:w-[320px] bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Contact Info</h3>
                  <div className="flex flex-col gap-3 text-sm text-slate-700">
                    <div className="flex items-center gap-3"><Phone size={16} className="text-slate-400" /> {selectedLead.phone}</div>
                    <div className="flex items-center gap-3"><Mail size={16} className="text-slate-400" /> {selectedLead.email || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Lead Details</h3>
                  <div className="flex flex-col gap-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Source:</span>
                      <span className="font-semibold">{leadSources.find(s => s.id === selectedLead.source_id)?.source_name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Created:</span>
                      <span className="font-semibold">{new Date(selectedLead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Activities & Followups */}
              <div className="flex-1 p-6 flex flex-col overflow-y-auto gap-8">
                
                {/* Add Actions */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 shrink-0">
                  <form onSubmit={handleAddActivity} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><MessageSquare size={16}/> Log Activity</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {['CALL', 'MESSAGE', 'EMAIL', 'NOTE'].map(t => (
                        <button 
                          key={t} type="button" 
                          onClick={() => setNewActivity({...newActivity, type: t})}
                          className={`px-2 py-1 text-[10px] sm:text-[11px] font-bold rounded flex-1 min-w-[60px] max-w-[80px] truncate ${newActivity.type === t ? 'bg-[#003F87] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      placeholder="Add notes..." required value={newActivity.notes} onChange={e => setNewActivity({...newActivity, notes: e.target.value})}
                      className="w-full text-sm border border-slate-300 rounded p-2 outline-none focus:border-[#003F87] min-h-[60px] mb-2"
                    />
                    <div className="flex justify-end"><button type="submit" className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded hover:bg-slate-700">Save Activity</button></div>
                  </form>
                  
                  <form onSubmit={handleAddFollowup} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16}/> Schedule Follow-up</h3>
                      <input 
                        type="datetime-local" required value={newFollowup.time} onChange={e => setNewFollowup({...newFollowup, time: e.target.value})}
                        className="w-full text-sm border border-slate-300 rounded p-2 outline-none focus:border-[#003F87]"
                      />
                    </div>
                    <div className="flex justify-end mt-4"><button type="submit" className="text-xs font-bold text-[#003F87] bg-[#E5F0FF] px-3 py-1.5 rounded hover:bg-[#cce0ff]">Schedule</button></div>
                  </form>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Activity Timeline</h3>
                  <div className="flex flex-col gap-4 relative pl-4">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                    
                    {followups.filter(f => f.lead_id === selectedLead.id).map(f => (
                      <div key={f.id} className="relative pl-6">
                        <div className="absolute left-[-5px] top-1 w-[12px] h-[12px] rounded-full bg-[#FFF4E5] border-2 border-[#B26E00] z-10"></div>
                        <div className="text-xs font-bold text-[#B26E00] mb-1">Scheduled Follow-up</div>
                        <div className="text-sm text-slate-700">{new Date(f.followup_time).toLocaleString()}</div>
                      </div>
                    ))}
                    
                    {activities.filter(a => a.lead_id === selectedLead.id).map(a => (
                      <div key={a.id} className="relative pl-6">
                        <div className="absolute left-[-5px] top-1 w-[12px] h-[12px] rounded-full bg-slate-100 border-2 border-slate-400 z-10"></div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-bold text-slate-700">{a.activity_type}</span> • 
                          <span>{new Date(a.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 mt-1 break-words whitespace-pre-wrap">{a.notes}</div>
                      </div>
                    ))}
                    
                    {activities.filter(a => a.lead_id === selectedLead.id).length === 0 && followups.filter(f => f.lead_id === selectedLead.id).length === 0 && (
                      <div className="text-sm text-slate-500 italic pl-4">No activities logged yet.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCrmContent;
