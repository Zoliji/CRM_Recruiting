'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Candidati', href: '/candidates', icon: '👤' },
  { label: 'Posizioni', href: '/jobs', icon: '💼' },
  { label: 'Pipeline', href: '/pipeline', icon: '🔀' },
  { label: 'Colloqui', href: '/interviews', icon: '📅' },
  { label: 'Team', href: '/team', icon: '👥' },
  { label: 'Impostazioni', href: '/settings', icon: '⚙️' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">R</div>
        <span className="sidebar-brand">RecruitPro</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-toggle">
        <button className="sidebar-toggle-btn" onClick={onToggle} title={collapsed ? 'Espandi' : 'Comprimi'}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>
    </aside>
  );
}
