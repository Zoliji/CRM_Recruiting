'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', role: 'recruiter' });

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const { data } = await supabase.from('team_members').select('*').order('created_at');
    setMembers(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { error } = await supabase.from('team_members').insert(form);
    if (!error) {
      setShowModal(false);
      setForm({ full_name: '', email: '', role: 'recruiter' });
      loadMembers();
    }
  }

  async function handleRoleChange(id, role) {
    await supabase.from('team_members').update({ role }).eq('id', id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
  }

  async function handleDelete(id) {
    if (!confirm('Rimuovere questo membro dal team?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    loadMembers();
  }

  const roleColors = {
    admin: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' },
    recruiter: { bg: 'var(--accent-primary-glow)', color: 'var(--accent-primary-hover)' },
    viewer: { bg: 'var(--color-info-bg)', color: 'var(--color-info)' },
  };

  const roleLabels = { admin: 'Admin', recruiter: 'Recruiter', viewer: 'Viewer' };

  const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444'];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Team</h1>
          <p>{members.length} membri del team</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Aggiungi Membro</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Caricamento...</p>
      ) : members.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>Nessun membro nel team</h3>
            <p>Invita il tuo primo collega per iniziare a collaborare.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Aggiungi Membro</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
          {members.map((m, i) => (
            <div key={m.id} className="card card-hoverable" style={{ textAlign: 'center', position: 'relative' }}>
              <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)' }} onClick={() => handleDelete(m.id)} title="Rimuovi">✕</button>
              <div className="avatar avatar-xl" style={{ background: avatarColors[i % avatarColors.length], margin: '0 auto var(--space-md)' }}>
                {m.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>{m.full_name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>{m.email}</p>
              <select
                className="form-select"
                value={m.role}
                onChange={(e) => handleRoleChange(m.id, e.target.value)}
                style={{ maxWidth: '160px', margin: '0 auto', textAlign: 'center', background: roleColors[m.role]?.bg, color: roleColors[m.role]?.color, border: 'none', fontWeight: 600 }}
              >
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="viewer">Viewer</option>
              </select>
              <div style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Aggiunto il {new Date(m.created_at).toLocaleDateString('it-IT')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Aggiungi Membro</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input className="form-input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ruolo</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Aggiungi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
