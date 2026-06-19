import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Plus, ChevronRight, TrendingUp, Users, BookOpen, Zap, MoreHorizontal, Paperclip, RefreshCw, CheckSquare, Search, X } from 'lucide-react';
import LoadingSpinner from '../../../../components/LoadingSpinner';

// ─── Responsive breakpoint hook ────────────────────────────────────────────────
function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
  };
}

// ─── Mock / fallback data (replace with real API calls) ───────────────────────
const MOCK_LEADS = [
  { id: 'l1', name: 'Sarah Jenkins', phone: '+91 98001 11111', email: 'sarah@example.com', source_id: 'src-3', stage: 'NEW', course: 'UI/UX Design Masterclass', note: 'Interested in weekend batch...', assignee: 'AJ', assigneeName: 'Alex J.', foundBy: 'AJ', foundByName: 'Alex J.', owner: '', created_at: '2h ago', hot: false },
  { id: 'l2', name: 'Michael Chen',  phone: '+91 98001 22222', email: 'michael@example.com', source_id: 'src-1', stage: 'NEW', course: 'Full-Stack Development', note: 'Requested syllabus via email', assignee: 'MS', assigneeName: 'Maria S.', foundBy: 'MS', foundByName: 'Maria S.', owner: '', created_at: '5h ago', hot: false },
  { id: 'l3', name: 'David Miller',  phone: '+91 98001 33333', email: 'david@example.com', source_id: 'src-3', stage: 'CONTACTED', course: 'Digital Marketing Pro', note: 'Follow-up sent', assignee: 'AJ', assigneeName: 'Alex J.', foundBy: 'RK', foundByName: 'Raj K.', owner: '', created_at: '2d ago', hot: false },
  { id: 'l4', name: 'Aisha Khan',    phone: '+91 98001 44444', email: 'aisha@example.com', source_id: 'src-2', stage: 'CONTACTED', course: 'Corporate Leadership', note: '', assignee: 'AJ', assigneeName: 'Alex J.', foundBy: 'PN', foundByName: 'Priya N.', owner: '', created_at: '3d ago', hot: false },
  { id: 'l5', name: 'Robert Wilson', phone: '+91 98001 55555', email: 'robert@example.com', source_id: 'src-1', stage: 'INTERESTED', course: 'Cloud Computing Arch.', note: '', assignee: 'MS', assigneeName: 'Maria S.', foundBy: 'MS', foundByName: 'Maria S.', owner: '', created_at: '1w ago', hot: true },
  { id: 'l6', name: 'Sophie Martin', phone: '+91 98001 66666', email: 'sophie@example.com', source_id: 'src-4', stage: 'INTERESTED', course: 'Python for Beginners', note: '', assignee: 'MS', assigneeName: 'Maria S.', foundBy: 'AJ', foundByName: 'Alex J.', owner: '', created_at: '5d ago', hot: false },
];

const MOCK_SOURCES = [
  { id: 'src-1', source_name: 'WhatsApp' },
  { id: 'src-2', source_name: 'Instagram' },
  { id: 'src-3', source_name: 'Website' },
  { id: 'src-4', source_name: 'Referral' },
];

// Team members available to be selected as "Sales Lead"
const TEAM_MEMBERS = [
  { id: 'AJ', name: 'Alex J.' },
  { id: 'MS', name: 'Maria S.' },
  { id: 'RK', name: 'Raj K.' },
  { id: 'PN', name: 'Priya N.' },
];

const getUniqueCourses = (leads) => {
  const courses = leads.map(l => l.course).filter(Boolean);
  return [...new Set(courses)];
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ searchTerm, onSearchChange, selectedCourse, onCourseChange, courses, onReset }) {
  const hasActiveFilter = searchTerm || selectedCourse;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 24px',
      background: '#fff',
      borderBottom: '1px solid #E8EEF7',
      flexWrap: 'wrap',
    }}>
      {/* Filters label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555F6B', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters:
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}>
          <Search size={13} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search institutional data..."
          style={{
            width: '100%',
            padding: '7px 30px 7px 30px',
            border: '1px solid #D8E0EC',
            borderRadius: 8,
            fontSize: 12,
            color: '#333',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            background: '#FAFBFD',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Course Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#003F87', textTransform: 'uppercase', letterSpacing: 0.5 }}>COURSE</span>
        <select
          value={selectedCourse}
          onChange={e => onCourseChange(e.target.value)}
          style={{
            padding: '7px 28px 7px 10px',
            border: '1px solid #D8E0EC',
            borderRadius: 8,
            fontSize: 12,
            color: '#333',
            background: '#FAFBFD',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            minWidth: 130,
          }}
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 13,
          fontWeight: 700,
          color: hasActiveFilter ? '#003F87' : '#AAB4C2',
          cursor: hasActiveFilter ? 'pointer' : 'default',
          padding: '6px 4px',
          flexShrink: 0,
          transition: 'color .15s',
        }}
      >
        Reset
      </button>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
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

// ─── Insight cards ────────────────────────────────────────────────────────────
function InsightCard({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EEF7', padding: '18px 20px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: '#003F87' }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#555F6B' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function StatBadge({ label, value, delta }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 26, fontWeight: 800, color: '#003F87', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{label}</span>
      {delta && <span style={{ fontSize: 10, color: '#27AE60', fontWeight: 700, marginTop: 1 }}>{delta}</span>}
    </div>
  );
}

function BarRow({ label, value, max, color = '#003F87' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#555', width: 52, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#EEF2F8', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <span className="text-[11px] font-bold text-[#003F87] w-5 text-right">{value}</span>
    </div>
  );
}

function SalespersonChip({ initials, name, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F7FC', borderRadius: 10, padding: '8px 14px', flex: 1, minWidth: 120 }}>
      <Avatar initials={initials} size={30} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2B4A' }}>{name}</div>
        <div style={{ fontSize: 11, color: '#777' }}>{count} leads</div>
      </div>
    </div>
  );
}

function InsightsHeader({ isMobile, isTablet }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Row 1: 3 stat cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E53935', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#E53935', width: '33%', maxWidth: 70 }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#E53935', minWidth: 28 }}>14</span>
              <span style={{ fontSize: 12, color: '#555' }}>Lost</span>
            </div>
          </div>
        </InsightCard>

        <InsightCard title="Top Course Interest" icon={<BookOpen size={15} />}>
          <BarRow label="UI/UX" value={0} max={40} />
          <BarRow label="Full-Stk" value={0} max={40} color="#1976D2" />
          <BarRow label="Data Sci" value={0} max={40} color="#0288D1" />
        </InsightCard>
      </div>

      {/* Row 2: Performance by salesperson */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EEF7', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TrendingUp size={15} color="#003F87" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555F6B' }}>Performance by Salesperson</span>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <div className="text-xs text-slate-400 italic">No lead data available to show salesperson performance.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onOpenDetails }) {
  return (
    <div
      style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EEF7', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'box-shadow .15s, border-color .15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,63,135,.10)'; e.currentTarget.style.borderColor = '#A8C0E8'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E8EEF7'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#003F87' }}>{lead.name}</span>
        <span style={{ fontSize: 10, color: '#999' }}>{lead.created_at}</span>
      </div>

      {lead.course && (
        <div className="text-[11px] text-slate-600">
          <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wide">Course: </span>
          {lead.course}
        </div>
      )}

      {/* Note or badge */}
      {lead.note ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' }}>
          <Paperclip size={11} color="#999" /> {lead.note}
        </div>
      ) : lead.hot ? (
        <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md px-2 py-0.5 w-fit">
          <Zap size={10} /> Hot Lead
        </div>
      ) : null}

      {lead.note === 'Follow-up sent' && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E3F2FD', color: '#1565C0', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', width: 'fit-content', marginTop: -4 }}>
          {lead.note}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F4FA', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar initials={lead.assignee} size={24} />
          <span style={{ fontSize: 11, color: '#666' }}>{lead.assigneeName}</span>
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
  const count = leads.filter(l => l.stage === stage).length;
  return (
    <div style={{ minWidth: 260, width: 260, display: 'flex', flexDirection: 'column', background: '#F7F9FC', borderRadius: 14, border: '1px solid #E8EEF7', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8EEF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EEF2F8', borderRadius: '14px 14px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#1A2B4A' }}>{stage}</span>
          <span style={{ background: '#fff', color: '#555', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '1px 7px', border: '1px solid #D8E0EC' }}>{count}</span>
        </div>
        <MoreHorizontal size={15} className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leads.filter(l => l.stage === stage).map(lead => (
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
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 };
const fieldStyle = { width: '100%', padding: '9px 12px', border: '1px solid #D8E0EC', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

function AddLeadModal({ isOpen, onClose, onSave, sources, stages }) {
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source_id: sources[0]?.id || 'src-1',
    stage: stages[0],
    course: '',
    note: '',
    foundBy: TEAM_MEMBERS[0].id,
    owner: '',
    assignee: 'AJ',
    assigneeName: 'Alex J.',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundByMember = TEAM_MEMBERS.find(m => m.id === form.foundBy) || TEAM_MEMBERS[0];
    onSave({
      ...form,
      foundByName: foundByMember.name,
      id: `lead-${Date.now()}`,
      created_at: 'Just now',
      hot: false,
    });
    setForm({
      name: '',
      phone: '',
      email: '',
      source_id: sources[0]?.id || 'src-1',
      stage: stages[0],
      course: '',
      note: '',
      foundBy: TEAM_MEMBERS[0].id,
      owner: '',
      assignee: 'AJ',
      assigneeName: 'Alex J.',
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: isMobile ? '100%' : 440, boxShadow: '0 16px 48px rgba(0,63,135,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F9FC' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2B4A' }}>Add New Lead</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '75vh', overflowY: 'auto' }}>
          {[['Name', 'name', 'text', 'John Doe'], ['Phone', 'phone', 'text', '+91 98765 43210'], ['Email', 'email', 'email', 'john@example.com'], ['Course', 'course', 'text', 'UI/UX Design Masterclass']].map(([label, key, type, ph]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type={type} required={key !== 'course'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={fieldStyle} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Source</label>
              <select value={form.source_id} onChange={e => setForm({ ...form, source_id: e.target.value })} style={{ ...fieldStyle, background: '#fff' }}>
                {sources.map(s => <option key={s.id} value={s.id}>{s.source_name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} style={{ ...fieldStyle, background: '#fff' }}>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Sales Lead</label>
              <select value={form.foundBy} onChange={e => setForm({ ...form, foundBy: e.target.value })} style={{ ...fieldStyle, background: '#fff' }}>
                {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Owner</label>
              <input type="text" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="Owner name" style={fieldStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Note</label>
            <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Optional note..." style={fieldStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #D8E0EC', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 700, color: '#555', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 18px', background: '#003F87', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────
function DetailsModal({ lead, initialTab = 'overview', onClose, onUpdateStage, stages, messages, onSendMessage }) {
  const { isMobile } = useBreakpoint();
  const [tab, setTab] = useState(initialTab);
  const [msg, setMsg] = useState('');

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  if (!lead) return null;

  const currentIndex = stages.indexOf(lead.stage);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSendMessage(lead.id, msg);
    setMsg('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: isMobile ? '100%' : 440, boxShadow: '0 16px 48px rgba(0,63,135,.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EEF2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F9FC' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2B4A' }}>Lead Details</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #EEF2F8', background: '#F7F9FC', padding: '0 24px' }}>
          {['overview', 'messages'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 0', marginRight: 24, fontSize: 13, fontWeight: 700, color: tab === t ? '#003F87' : '#999', background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t ? '#003F87' : 'transparent', cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'messages' ? 'Messages & Notes' : 'Overview'}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 300, maxHeight: 500 }}>
          {tab === 'overview' && (
            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #EEF2F8' }}>
                <Avatar initials={lead.name.charAt(0)} size={48} />
                <div>
                  <div className="text-[17px] font-extrabold text-slate-800">{lead.name}</div>
                  {lead.course && <div className="text-xs text-slate-500 mt-0.5">{lead.course}</div>}
                </div>
              </div>

              {/* Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ icon: <Phone size={15} />, val: lead.phone, href: `tel:${lead.phone}` }, { icon: <Mail size={15} />, val: lead.email, href: `mailto:${lead.email}` }].map(({ icon, val, href }) => (
                  <a key={href} href={href} className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700 p-2.5 bg-slate-50/50 rounded-[9px] border border-slate-100 hover:bg-slate-50 transition-colors decoration-transparent">
                    <span className="text-[#003F87]">{icon}</span> {val}
                  </a>
                ))}
              </div>

              {/* Sales Lead / Owner */}
              {(lead.foundByName || lead.owner) && (
                <div className="flex flex-col gap-1.5 -mt-1.5">
                  {lead.foundByName && (
                    <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">Sales Lead:</span>
                      <span>{lead.foundByName}</span>
                    </div>
                  )}
                  {lead.owner && (
                    <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">Owner:</span>
                      <span>{lead.owner}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">Update Stage</div>
                <div className="flex flex-wrap gap-2">
                  {stages.map((s, i) => {
                    const isActive = s === lead.stage;
                    const isException = s === 'NEGATIVE' || s === 'NOT CONTACTED';
                    const isDisabled = !isException && i < currentIndex;
                    return (
                      <button
                        key={s}
                        onClick={() => { if (!isDisabled) onUpdateStage(lead.id, s); }}
                        disabled={isDisabled}
                        style={{
                          padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: isDisabled ? 'not-allowed' : 'pointer', border: '1px solid',
                          background: isActive ? '#003F87' : isDisabled ? '#F4F7FC' : '#fff',
                          color: isActive ? '#fff' : isDisabled ? '#bbb' : '#555',
                          borderColor: isActive ? '#003F87' : '#D8E0EC',
                          opacity: isDisabled ? .6 : 1,
                        }}
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F7F9FC', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid #E8EEF7', background: '#fff', display: 'flex', gap: 8 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a note..." style={{ flex: 1, border: '1px solid #D8E0EC', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                <button type="submit" disabled={!msg.trim()} style={{ background: '#003F87', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: msg.trim() ? 'pointer' : 'not-allowed', opacity: msg.trim() ? 1 : .5 }}>Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesCrmContent = () => {
  const { isMobile, isTablet } = useBreakpoint();

  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState({});
  const [mobileStage, setMobileStage] = useState('NEW');

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const stages = ['NEW', 'CONTACTED', 'INTERESTED', 'ADMISSION', 'NEGATIVE', 'NOT CONTACTED'];

  useEffect(() => {
    const load = async () => {
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

        setLeads(lData?.data?.leads || lData?.data || MOCK_LEADS);
        setSources(sData?.data?.sources || sData?.data || MOCK_SOURCES);
      } catch {
        setLeads(MOCK_LEADS);
        setSources(MOCK_SOURCES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getSourceName = (sourceId) => sources.find(s => s.id === sourceId)?.source_name || 'Unknown';

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.course && lead.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.note && lead.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCourse = !selectedCourse || lead.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCourse('');
  };

  const handleAddLead = (lead) => { setLeads(prev => [...prev, lead]); setIsAddOpen(false); };

  const handleUpdateStage = (id, newStage) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
    setActiveLead(prev => prev?.id === id ? { ...prev, stage: newStage } : prev);
  };

  const handleSendMessage = (leadId, text) => {
    const msg = { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sender: 'me' };
    setMessages(prev => ({ ...prev, [leadId]: [...(prev[leadId] || []), msg] }));
  };

  const handleOpenDetails = (lead, tab) => {
    setActiveLead(lead);
    setActiveTab(tab);
  };

  const uniqueCourses = getUniqueCourses(leads);
  const padding = isMobile ? 12 : 24;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: '#003F87', fontSize: 14, fontWeight: 600 }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: '#F0F4FA', minHeight: '100vh' }}>

      {/* ── Filter Bar (full-width, outside padding) ── */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        courses={uniqueCourses}
        onReset={handleReset}
      />

      {/* ── Main content area ── */}
      <div style={{ padding, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#003F87' }}>Lead Insights</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#777', marginTop: 2 }}>Manage leads and track your sales pipeline.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', background: '#fff', border: '1px solid #D8E0EC', borderRadius: 8, padding: '6px 12px' }}>
              📅 Oct 1 – Oct 31, 2023
            </div>
            <span style={{ fontSize: 11, color: '#27AE60', background: '#E8F5E9', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>Last updated: Just now</span>
            <button onClick={() => setIsAddOpen(true)} style={{ background: '#003F87', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Add Lead
            </button>
          </div>
        </div>

        {/* Insights */}
        <InsightsHeader isMobile={isMobile} isTablet={isTablet} />

        {/* Active filter indicator */}
        {(searchTerm || selectedCourse) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555F6B', flexWrap: 'wrap' }}>
            <span>Showing <strong style={{ color: '#003F87' }}>{filteredLeads.length}</strong> of {leads.length} leads</span>
            {searchTerm && (
              <span style={{ background: '#E8EEF7', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
            {selectedCourse && (
              <span style={{ background: '#E8EEF7', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Course: {selectedCourse}
                <button onClick={() => setSelectedCourse('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        {/* Kanban */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, flex: 1 }}>
          {stages.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={filteredLeads}
              getSourceName={getSourceName}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsAddOpen(true)}
        style={{ position: 'fixed', bottom: 28, right: 28, width: 52, height: 52, borderRadius: '50%', background: '#003F87', color: '#fff', border: 'none', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,63,135,.35)', zIndex: 50 }}
        title="Add Lead"
      >
        <Plus size={22} />
      </button>

      <AddLeadModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddLead} sources={sources} stages={stages} />
      <DetailsModal
        lead={activeLead}
        initialTab={activeTab}
        onClose={() => setActiveLead(null)}
        onUpdateStage={handleUpdateStage}
        stages={stages}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default SalesCrmContent;