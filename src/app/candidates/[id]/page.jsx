'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function CandidateDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { loadCandidate(); }, [id]);

  async function loadCandidate() {
    const { data } = await supabase.from('candidates').select('*').eq('id', id).single();
    if (data) {
      setCandidate(data);
      setForm(data);
    }
    // Load applications for this candidate
    const { data: apps } = await supabase
      .from('applications')
      .select('*, jobs(title, department), pipeline_stages(name, color)')
      .eq('candidate_id', id);
    setApplications(apps || []);
    setLoading(false);
  }

  async function handleSave() {
    const { error } = await supabase.from('candidates').update({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      linkedin_url: form.linkedin_url,
      current_company: form.current_company,
      current_job_role: form.current_job_role,
      source: form.source,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (!error) {
      setCandidate(form);
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Eliminare questo candidato?')) return;
    await supabase.from('candidates').delete().eq('id', id);
    router.push('/candidates');
  }

  if (loading) {
    return <AppLayout><p style={{ color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>Caricamento...</p></AppLayout>;
  }

  if (!candidate) {
    return <AppLayout><div className="empty-state"><h3>Candidato non trovato</h3><button className="btn btn-primary" onClick={() => router.push('/candidates')}>Torna ai candidati</button></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <button className="btn btn-ghost" onClick={() => router.push('/candidates')}>← Indietro</button>
          <div>
            <h1>{candidate.first_name} {candidate.last_name}</h1>
            <p>{candidate.current_job_role || 'N/A'} {candidate.current_company ? `@ ${candidate.current_company}` : ''}</p>
          </div>
        </div>
        <div className="page-header-actions">
          {editing ? (
            <>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(candidate); }}>Annulla</button>
              <button className="btn btn-primary" onClick={handleSave}>Salva</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Modifica</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Elimina</button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          {/* Info */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="detail-section">
              <div className="detail-section-title">Informazioni Personali</div>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nome</label>
                      <input className="form-input" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cognome</label>
                      <input className="form-input" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Telefono</label>
                      <input className="form-input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input className="form-input" value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Ruolo</label>
                      <input className="form-input" value={form.current_job_role || ''} onChange={(e) => setForm({ ...form, current_job_role: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Azienda</label>
                      <input className="form-input" value={form.current_company || ''} onChange={(e) => setForm({ ...form, current_company: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fonte</label>
                    <select className="form-select" value={form.source || ''} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                      <option value="">Seleziona...</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="referral">Referral</option>
                      <option value="website">Sito Web</option>
                      <option value="indeed">Indeed</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note</label>
                    <textarea className="form-textarea" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="detail-row"><span className="detail-row-label">Email</span><span className="detail-row-value">{candidate.email || '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">Telefono</span><span className="detail-row-value">{candidate.phone || '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">LinkedIn</span><span className="detail-row-value">{candidate.linkedin_url ? <a href={candidate.linkedin_url} target="_blank" rel="noopener" style={{ color: 'var(--accent-primary)' }}>Profilo ↗</a> : '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">Ruolo</span><span className="detail-row-value">{candidate.current_job_role || '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">Azienda</span><span className="detail-row-value">{candidate.current_company || '—'}</span></div>
                  <div className="detail-row"><span className="detail-row-label">Fonte</span><span className="detail-row-value">{candidate.source ? <span className="badge badge-primary">{candidate.source}</span> : '—'}</span></div>
                </>
              )}
            </div>
            {!editing && candidate.notes && (
              <div className="detail-section">
                <div className="detail-section-title">Note</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{candidate.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — Applications */}
        <div>
          <div className="card">
            <div className="detail-section-title">Candidature ({applications.length})</div>
            {applications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Nessuna candidatura associata.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {applications.map((app) => (
                  <div key={app.id} className="glass glass-hover" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 600 }}>{app.jobs?.title || 'Posizione'}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{app.jobs?.department}</div>
                    {app.pipeline_stages && (
                      <span className="badge" style={{ marginTop: 'var(--space-xs)', background: `${app.pipeline_stages.color}20`, color: app.pipeline_stages.color }}>
                        {app.pipeline_stages.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="detail-section-title">Timeline</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              <div style={{ padding: 'var(--space-xs) 0' }}>📅 Aggiunto il {new Date(candidate.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              {candidate.updated_at !== candidate.created_at && (
                <div style={{ padding: 'var(--space-xs) 0' }}>✏️ Aggiornato il {new Date(candidate.updated_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
