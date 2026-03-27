'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

const statusMap = {
  open: { label: 'Aperta', class: 'badge-success' },
  paused: { label: 'In Pausa', class: 'badge-warning' },
  closed: { label: 'Chiusa', class: 'badge-danger' },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'full-time', status: 'open', description: '', salary_range: '' });

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    setLoading(true);
    const { data } = await supabase.from('jobs').select('*, team_members:assigned_to(full_name)').order('created_at', { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { error } = await supabase.from('jobs').insert(form);
    if (!error) {
      setShowModal(false);
      setForm({ title: '', department: '', location: '', type: 'full-time', status: 'open', description: '', salary_range: '' });
      loadJobs();
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questa posizione?')) return;
    await supabase.from('jobs').delete().eq('id', id);
    loadJobs();
  }

  const filtered = jobs.filter((j) => {
    const term = search.toLowerCase();
    const matchesSearch = !term || `${j.title} ${j.department} ${j.location}`.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Posizioni Aperte</h1>
          <p>{jobs.filter((j) => j.status === 'open').length} posizioni attive</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuova Posizione</button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Cerca posizioni..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="open">Aperte</option>
          <option value="paused">In Pausa</option>
          <option value="closed">Chiuse</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>Caricamento...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h3>Nessuna posizione trovata</h3>
            <p>Crea la tua prima posizione per iniziare a ricevere candidature.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Aggiungi Posizione</button>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titolo</th>
                  <th>Dipartimento</th>
                  <th>Sede</th>
                  <th>Tipo</th>
                  <th>Stato</th>
                  <th>Assegnato a</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <Link href={`/jobs/${j.id}`} style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {j.title}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{j.department || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{j.location || '—'}</td>
                    <td><span className="badge badge-info">{j.type}</span></td>
                    <td><span className={`badge ${statusMap[j.status]?.class || 'badge-primary'}`}>{statusMap[j.status]?.label || j.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{j.team_members?.full_name || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      {new Date(j.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(j.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nuova Posizione</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titolo *</label>
                  <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dipartimento</label>
                    <input className="form-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sede</label>
                    <input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Range Salariale</label>
                    <input className="form-input" placeholder="es. 30k-40k" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descrizione</label>
                  <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Crea Posizione</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
