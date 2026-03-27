'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    openJobs: 0,
    weekInterviews: 0,
    activeApplications: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Fetch counts
      const [candidatesRes, jobsRes, interviewsRes, applicationsRes] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('interviews').select('id', { count: 'exact', head: true })
          .gte('scheduled_at', new Date(Date.now() - 7 * 86400000).toISOString())
          .lte('scheduled_at', new Date(Date.now() + 7 * 86400000).toISOString()),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalCandidates: candidatesRes.count || 0,
        openJobs: jobsRes.count || 0,
        weekInterviews: interviewsRes.count || 0,
        activeApplications: applicationsRes.count || 0,
      });

      // Recent candidates
      const { data: candidates } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentCandidates(candidates || []);

      // Recent activities
      const { data: activities } = await supabase
        .from('activities')
        .select('*, team_members:user_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecentActivities(activities || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const kpis = [
    { label: 'Candidati Totali', value: stats.totalCandidates, icon: '👤', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Posizioni Aperte', value: stats.openJobs, icon: '💼', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Colloqui Settimana', value: stats.weekInterviews, icon: '📅', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Candidature Attive', value: stats.activeApplications, icon: '📋', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Panoramica del tuo processo di recruiting</p>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card kpi-card card-hoverable">
            <div className="kpi-card-header">
              <span className="kpi-card-label">{kpi.label}</span>
              <div className="kpi-card-icon" style={{ background: kpi.bg, color: kpi.color }}>
                {kpi.icon}
              </div>
            </div>
            <div className="kpi-card-value">{loading ? '—' : kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Recent Candidates */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
            Candidati Recenti
          </h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Caricamento...</p>
          ) : recentCandidates.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nessun candidato ancora. Aggiungine uno!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {recentCandidates.map((c) => (
                <div key={c.id} className="glass glass-hover" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div className="avatar" style={{ background: 'var(--accent-gradient)' }}>
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{c.first_name} {c.last_name}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{c.current_job_role || 'N/A'} {c.current_company ? `@ ${c.current_company}` : ''}</div>
                  </div>
                  <span className="badge badge-primary">{c.source || 'diretto'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
            Attività Recenti
          </h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Caricamento...</p>
          ) : recentActivities.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nessuna attività registrata ancora.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {recentActivities.map((a) => (
                <div key={a.id} style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span style={{ fontSize: '14px' }}>
                    {a.action === 'created' ? '✨' : a.action === 'updated' ? '✏️' : a.action === 'moved' ? '➡️' : '💬'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{a.team_members?.full_name || 'Sistema'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}> {a.action} </span>
                    <span style={{ color: 'var(--text-muted)' }}>{a.entity_type}</span>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {new Date(a.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
