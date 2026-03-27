'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function JobDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { loadJob(); }, [id]);

  async function loadJob() {
    const { data } = await supabase.from('jobs').select('*, team_members:assigned_to(full_name)').eq('id', id).single();
    if (data) { setJob(data); setForm(data); }
    const { data: apps } = await supabase
      .from('applications')
      .select('*, candidates(first_name, last_name, email), pipeline_stages(name, color)')
      .eq('job_id', id);
    setApplications(apps || []);
    setLoading(false);
  }

  async function handleSave() {
    await supabase.from('jobs').update({
      title: form.title, department: form.department, location: form.location,
      type: form.type, status: form.status, description: form.description,
      salary_range: form.salary_range, updated_at: new Date().toISOString(),
    }).eq('id', id);
    setJob({ ...job, ...form });
    setEditing(false);
  }

  const statusColors = { open: 'badge-success', paused: 'badge-warning', closed: 'badge-danger' };
  const statusLabels = { open: 'Aperta', paused: 'In Pausa', closed: 'Chiusa' };

  if (loading) return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>Caricamento...</p></AppLayout>;
  if (!job) return <AppLayout><div className="empty-state"><h3>Posizione non trovata</h3></div></AppLayout>;

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <button className="btn btn-ghost" onClick={() => router.push('/jobs')}>← Indietro</button>
          <div>
            <h1>{job.title}</h1>
            <p>{job.department || ''} {job.location ? `· ${job.location}` : ''}</p>
          </div>
          <span className={`badge ${statusColors[job.status]}`}>{statusLabels[job.status]}</span>
        </div>
        <div className="page-header-actions">
          {editing ? (
            <>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(job); }}>Annulla</button>
              <button className="btn btn-primary" onClick={handleSave}>Salva</button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Modifica</button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="detail-section">
              <div className="detail-section-title">Dettagli Posizione</div>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="form-group"><label className="form-label">Titolo</label><input className="form-input" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Dipartimento</label><input className="form-input" value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Sede</label><input className="form-input" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Tipo</label>
                      <select className="form-select" value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Stato</label>
                      <select className="form-select" value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="open">Aperta</option><option value="paused">In Pausa</option><option value="closed">Chiusa</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Range Salariale</label><input className="form-input" value={form.salary_range || ''} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Descrizione</label><textarea className="form-textarea" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                </div>
              ) : (
                <>
                  <div className="detail-row"><span className="detail-row-label">Tipo</span><span className="detail-row-value"><span className="badge badge-info">{job.type}</span></span></div>
                  <div className="detail-row"><span className="detail-row-label">Sede</span><span className="detail-row-value">{job.location || '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">Stipendio</span><span className="detail-row-value">{job.salary_range || '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">Assegnato a</span><span className="detail-row-value">{job.team_members?.full_name || '—'}</span></div>
                  {job.description && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <div className="detail-section-title">Descrizione</div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.description}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="detail-section-title">Candidature ({applications.length})</div>
            {applications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Nessun candidato per questa posizione.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {applications.map((app) => (
                  <div key={app.id} className="glass glass-hover" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)' }}>
                      {app.candidates?.first_name?.[0]}{app.candidates?.last_name?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{app.candidates?.first_name} {app.candidates?.last_name}</div>
                    </div>
                    {app.pipeline_stages && <span className="badge" style={{ background: `${app.pipeline_stages.color}20`, color: app.pipeline_stages.color }}>{app.pipeline_stages.name}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
