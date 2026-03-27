'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { supabase, signOut } from '@/lib/supabase';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/');
        return;
      }
      // Get team member data
      const { data: member } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      setUser(member || { full_name: authUser.email, email: authUser.email });
      setLoading(false);
    }
    loadUser();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Caricamento applicazione...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar collapsed={collapsed} user={user} onLogout={handleLogout} />
        <div className="app-content animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
