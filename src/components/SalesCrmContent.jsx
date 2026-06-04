import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Plus, Search, Calendar, ChevronRight } from 'lucide-react';

const SalesCrmContent = () => {
  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [activities, setActivities] = useState([]);
  
  const stages = ['NEW', 'CONTACTED', 'FOLLOWUP', 'COUNSELLING', 'ENROLLED', 'LOST'];

  useEffect(() => {
    setSources([
      { id: 'src-1', source_name: 'Meta Ads' },
      { id: 'src-2', source_name: 'Website' }
    ]);

    setLeads([
      { id: 'lead-1', name: 'Mark Taylor', phone: '123-456', email: 'mark@mail.com', source_id: 'src-1', stage: 'NEW', created_at: new Date().toISOString() },
      { id: 'lead-2', name: 'Lisa Ray', phone: '987-654', email: 'lisa@mail.com', source_id: 'src-2', stage: 'CONTACTED', created_at: new Date().toISOString() },
      { id: 'lead-3', name: 'Paul Adams', phone: '555-444', email: 'paul@mail.com', source_id: 'src-1', stage: 'FOLLOWUP', created_at: new Date().toISOString() }
    ]);
  }, []);

  const getSourceName = (id) => {
    const s = sources.find(src => src.id === id);
    return s ? s.source_name : 'Unknown';
  };

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87]">Sales CRM</h2>
          <p className="text-[13px] text-[#555F6B]">Manage leads and sales pipeline.</p>
        </div>
        <button className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage} className="w-[300px] min-w-[300px] bg-slate-50 border border-slate-200 rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100 rounded-t-xl">
              <h3 className="font-bold text-slate-700 text-sm tracking-wide">{stage}</h3>
              <span className="bg-white text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                {leads.filter(l => l.stage === stage).length}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              {leads.filter(l => l.stage === stage).map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-[#003F87] transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{getSourceName(lead.source_id)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {lead.phone}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12} /> {lead.email}</div>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="w-6 h-6 rounded bg-slate-50 text-[#003F87] flex items-center justify-center hover:bg-slate-100" title="Log Call"><Phone size={12}/></button>
                      <button className="w-6 h-6 rounded bg-slate-50 text-[#003F87] flex items-center justify-center hover:bg-slate-100" title="Log Note"><MessageSquare size={12}/></button>
                    </div>
                    <button className="text-xs font-bold text-[#003F87] flex items-center hover:underline">Details <ChevronRight size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesCrmContent;
