'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { supabase } from '@/lib/supabase';

export default function PipelinePage() {
  const [stages, setStages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(true);
  const [dragItem, setDragItem] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [stagesRes, appsRes, jobsRes] = await Promise.all([
      supabase.from('pipeline_stages').select('*').order('order_index'),
      supabase.from('applications').select('*, candidates(first_name, last_name, current_job_role), jobs(title), pipeline_stages(name, color)'),
      supabase.from('jobs').select('id, title').eq('status', 'open'),
    ]);
    setStages(stagesRes.data || []);
    setApplications(appsRes.data || []);
    setJobs(jobsRes.data || []);
    setLoading(false);
  }

  async function moveApplication(appId, newStageId) {
    await supabase.from('applications').update({ stage_id: newStageId, updated_at: new Date().toISOString() }).eq('id', appId);
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, stage_id: newStageId } : a));
  }

  function handleDragStart(e, app) {
    setDragItem(app);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function handleDrop(e, stageId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (dragItem && dragItem.stage_id !== stageId) {
      moveApplication(dragItem.id, stageId);
    }
    setDragItem(null);
  }

  const filteredApps = selectedJob
    ? applications.filter((a) => a.job_id === selectedJob)
    : applications;

  const getRating = (rating) => {
    if (!rating) return null;
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Pipeline</h1>
          <p>Trascina le candidature tra le fasi del processo di selezione</p>
        </div>
        <div className="page-header-actions">
          <select className="filter-select" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            <option value="">Tutte le posizioni</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Caricamento pipeline...</p>
      ) : (
        <div className="kanban-board">
          {stages.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.stage_id === stage.id);
            return (
              <div key={stage.id} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <span className="kanban-column-dot" style={{ background: stage.color }}></span>
                    {stage.name}
                  </div>
                  <span className="kanban-column-count">{stageApps.length}</span>
                </div>
                <div
                  className="kanban-column-body"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {stageApps.length === 0 ? (
                    <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      Trascina qui
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className={`kanban-card ${dragItem?.id === app.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app)}
                      >
                        <div className="kanban-card-name">
                          {app.candidates?.first_name} {app.candidates?.last_name}
                        </div>
                        <div className="kanban-card-role">
                          {app.candidates?.current_job_role || 'N/A'}
                        </div>
                        <div className="kanban-card-footer">
                          <span className="kanban-card-meta">{app.jobs?.title}</span>
                          {app.rating && (
                            <span className="rating" style={{ fontSize: '12px', color: 'var(--color-warning)' }}>
                              {getRating(app.rating)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
