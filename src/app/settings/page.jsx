'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase, signOut } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data: member } = await supabase.from('team_members').select('*').eq('user_id', authUser.id).single();
      if (member) {
        setUser(member);
        setProfileForm({ full_name: member.full_name, email: member.email });
      }
    }
    load();
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user) return;
    await supabase.from('team_members').update({
      full_name: profileForm.full_name,
      email: profileForm.email,
    }).eq('id', user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogout() {
    await signOut();
    router.push('/');
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Impostazioni</h1>
          <p>Gestisci il tuo profilo e le preferenze dell&apos;app</p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Profile */}
        <div className="card">
          <div className="detail-section-title">Profilo</div>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input className="form-input" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <button type="submit" className="btn btn-primary">Salva Profilo</button>
              {saved && <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>✓ Salvato</span>}
            </div>
          </form>
        </div>

        {/* App Info */}
        <div className="card">
          <div className="detail-section-title">Informazioni App</div>
          <div className="detail-row">
            <span className="detail-row-label">Versione</span>
            <span className="detail-row-value">1.0.0</span>
          </div>
          <div className="detail-row">
            <span className="detail-row-label">Stack</span>
            <span className="detail-row-value">Next.js + Supabase</span>
          </div>
          <div className="detail-row">
            <span className="detail-row-label">Database</span>
            <span className="detail-row-value">PostgreSQL (Supabase)</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="detail-section-title" style={{ color: 'var(--color-danger)' }}>Zona Pericolosa</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
            Queste azioni sono irreversibili. Procedi con cautela.
          </p>
          <button className="btn btn-danger" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
