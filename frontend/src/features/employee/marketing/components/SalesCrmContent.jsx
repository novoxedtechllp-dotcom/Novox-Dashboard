import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Plus, Search, Calendar, ChevronRight, X, User } from 'lucide-react';
import LoadingSpinner from '../../../../components/LoadingSpinner';

const SalesCrmContent = () => {
  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  
  const [detailsTab, setDetailsTab] = useState('overview');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');

  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    source_id: 'src-1',
    stage: 'NEW'
  });
  const [loading, setLoading] = useState(true);

  const stages = ['NEW', 'CONTACTED', 'FOLLOWUP', 'COUNSELLING', 'ENROLLED', 'LOST'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) return;
        
        const headers = { 'Authorization': `Bearer ${userInfo.token}` };
        
        const [leadsRes, sourcesRes] = await Promise.all([
          fetch('/api/v1/leads', { headers }),
          fetch('/api/v1/lead-sources', { headers })
        ]);

        if (leadsRes.ok) {
          const lData = await leadsRes.json();
          setLeads(lData.data?.leads || lData.data || []);
        }
        if (sourcesRes.ok) {
          const sData = await sourcesRes.json();
          setSources(sData.data?.sources || sData.data || []);
        }
      } catch (error) {
        console.error('Error fetching sales CRM data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const getSourceName = (id) => {
    const s = sources.find(src => src.id === id);
    return s ? s.source_name : 'Unknown';
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    const createdLead = {
      ...newLead,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setLeads([...leads, createdLead]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', phone: '', email: '', source_id: 'src-1', stage: 'NEW' });
  };

  const handleUpdateStage = (id, newStage) => {
    setLeads(leads.map(l => l.id === id ? { ...l, stage: newStage } : l));
    if (activeLead && activeLead.id === id) {
      setActiveLead(null);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeLead) return;
    const newMsg = {
      id: Date.now(),
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me'
    };
    setMessages({
      ...messages,
      [activeLead.id]: [...(messages[activeLead.id] || []), newMsg]
    });
    setNewMessage('');
  };

  const openLeadDetails = (lead, tab = 'overview') => {
    setActiveLead(lead);
    setDetailsTab(tab);
  };

  if (loading) {
    return <LoadingSpinner text="Loading CRM data..." />;
  }

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[20px] font-bold text-[#003F87]">Sales CRM</h2>
          <p className="text-[13px] text-[#555F6B]">Manage leads and sales pipeline.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors">
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
                <div key={lead.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-[#003F87] transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{lead.name}</h4>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{getSourceName(lead.source_id)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#003F87] w-fit"><Phone size={12} /> {lead.phone}</a>
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#003F87] w-fit"><Mail size={12} /> {lead.email}</a>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <div className="flex gap-2">
                      <a href={`tel:${lead.phone}`} className="w-6 h-6 rounded bg-slate-50 text-[#003F87] flex items-center justify-center hover:bg-slate-100" title="Call"><Phone size={12}/></a>
                      <button onClick={() => openLeadDetails(lead, 'messages')} className="w-6 h-6 rounded bg-slate-50 text-[#003F87] flex items-center justify-center hover:bg-slate-100" title="Message"><MessageSquare size={12}/></button>
                    </div>
                    <button onClick={() => openLeadDetails(lead, 'overview')} className="text-xs font-bold text-[#003F87] flex items-center hover:underline cursor-pointer">Details <ChevronRight size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Add New Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input type="text" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                <input type="text" required value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" required value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source</label>
                <select value={newLead.source_id} onChange={e => setNewLead({...newLead, source_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white">
                  {sources.map(s => <option key={s.id} value={s.id}>{s.source_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stage</label>
                <select value={newLead.stage} onChange={e => setNewLead({...newLead, stage: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white">
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] text-white rounded-md text-sm font-bold hover:bg-[#002B5E]">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {activeLead && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveLead(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Lead Details</h2>
              <button onClick={() => setActiveLead(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="flex px-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <button 
                onClick={() => setDetailsTab('overview')} 
                className={`py-3 mr-6 text-sm font-bold border-b-2 transition-colors ${detailsTab === 'overview' ? 'border-[#003F87] text-[#003F87]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setDetailsTab('messages')} 
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${detailsTab === 'messages' ? 'border-[#003F87] text-[#003F87]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Messages & Notes
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px] max-h-[500px]">
              {detailsTab === 'overview' && (
                <div className="p-6 overflow-y-auto">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#E5F0FF] text-[#003F87] flex items-center justify-center font-bold text-lg shrink-0">
                      {activeLead.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{activeLead.name}</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{getSourceName(activeLead.source_id)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 mb-6">
                    <a href={`tel:${activeLead.phone}`} className="flex items-center gap-3 text-sm font-semibold text-slate-800 hover:text-[#003F87] p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Phone size={16} className="text-[#003F87]" /> {activeLead.phone}
                    </a>
                    <a href={`mailto:${activeLead.email}`} className="flex items-center gap-3 text-sm font-semibold text-slate-800 hover:text-[#003F87] p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <Mail size={16} className="text-[#003F87]" /> {activeLead.email}
                    </a>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Update Stage</label>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage, index) => {
                        const currentIndex = stages.indexOf(activeLead.stage);
                        const isDisabled = stage !== 'LOST' && index < currentIndex;

                        return (
                          <button 
                            key={stage}
                            onClick={() => handleUpdateStage(activeLead.id, stage)}
                            disabled={isDisabled}
                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${activeLead.stage === stage ? 'bg-[#003F87] text-white border-[#003F87]' : isDisabled ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            {stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {detailsTab === 'messages' && (
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {(messages[activeLead.id] || []).length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={32} className="mb-2 opacity-50" />
                        <p className="text-sm font-semibold">No messages yet.</p>
                      </div>
                    ) : (
                      (messages[activeLead.id] || []).map(msg => (
                        <div key={msg.id} className="self-end bg-[#003F87] text-white rounded-xl rounded-tr-sm p-3 max-w-[85%] shadow-sm">
                          <p className="text-sm">{msg.text}</p>
                          <span className="text-[10px] text-white/70 mt-1 block text-right">{msg.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2 shrink-0">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a note..."
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#003F87]"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-[#002B5E]">Send</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCrmContent;
