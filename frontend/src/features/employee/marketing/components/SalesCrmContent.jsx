import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, Plus, ChevronRight, TrendingUp, Users, BookOpen, Zap, MoreHorizontal, Paperclip, RefreshCw, CheckSquare } from 'lucide-react';
import LoadingSpinner from '../../../../components/LoadingSpinner';

// ─── Mock / fallback data (replace with real API calls) ───────────────────────
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

// ─── Color avatar helper ───────────────────────────────────────────────────────
const AVATAR_COLORS = ['#003F87','#1565C0','#1976D2','#2196F3','#0288D1','#00796B','#388E3C','#F57C00','#7B1FA2'];
const avatarColor = (initials) => AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];

function Avatar({ initials, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(initials), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Top stats strip ──────────────────────────────────────────────────────────
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
      <span style={{ fontSize: 11, fontWeight: 700, color: '#003F87', width: 20, textAlign: 'right' }}>{value}</span>
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

function InsightsHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Row 1: 3 stat cards */}
      <div style={{ display: 'flex', gap: 12 }}>
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
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#E53935', width: '33%', maxWidth: 70 }} />
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
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EEF7', padding: '14px 20px' }}>
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

// ─── Lead card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, getSourceName, onOpenDetails }) {
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

      {/* Course */}
      {lead.course && (
        <div style={{ fontSize: 11, color: '#555F6B' }}>
          <span style={{ fontWeight: 700, color: '#333', fontSize: 10, textTransform: 'uppercase', letterSpacing: .4 }}>Course: </span>
          {lead.course}
        </div>
      )}

      {/* Note or badge */}
      {lead.note ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' }}>
          <Paperclip size={11} color="#999" /> {lead.note}
        </div>
      ) : lead.hot ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF3E0', color: '#E65100', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', width: 'fit-content' }}>
          <Zap size={10} /> Hot Lead
        </div>
      ) : null}

      {/* Note pill for "Follow-up sent" etc */}
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
        <MoreHorizontal size={15} color="#999" style={{ cursor: 'pointer' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leads.filter(l => l.stage === stage).map(lead => (
          <LeadCard key={lead.id} lead={lead} getSourceName={getSourceName} onOpenDetails={onOpenDetails} />
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 16px 48px rgba(0,63,135,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #EEF2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F9FC' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2B4A' }}>Add New Lead</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,50,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 16px 48px rgba(0,63,135,.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #EEF2F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7F9FC' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2B4A' }}>Lead Details</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#999', cursor: 'pointer' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #EEF2F8', background: '#F7F9FC', padding: '0 24px' }}>
          {['overview', 'messages'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 0', marginRight: 24, fontSize: 13, fontWeight: 700, color: tab === t ? '#003F87' : '#999', borderBottom: `2px solid ${tab === t ? '#003F87' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t ? '#003F87' : 'transparent', cursor: 'pointer', textTransform: 'capitalize' }}>{t === 'messages' ? 'Messages & Notes' : 'Overview'}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 300, maxHeight: 500 }}>
          {tab === 'overview' && (
            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #EEF2F8' }}>
                <Avatar initials={lead.name.charAt(0)} size={48} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2B4A' }}>{lead.name}</div>
                  {lead.course && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{lead.course}</div>}
                </div>
              </div>

              {/* Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ icon: <Phone size={15} />, val: lead.phone, href: `tel:${lead.phone}` }, { icon: <Mail size={15} />, val: lead.email, href: `mailto:${lead.email}` }].map(({ icon, val, href }) => (
                  <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#333', padding: '9px 12px', background: '#F4F7FC', borderRadius: 9, border: '1px solid #E8EEF7', textDecoration: 'none' }}>
                    <span style={{ color: '#003F87' }}>{icon}</span> {val}
                  </a>
                ))}
              </div>

              {/* Stage update */}
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
  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [messages, setMessages] = useState({});

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

  const getSourceName = (id) => (sources.find(s => s.id === id)?.source_name ?? 'Unknown');

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

  if (loading) return <LoadingSpinner text="Loading CRM data..." />;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, width: '100%', height: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', background: '#F0F4FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#003F87' }}>Lead Insights</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#777', marginTop: 2 }}>Manage leads and track your sales pipeline.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
      <InsightsHeader />

      {/* Kanban */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, flex: 1 }}>
        {stages.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={leads}
            getSourceName={getSourceName}
            onOpenDetails={(lead) => setActiveLead(lead)}
          />
        ))}
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
      <DetailsModal lead={activeLead} onClose={() => setActiveLead(null)} onUpdateStage={handleUpdateStage} stages={stages} messages={messages} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default SalesCrmContent;