'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', linkedin_url: '', current_company: '', current_job_role: '', source: '', notes: '' });

  useEffect(() => { loadCandidates(); }, []);

  async function loadCandidates() {
    setLoading(true);
    let query = supabase.from('candidates').select('*').order('created_at', { ascending: false });
    const { data } = await query;
    setCandidates(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { error } = await supabase.from('candidates').insert(form);
    if (!error) {
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', linkedin_url: '', current_company: '', current_job_role: '', source: '', notes: '' });
      loadCandidates();
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questo candidato?')) return;
    await supabase.from('candidates').delete().eq('id', id);
    loadCandidates();
  }

  const filtered = candidates.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch = !term || `${c.first_name} ${c.last_name} ${c.email} ${c.current_job_role}`.toLowerCase().includes(term);
    const matchesSource = !sourceFilter || c.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const sources = [...new Set(candidates.map((c) => c.source).filter(Boolean))];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Candidati</h1>
          <p>{candidates.length} candidati nel database</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuovo Candidato</button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Cerca candidati..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">Tutte le fonti</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>Caricamento...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>Nessun candidato trovato</h3>
            <p>Aggiungi il tuo primo candidato per iniziare a gestire il processo di recruiting.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Aggiungi Candidato</button>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Ruolo Attuale</th>
                  <th>Azienda</th>
                  <th>Fonte</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/candidates/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)' }}>
                          {c.first_name?.[0]}{c.last_name?.[0]}
                        </div>
                        <span style={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</span>
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                    <td>{c.current_job_role || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.current_company || '—'}</td>
                    <td>{c.source ? <span className="badge badge-primary">{c.source}</span> : '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(c.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)} title="Elimina">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nuovo Candidato</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome *</label>
                    <input className="form-input" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cognome *</label>
                    <input className="form-input" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefono</label>
                    <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input className="form-input" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ruolo Attuale</label>
                    <input className="form-input" value={form.current_job_role} onChange={(e) => setForm({ ...form, current_job_role: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Azienda Attuale</label>
                    <input className="form-input" value={form.current_company} onChange={(e) => setForm({ ...form, current_company: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Fonte</label>
                  <select className="form-select" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
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
                  <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Salva Candidato</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
