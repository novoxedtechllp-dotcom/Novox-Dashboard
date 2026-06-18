import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Plus, ChevronRight, TrendingUp, Users, BookOpen, Zap, MoreHorizontal, Paperclip, CheckSquare, Search, X } from 'lucide-react';

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}

// ─── Mock / fallback data ─────────────────────────────────────────────────────
const MOCK_LEADS = [
  { id: 'l1', name: 'Sarah Jenkins', phone: '+91 98001 11111', email: 'sarah@example.com', source_id: 'src-1', stage: 'NEW', course: 'UI/UX Design Masterclass', note: 'Interested in weekend batch...', assignee: 'AJ', assigneeName: 'Alex J.', created_at: '2h ago', hot: false },
  { id: 'l2', name: 'Michael Chen',  phone: '+91 98001 22222', email: 'michael@example.com', source_id: 'src-2', stage: 'NEW', course: 'Full-Stack Development', note: 'Requested syllabus via email', assignee: 'MS', assigneeName: 'Maria S.', created_at: '5h ago', hot: false },
  { id: 'l3', name: 'David Miller',  phone: '+91 98001 33333', email: 'david@example.com', source_id: 'src-1', stage: 'CONTACTED', course: 'Digital Marketing Pro', note: 'Follow-up sent', assignee: 'AJ', assigneeName: 'Alex J.', created_at: '2d ago', hot: false },
  { id: 'l4', name: 'Aisha Khan',    phone: '+91 98001 44444', email: 'aisha@example.com', source_id: 'src-3', stage: 'CONTACTED', course: 'Corporate Leadership', note: '', assignee: 'AJ', assigneeName: 'Alex J.', created_at: '3d ago', hot: false },
  { id: 'l5', name: 'Robert Wilson', phone: '+91 98001 55555', email: 'robert@example.com', source_id: 'src-2', stage: 'INTERESTED', course: 'Cloud Computing Arch.', note: '', assignee: 'MS', assigneeName: 'Maria S.', created_at: '1w ago', hot: true },
  { id: 'l6', name: 'Sophie Martin', phone: '+91 98001 66666', email: 'sophie@example.com', source_id: 'src-1', stage: 'INTERESTED', course: 'Python for Beginners', note: '', assignee: 'MS', assigneeName: 'Maria S.', created_at: '5d ago', hot: false },
];

const MOCK_SOURCES = [
  { id: 'src-1', source_name: 'Website' },
  { id: 'src-2', source_name: 'Referral' },
  { id: 'src-3', source_name: 'Social' },
];

const getUniqueCourses = (leads) => {
  const courses = leads.map(l => l.course).filter(Boolean);
  return [...new Set(courses)];
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ searchTerm, onSearchChange, selectedCourse, onCourseChange, courses, onReset }) {
  const { isMobile } = useBreakpoint();
  const hasActiveFilter = searchTerm || selectedCourse;

  return (
    <div style={{
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 8 : 12,
      padding: isMobile ? '10px 16px' : '10px 24px',
      background: '#fff',
      borderBottom: '1px solid #E8EEF7',
      flexWrap: 'wrap',
    }}>
      {/* Filters label */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555F6B', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters:
        </div>
      )}

      {/* Search + Course row on mobile */}
      <div style={{ display: 'flex', gap: 8, flexWrap: isMobile ? 'nowrap' : 'wrap', flex: 1, alignItems: 'center' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}>
            <Search size={13} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={isMobile ? 'Search...' : 'Search leads...'}
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
        <div style={{ flexShrink: 0 }}>
          <select
            value={selectedCourse}
            onChange={e => onCourseChange(e.target.value)}
            style={{
              padding: '7px 28px 7px 10px',
              border: '1px solid #D8E0EC',
              borderRadius: 8,
              fontSize: 12,
              color: selectedCourse ? '#333' : '#999',
              background: '#FAFBFD',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              minWidth: isMobile ? 110 : 130,
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
            whiteSpace: 'nowrap',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#003F87','#1565C0','#1976D2','#2196F3','#0288D1','#00796B','#388E3C','#F57C00','#7B1FA2'];
const avatarColor = (initials) => AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];

function Avatar({ initials, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(initials), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Insight cards ────────────────────────────────────────────────────────────
function InsightCard({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EEF7', padding: '16px 18px', flex: 1, minWidth: 0 }}>
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
      <span style={{ fontSize: 24, fontWeight: 800, color: '#003F87', lineHeight: 1 }}>{value}</span>
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
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#003F87', width: 20, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SalespersonChip({ initials, name, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F7FC', borderRadius: 10, padding: '8px 12px', flex: 1, minWidth: 100 }}>
      <Avatar initials={initials} size={28} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2B4A' }}>{name}</div>
        <div style={{ fontSize: 11, color: '#777' }}>{count} leads</div>
      </div>
    </div>
  );
}

function InsightsHeader({ isMobile, isTablet }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Row 1: stat cards — stack on mobile, row on tablet+ */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
        <InsightCard title="New Lead Inflow" icon={<Users size={15} />}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <StatBadge label="Daily" value="12" delta="+15%" />
            <StatBadge label="Weekly" value="84" delta="+8%" />
            <StatBadge label="Monthly" value="312" delta="+12%" />
          </div>
        </InsightCard>

        <InsightCard title="Closed Leads" icon={<CheckSquare size={15} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#003F87', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#003F87' }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#003F87', minWidth: 28 }}>42</span>
              <span style={{ fontSize: 12, color: '#555' }}>Enrolled</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#E53935', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#E53935', maxWidth: 70 }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#E53935', minWidth: 28 }}>14</span>
              <span style={{ fontSize: 12, color: '#555' }}>Lost</span>
            </div>
          </div>
        </InsightCard>

        <InsightCard title="Top Course Interest" icon={<BookOpen size={15} />}>
          <BarRow label="UI/UX" value={32} max={40} />
          <BarRow label="Full-Stk" value={24} max={40} color="#1976D2" />
          <BarRow label="Data Sci" value={18} max={40} color="#0288D1" />
        </InsightCard>
      </div>

      {/* Row 2: Performance by salesperson */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EEF7', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TrendingUp size={15} color="#003F87" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555F6B' }}>Performance by Salesperson</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SalespersonChip initials="AJ" name="Alex" count={42} />
          <SalespersonChip initials="SM" name="Sam" count={38} />
          <SalespersonChip initials="JM" name="Jamie" count={31} />
          <SalespersonChip initials="JD" name="Jordan" count={31} />
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
      onClick={() => onOpenDetails(lead, 'overview')}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,63,135,.10)'; e.currentTarget.style.borderColor = '#A8C0E8'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E8EEF7'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#003F87', flex: 1, marginRight: 8 }}>{lead.name}</span>
        <span style={{ fontSize: 10, color: '#999', flexShrink: 0 }}>{lead.created_at}</span>
      </div>

      {lead.course && (
        <div style={{ fontSize: 11, color: '#555F6B' }}>
          <span style={{ fontWeight: 700, color: '#333', fontSize: 10, textTransform: 'uppercase', letterSpacing: .4 }}>Course: </span>
          {lead.course}
        </div>
      )}

      {lead.note && lead.note !== 'Follow-up sent' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' }}>
          <Paperclip size={11} color="#999" /> {lead.note}
        </div>
      ) : lead.hot ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF3E0', color: '#E65100', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', width: 'fit-content' }}>
          <Zap size={10} /> Hot Lead
        </div>
      ) : null}

      {lead.note === 'Follow-up sent' && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E3F2FD', color: '#1565C0', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', width: 'fit-content' }}>
          {lead.note}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F4FA', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar initials={lead.assignee} size={24} />
          <span style={{ fontSize: 11, color: '#666' }}>{lead.assigneeName}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); onOpenDetails(lead, 'messages'); }}
            style={{ width: 26, height: 26, borderRadius: 6, background: '#F4F7FC', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003F87' }}
            title="Message"
          >
            <MessageSquare size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onOpenDetails(lead, 'overview'); }}
            style={{ width: 26, height: 26, borderRadius: 6, background: '#F4F7FC', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003F87' }}
            title="Details"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile stage selector (pill tabs) ───────────────────────────────────────
function MobileStagePicker({ stages, activeStage, onSelect, leadCounts }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {stages.map(s => {
        const isActive = s === activeStage;
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              border: '1px solid',
              background: isActive ? '#003F87' : '#fff',
              color: isActive ? '#fff' : '#555F6B',
              borderColor: isActive ? '#003F87' : '#D8E0EC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {s}
            <span style={{
              background: isActive ? 'rgba(255,255,255,.25)' : '#EEF2F8',
              color: isActive ? '#fff' : '#555',
              borderRadius: 10,
              padding: '0 5px',
              fontSize: 10,
              fontWeight: 700,
            }}>
              {leadCounts[s] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ stage, leads, onOpenDetails }) {
  const count = leads.filter(l => l.stage === stage).length;
  return (
    <div style={{ minWidth: 240, width: 260, display: 'flex', flexDirection: 'column', background: '#F7F9FC', borderRadius: 14, border: '1px solid #E8EEF7', flexShrink: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8EEF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EEF2F8', borderRadius: '14px 14px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1A2B4A' }}>{stage}</span>
          <span style={{ background: '#fff', color: '#555', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '1px 7px', border: '1px solid #D8E0EC' }}>{count}</span>
        </div>
        <MoreHorizontal size={15} color="#999" style={{ cursor: 'pointer' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 600 }}>
        {leads.filter(l => l.stage === stage).map(lead => (
          <LeadCard key={lead.id} lead={lead} onOpenDetails={onOpenDetails} />
        ))}
        {count === 0 && (
          <div style={{ textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 20 }}>No leads</div>
        )}
      </div>
    </div>
  );
}

// ─── Add Lead Modal ───────────────────────────────────────────────────────────
function AddLeadModal({ isOpen, onClose, onSave, sources, stages }) {
  const { isMobile } = useBreakpoint();
  const [form, setForm] = useState({ name: '', phone: '', email: '', source_id: sources[0]?.id || 'src-1', stage: stages[0], course: '', note: '', assignee: 'AJ', assigneeName: 'Alex J.' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: `lead-${Date.now()}`, created_at: 'Just now', hot: false });
    setForm({ name: '', phone: '', email: '', source_id: sources[0]?.id || 'src-1', stage: stages[0], course: '', note: '', assignee: 'AJ', assigneeName: 'Alex J.' });
  };

  const fieldStyle = { width: '100%', padding: '8px 12px', border: '1px solid #D8E0EC', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#555F6B', textTransform: 'uppercase', letterSpacing: .4, display: 'block', marginBottom: 4 };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,.45)', zIndex: 100, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : 16, width: '100%', maxWidth: isMobile ? '100%' : 440, boxShadow: '0 16px 48px rgba(0,63,135,.18)', overflow: 'hidden', maxHeight: isMobile ? '90vh' : 'none', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle on mobile */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D8E0EC' }} />
          </div>
        )}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EEF2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F9FC' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2B4A' }}>Add New Lead</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Name', 'name', 'text', 'John Doe'], ['Phone', 'phone', 'text', '+91 98765 43210'], ['Email', 'email', 'email', 'john@example.com'], ['Course', 'course', 'text', 'UI/UX Design Masterclass']].map(([label, key, type, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} required={key !== 'course'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={fieldStyle} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
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
            <div>
              <label style={labelStyle}>Note</label>
              <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Optional note..." style={fieldStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #D8E0EC', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 700, color: '#555', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ flex: isMobile ? 1 : 'none', padding: '8px 18px', background: '#003F87', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Lead</button>
            </div>
          </form>
        </div>
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
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,.45)', zIndex: 100, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : 16, width: '100%', maxWidth: isMobile ? '100%' : 440, boxShadow: '0 16px 48px rgba(0,63,135,.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: isMobile ? '88vh' : 'auto', maxHeight: isMobile ? '88vh' : '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D8E0EC' }} />
          </div>
        )}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #EEF2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F9FC', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2B4A' }}>Lead Details</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #EEF2F8', background: '#F7F9FC', padding: '0 24px', flexShrink: 0 }}>
          {['overview', 'messages'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 0', marginRight: 24, fontSize: 13, fontWeight: 700, color: tab === t ? '#003F87' : '#999', borderBottom: `2px solid ${tab === t ? '#003F87' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t ? '#003F87' : 'transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
              {t === 'messages' ? 'Messages & Notes' : 'Overview'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {tab === 'overview' && (
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #EEF2F8' }}>
                <Avatar initials={lead.name.charAt(0)} size={48} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2B4A' }}>{lead.name}</div>
                  {lead.course && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{lead.course}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ icon: <Phone size={15} />, val: lead.phone, href: `tel:${lead.phone}` }, { icon: <Mail size={15} />, val: lead.email, href: `mailto:${lead.email}` }].map(({ icon, val, href }) => (
                  <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#333', padding: '9px 12px', background: '#F4F7FC', borderRadius: 9, border: '1px solid #E8EEF7', textDecoration: 'none' }}>
                    <span style={{ color: '#003F87' }}>{icon}</span> {val}
                  </a>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#777', textTransform: 'uppercase', letterSpacing: .4, marginBottom: 10 }}>Update Stage</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {stages.map((s, i) => {
                    const isActive = s === lead.stage;
                    const isDisabled = s !== 'LOST' && i < currentIndex;
                    return (
                      <button
                        key={s}
                        onClick={() => { if (!isDisabled) onUpdateStage(lead.id, s); }}
                        disabled={isDisabled}
                        style={{
                          padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                          cursor: isDisabled ? 'not-allowed' : 'pointer', border: '1px solid',
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F7F9FC', overflow: 'hidden', minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(messages[lead.id] || []).length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bbb', paddingTop: 40 }}>
                    <MessageSquare size={32} style={{ opacity: .4, marginBottom: 8 }} />
                    <span style={{ fontSize: 13 }}>No messages yet.</span>
                  </div>
                ) : (
                  (messages[lead.id] || []).map(m => (
                    <div key={m.id} style={{ alignSelf: 'flex-end', background: '#003F87', color: '#fff', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', maxWidth: '85%' }}>
                      <p style={{ margin: 0, fontSize: 13 }}>{m.text}</p>
                      <span style={{ fontSize: 10, opacity: .7, marginTop: 4, display: 'block', textAlign: 'right' }}>{m.time}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid #E8EEF7', background: '#fff', display: 'flex', gap: 8, flexShrink: 0 }}>
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const stages = ['NEW', 'CONTACTED', 'INTERESTED', 'COUNSELLING', 'ENROLLED', 'LOST'];

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

  // Lead counts per stage (for mobile pill tabs)
  const leadCounts = stages.reduce((acc, s) => {
    acc[s] = filteredLeads.filter(l => l.stage === s).length;
    return acc;
  }, {});

  const handleReset = () => { setSearchTerm(''); setSelectedCourse(''); };

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
        Loading CRM data…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: '#F0F4FA' }}>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        courses={uniqueCourses}
        onReset={handleReset}
      />

      <div style={{ padding: `${padding}px ${padding}px`, display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20, flex: 1 }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#003F87' }}>Lead Insights</span>
            {!isMobile && <p style={{ margin: 0, fontSize: 13, color: '#777', marginTop: 2 }}>Manage leads and track your sales pipeline.</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {!isMobile && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555', background: '#fff', border: '1px solid #D8E0EC', borderRadius: 8, padding: '6px 12px' }}>
                  📅 Oct 1 – Oct 31, 2023
                </div>
                <span style={{ fontSize: 11, color: '#27AE60', background: '#E8F5E9', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>Last updated: Just now</span>
              </>
            )}
            <button
              onClick={() => setIsAddOpen(true)}
              style={{ background: '#003F87', color: '#fff', border: 'none', borderRadius: 9, padding: isMobile ? '8px 14px' : '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
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
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
            {selectedCourse && (
              <span style={{ background: '#E8EEF7', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {selectedCourse}
                <button onClick={() => setSelectedCourse('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        {/* ── Kanban: horizontal scroll on tablet/desktop, single-column on mobile ── */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stage pill selector */}
            <MobileStagePicker
              stages={stages}
              activeStage={mobileStage}
              onSelect={setMobileStage}
              leadCounts={leadCounts}
            />
            {/* Single stage column */}
            <div style={{ background: '#F7F9FC', borderRadius: 14, border: '1px solid #E8EEF7' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8EEF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EEF2F8', borderRadius: '14px 14px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1A2B4A' }}>{mobileStage}</span>
                  <span style={{ background: '#fff', color: '#555', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '1px 7px', border: '1px solid #D8E0EC' }}>{leadCounts[mobileStage]}</span>
                </div>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredLeads.filter(l => l.stage === mobileStage).map(lead => (
                  <LeadCard key={lead.id} lead={lead} onOpenDetails={handleOpenDetails} />
                ))}
                {leadCounts[mobileStage] === 0 && (
                  <div style={{ textAlign: 'center', color: '#bbb', fontSize: 12, padding: '24px 0' }}>No leads in this stage</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {stages.map(stage => (
              <KanbanColumn
                key={stage}
                stage={stage}
                leads={filteredLeads}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB — hidden on desktop since header has "Add Lead" button */}
      {isMobile && (
        <button
          onClick={() => setIsAddOpen(true)}
          style={{ position: 'fixed', bottom: 24, right: 20, width: 52, height: 52, borderRadius: '50%', background: '#003F87', color: '#fff', border: 'none', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,63,135,.35)', zIndex: 50 }}
          title="Add Lead"
        >
          <Plus size={22} />
        </button>
      )}

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