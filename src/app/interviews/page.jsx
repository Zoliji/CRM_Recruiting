'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // list or calendar
  const [showModal, setShowModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [form, setForm] = useState({ application_id: '', interviewer_id: '', scheduled_at: '', duration_minutes: 60, type: 'video', location: '', notes: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [intRes, appsRes, teamRes] = await Promise.all([
      supabase.from('interviews').select('*, applications(candidates(first_name, last_name), jobs(title)), team_members:interviewer_id(full_name)').order('scheduled_at', { ascending: true }),
      supabase.from('applications').select('id, candidates(first_name, last_name), jobs(title)'),
      supabase.from('team_members').select('id, full_name'),
    ]);
    setInterviews(intRes.data || []);
    setApplications(appsRes.data || []);
    setTeamMembers(teamRes.data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { error } = await supabase.from('interviews').insert(form);
    if (!error) {
      setShowModal(false);
      setForm({ application_id: '', interviewer_id: '', scheduled_at: '', duration_minutes: 60, type: 'video', location: '', notes: '' });
      loadData();
    }
  }

  async function updateStatus(id, status) {
    await supabase.from('interviews').update({ status }).eq('id', id);
    setInterviews((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  }

  const statusBadge = { scheduled: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
  const statusLabel = { scheduled: 'Programmato', completed: 'Completato', cancelled: 'Annullato' };
  const typeEmoji = { video: '📹', phone: '📞', 'in-person': '🏢' };

  // Calendar helpers
  function getCalendarDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const days = [];
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Mon start
    for (let i = startDay - 1; i >= 0; i--) days.push({ day: daysInPrev - i, otherMonth: true });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, otherMonth: false, date: new Date(year, month, i) });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ day: i, otherMonth: true });
    return days;
  }

  const calendarDays = getCalendarDays(currentMonth);
  const today = new Date();
  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  function getInterviewsForDay(date) {
    if (!date) return [];
    return interviews.filter((i) => {
      const d = new Date(i.scheduled_at);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Colloqui</h1>
          <p>{interviews.filter((i) => i.status === 'scheduled').length} colloqui programmati</p>
        </div>
        <div className="page-header-actions">
          <div className="tabs" style={{ marginBottom: 0, border: 'none' }}>
            <button className={`tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>📋 Lista</button>
            <button className={`tab ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>📅 Calendario</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuovo Colloquio</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Caricamento...</p>
      ) : viewMode === 'list' ? (
        <div className="card">
          {interviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>Nessun colloquio programmato</h3>
              <p>Programma il primo colloquio per iniziare.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Programma Colloquio</button>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Candidato</th><th>Posizione</th><th>Data & Ora</th><th>Tipo</th><th>Interviewer</th><th>Stato</th><th></th></tr></thead>
                <tbody>
                  {interviews.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 500 }}>{i.applications?.candidates?.first_name} {i.applications?.candidates?.last_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{i.applications?.jobs?.title || '—'}</td>
                      <td>
                        <div>{new Date(i.scheduled_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                          {new Date(i.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} · {i.duration_minutes} min
                        </div>
                      </td>
                      <td>{typeEmoji[i.type]} {i.type}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{i.team_members?.full_name || '—'}</td>
                      <td><span className={`badge ${statusBadge[i.status]}`}>{statusLabel[i.status]}</span></td>
                      <td>
                        {i.status === 'scheduled' && (
                          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(i.id, 'completed')} title="Completato">✅</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(i.id, 'cancelled')} title="Annulla">❌</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <button className="btn btn-ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>← Mese prec.</button>
            <h3 style={{ fontWeight: 600 }}>
              {currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="btn btn-ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>Mese succ. →</button>
          </div>
          <div className="calendar-grid">
            {weekDays.map((d) => <div key={d} className="calendar-header-cell">{d}</div>)}
            {calendarDays.map((d, i) => {
              const dayInterviews = d.date ? getInterviewsForDay(d.date) : [];
              const isToday = d.date && d.date.toDateString() === today.toDateString();
              return (
                <div key={i} className={`calendar-cell ${d.otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                  <div className="calendar-day-number">{d.day}</div>
                  {dayInterviews.map((int) => (
                    <div key={int.id} className="calendar-event" style={{ background: 'var(--accent-primary-glow)', color: 'var(--accent-primary-hover)' }}>
                      {new Date(int.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} {int.applications?.candidates?.first_name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nuovo Colloquio</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Candidatura *</label>
                  <select className="form-select" required value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })}>
                    <option value="">Seleziona candidatura...</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>{a.candidates?.first_name} {a.candidates?.last_name} — {a.jobs?.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Interviewer</label>
                  <select className="form-select" value={form.interviewer_id} onChange={(e) => setForm({ ...form, interviewer_id: e.target.value })}>
                    <option value="">Seleziona...</option>
                    {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data e Ora *</label>
                    <input className="form-input" type="datetime-local" required value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durata (min)</label>
                    <input className="form-input" type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="video">📹 Video</option>
                      <option value="phone">📞 Telefono</option>
                      <option value="in-person">🏢 Di persona</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location/Link</label>
                    <input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Programma Colloquio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
