import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Plus, ChevronRight, TrendingUp, Users, BookOpen, Zap, MoreHorizontal, Paperclip, CheckSquare, Search, X, RefreshCcw } from 'lucide-react';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import CustomSelect from '../../../../components/CustomSelect';

// ─── Unique course list derived from leads ─────────────────────────────────────
const getUniqueCourses = (leads) => {
  const courses = leads.map(l => l.course).filter(Boolean);
  return [...new Set(courses)];
};


// ─── Color avatar helper ───────────────────────────────────────────────────────
const AVATAR_COLORS = ['#003F87','#1565C0','#1976D2','#2196F3','#0288D1','#00796B','#388E3C','#F57C00','#7B1FA2'];
const avatarColor = (initials) => AVATAR_COLORS[(initials || 'A').charCodeAt(0) % AVATAR_COLORS.length];

function Avatar({ initials, size = 32 }) {
  return (
    <div 
      className="rounded-full text-white flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, background: avatarColor(initials), fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// ─── Top stats strip ──────────────────────────────────────────────────────────
function InsightCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EEF7] p-4 flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#003F87]">{icon}</span>
        <span className="text-[13px] font-bold text-slate-600">{title}</span>
      </div>
      {children}
    </div>
  );
}

function StatBadge({ label, value, delta }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[26px] font-extrabold text-[#003F87] leading-none">{value}</span>
      <span className="text-[11px] text-slate-500 mt-0.5">{label}</span>
      {delta && <span className="text-[10px] text-green-600 font-bold mt-0.5">{delta}</span>}
    </div>
  );
}

function BarRow({ label, value, max, color = '#003F87' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[11px] font-bold text-slate-600 w-[52px] shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold text-[#003F87] w-5 text-right">{value}</span>
    </div>
  );
}

function SalespersonChip({ initials, name, count }) {
  return (
    <div className="flex items-center gap-2 bg-blue-50/50 rounded-xl px-3.5 py-2 flex-1 min-w-[120px]">
      <Avatar initials={initials} size={30} />
      <div>
        <div className="text-[13px] font-bold text-slate-800">{name}</div>
        <div className="text-[11px] text-slate-500">{count} leads</div>
      </div>
    </div>
  );
}

function InsightsHeader() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <InsightCard title="New Lead Inflow" icon={<Users size={15} />}>
          <div className="flex justify-around">
            <StatBadge label="Daily" value="0" />
            <StatBadge label="Weekly" value="0" />
            <StatBadge label="Monthly" value="0" />
          </div>
        </InsightCard>

        <InsightCard title="Closed Leads" icon={<CheckSquare size={15} />}>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#003F87] shrink-0" />
              <div className="flex-1 h-2 rounded-full bg-[#003F87] w-0" />
              <span className="text-[18px] font-extrabold text-[#003F87] min-w-[28px]">0</span>
              <span className="text-xs text-slate-500">Enrolled</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
              <div className="flex-1 h-2 rounded-full bg-red-500 w-0" />
              <span className="text-[18px] font-extrabold text-red-500 min-w-[28px]">0</span>
              <span className="text-xs text-slate-500">Lost</span>
            </div>
          </div>
        </InsightCard>

        <InsightCard title="Top Course Interest" icon={<BookOpen size={15} />}>
          <BarRow label="UI/UX" value={0} max={40} />
          <BarRow label="Full-Stk" value={0} max={40} color="#1976D2" />
          <BarRow label="Data Sci" value={0} max={40} color="#0288D1" />
        </InsightCard>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EEF7] px-5 py-3.5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-[#003F87]" />
          <span className="text-[13px] font-bold text-slate-600">Performance by Salesperson</span>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <div className="text-xs text-slate-400 italic">No lead data available to show salesperson performance.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Lead card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, getSourceName, onOpenDetails }) {
  return (
    <div
      onClick={() => onOpenDetails(lead, 'overview')}
      className="bg-white rounded-[12px] border border-slate-200 p-3.5 flex flex-col gap-2.5 cursor-pointer hover:shadow-md hover:border-[#A8C0E8] transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex justify-between items-start">
        <span className="text-[13px] font-bold text-[#003F87]">{lead.name}</span>
        <span className="text-[10px] text-slate-400">{lead.created_at || 'New'}</span>
      </div>

      {/* Course */}
      {lead.course && (
        <div className="text-[11px] text-slate-600">
          <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wide">Course: </span>
          {lead.course}
        </div>
      )}

      {/* Note or badge */}
      {lead.note ? (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Paperclip size={11} className="text-slate-400" /> {lead.note}
        </div>
      ) : lead.hot ? (
        <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md px-2 py-0.5 w-fit">
          <Zap size={10} /> Hot Lead
        </div>
      ) : null}

      {lead.note === 'Follow-up sent' && (
        <div className="inline-flex items-center gap-1 bg-blue-50 text-[#1565C0] text-[10px] font-bold rounded-md px-2 py-0.5 w-fit -mt-1">
          {lead.note}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-slate-50 pt-2 mt-1">
        <div className="flex items-center gap-1.5">
          <Avatar initials={lead.assignee || lead.name.charAt(0)} size={24} />
          <span className="text-[11px] text-slate-500">{lead.assigneeName || 'Unassigned'}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); onOpenDetails(lead, 'messages'); }}
            className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-[#003F87] hover:bg-slate-100 transition-colors"
            title="Message"
          >
            <MessageSquare size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onOpenDetails(lead, 'overview'); }}
            className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-[#003F87] hover:bg-slate-100 transition-colors"
            title="Details"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban column ────────────────────────────────────────────────────────────
function KanbanColumn({ stage, leads, getSourceName, onOpenDetails }) {
  const stageLeads = leads.filter(l => l.stage === stage);
  const count = stageLeads.length;
  
  return (
    <div className="min-w-[260px] w-[260px] flex flex-col bg-slate-50/50 rounded-[14px] border border-[#E8EEF7] h-[600px]">
      <div className="px-4 py-3 border-b border-[#E8EEF7] flex justify-between items-center bg-slate-100/50 rounded-t-[14px]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-extrabold text-slate-700">{stage}</span>
          <span className="bg-white text-slate-600 text-[10px] font-bold rounded-md px-1.5 py-0.5 border border-slate-200">{count}</span>
        </div>
        <MoreHorizontal size={15} className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {stageLeads.map(lead => (
          <LeadCard key={lead.id} lead={lead} getSourceName={getSourceName} onOpenDetails={onOpenDetails} />
        ))}
        {count === 0 && (
          <div className="text-center text-slate-400 text-xs mt-5">No leads</div>
        )}
      </div>
    </div>
  );
}

// ─── Add Lead Modal ───────────────────────────────────────────────────────────
function AddLeadModal({ isOpen, onClose, onSave, sources, stages }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', source_id: sources[0]?.id || 'src-1', stage: stages[0], course: '', note: '', assignee: 'AJ', assigneeName: 'Alex J.' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: `lead-${Date.now()}`, created_at: 'Just now', hot: false });
    setForm({ name: '', phone: '', email: '', source_id: sources[0]?.id || 'src-1', stage: stages[0], course: '', note: '', assignee: 'AJ', assigneeName: 'Alex J.' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-[440px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-base font-extrabold text-slate-800">Add New Lead</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5">
          {[['Name', 'name', 'text', 'John Doe'], ['Phone', 'phone', 'text', '+91 98765 43210'], ['Email', 'email', 'email', 'john@example.com'], ['Course', 'course', 'text', 'UI/UX Design Masterclass']].map(([label, key, type, ph]) => (
            <div key={key}>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
              <input type={type} required={key !== 'course'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#003F87] transition-colors" />
            </div>
          ))}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Source</label>
              <select value={form.source_id} onChange={e => setForm({ ...form, source_id: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#003F87] transition-colors">
                {sources.map(s => <option key={s.id} value={s.id}>{s.source_name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#003F87] transition-colors">
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Note</label>
            <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Optional note..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#003F87] transition-colors" />
          </div>
          <div className="flex gap-2.5 justify-end mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#003F87] text-white rounded-lg text-[13px] font-bold hover:bg-blue-900 transition-colors">Save Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────
function DetailsModal({ lead, onClose, onUpdateStage, stages, messages, onSendMessage }) {
  const [tab, setTab] = useState('overview');
  const [msg, setMsg] = useState('');

  if (!lead) return null;

  const currentIndex = stages.indexOf(lead.stage);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSendMessage(lead.id, msg);
    setMsg('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[16px] w-full max-w-[440px] shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-base font-extrabold text-slate-800">Lead Details</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-2">
          {['overview', 'messages'].map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`py-3 mr-6 text-[13px] font-bold border-b-2 capitalize transition-colors ${tab === t ? 'text-[#003F87] border-[#003F87]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              {t === 'messages' ? 'Messages & Notes' : 'Overview'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-[300px] max-h-[500px]">
          {tab === 'overview' && (
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              {/* Profile */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <Avatar initials={(lead.name || 'A').charAt(0)} size={48} />
                <div>
                  <div className="text-[17px] font-extrabold text-slate-800">{lead.name}</div>
                  {lead.course && <div className="text-xs text-slate-500 mt-0.5">{lead.course}</div>}
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-2">
                {[{ icon: <Phone size={15} />, val: lead.phone, href: `tel:${lead.phone}` }, { icon: <Mail size={15} />, val: lead.email, href: `mailto:${lead.email}` }].map(({ icon, val, href }) => (
                  <a key={href} href={href} className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700 p-2.5 bg-slate-50/50 rounded-[9px] border border-slate-100 hover:bg-slate-50 transition-colors decoration-transparent">
                    <span className="text-[#003F87]">{icon}</span> {val}
                  </a>
                ))}
              </div>

              {/* Stage update */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">Update Stage</div>
                <div className="flex flex-wrap gap-2">
                  {stages.map((s, i) => {
                    const isActive = s === lead.stage;
                    const isDisabled = s !== 'LOST' && i < currentIndex;
                    return (
                      <button
                        key={s}
                        onClick={() => { if (!isDisabled) onUpdateStage(lead.id, s); }}
                        disabled={isDisabled}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${isActive ? 'bg-[#003F87] text-white border-[#003F87]' : isDisabled ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 cursor-pointer'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                {(messages[lead.id] || []).length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 pt-10">
                    <MessageSquare size={32} className="opacity-40 mb-2" />
                    <span className="text-[13px]">No messages yet.</span>
                  </div>
                ) : (
                  (messages[lead.id] || []).map(m => (
                    <div key={m.id} className="self-end bg-[#003F87] text-white rounded-[12px] rounded-br-[2px] p-2.5 max-w-[85%]">
                      <p className="m-0 text-[13px]">{m.text}</p>
                      <span className="text-[10px] opacity-70 mt-1 block text-right">{m.time}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a note..." className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#003F87] transition-colors" />
                <button type="submit" disabled={!msg.trim()} className={`bg-[#003F87] text-white border-none rounded-lg px-4 py-2 text-[13px] font-bold transition-opacity ${!msg.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-900 cursor-pointer'}`}>Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesCrmContent = ({ courses = [], searchQuery = '' }) => {
  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [messages, setMessages] = useState({});

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState('');

  const stages = ['NEW', 'CONTACTED', 'INTERESTED', 'COUNSELLING', 'ENROLLED', 'LOST'];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
      const headers = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};

      const [leadsRes, sourcesRes] = await Promise.all([
        fetch('/api/v1/leads', { headers }).catch(() => null),
        fetch('/api/v1/lead-sources', { headers }).catch(() => null),
      ]);

      const lData = leadsRes?.ok ? await leadsRes.json() : null;
      const sData = sourcesRes?.ok ? await sourcesRes.json() : null;

      setLeads(lData?.data?.leads || lData?.data || []);
      setSources(sData?.data?.sources || sData?.data || []);
    } catch {
      setLeads([]);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getSourceName = (id) => (sources.find(s => s.id === id)?.source_name ?? 'Unknown');

  // ── Filtered leads ─────────────────────────────────────────────────────────
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery ||
      (lead.name && lead.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery)) ||
      (lead.course && lead.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.note && lead.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = !selectedCourse || lead.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  const handleAddLead = (lead) => {
    setLeads(prev => [...prev, lead]);
    setIsAddOpen(false);
  };

  const handleUpdateStage = (id, newStage) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
    setActiveLead(prev => prev?.id === id ? { ...prev, stage: newStage } : prev);
  };

  const handleSendMessage = (leadId, text) => {
    const msg = { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sender: 'me' };
    setMessages(prev => ({ ...prev, [leadId]: [...(prev[leadId] || []), msg] }));
  };

  const uniqueCourses = getUniqueCourses(leads);

  if (loading) return <LoadingSpinner text="Loading CRM data..." />;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 w-full relative bg-[#FAFBFC] min-h-full">
      
      {/* Top Header / Actions Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:border-blue-300 transition-colors">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-3 shrink-0">Course</span>
            <CustomSelect
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={[
                { value: '', label: 'All Courses' },
                ...uniqueCourses.map(c => ({ value: c, label: c }))
              ]}
              className="w-full sm:w-[200px]"
              selectClassName="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer relative"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button onClick={fetchLeads} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <RefreshCcw size={16} />
          </button>
          <button onClick={() => setIsAddOpen(true)} className="px-5 py-2.5 bg-[#003F87] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#002B5E] shadow-blue-900/10 active:scale-95 transition-all flex items-center gap-2">
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Insights */}
      <InsightsHeader />

      {/* Active filter indicator */}
      {(searchQuery || selectedCourse) && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing <strong className="text-[#003F87]">{filteredLeads.length}</strong> of {leads.length} leads</span>
          {searchQuery && (
            <span className="bg-slate-100 rounded-md px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 text-slate-700">
              Search: "{searchQuery}"
            </span>
          )}
          {selectedCourse && (
            <span className="bg-slate-100 rounded-md px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 text-slate-700">
              Course: {selectedCourse}
              <button onClick={() => setSelectedCourse('')} className="bg-transparent border-none cursor-pointer text-slate-400 p-0 flex items-center hover:text-slate-600"><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {stages.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={filteredLeads}
            getSourceName={getSourceName}
            onOpenDetails={(lead) => setActiveLead(lead)}
          />
        ))}
      </div>

      {/* Modals */}
      <AddLeadModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddLead} sources={sources} stages={stages} />
      <DetailsModal lead={activeLead} onClose={() => setActiveLead(null)} onUpdateStage={handleUpdateStage} stages={stages} messages={messages} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default SalesCrmContent;