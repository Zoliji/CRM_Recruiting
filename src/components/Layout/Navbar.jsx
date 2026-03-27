'use client';

export default function Navbar({ collapsed, user, onLogout }) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className={`navbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="navbar-search">
        <div className="navbar-search-wrapper">
          <span className="navbar-search-icon">🔍</span>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Cerca candidati, posizioni, colloqui..."
          />
        </div>
      </div>

      <div className="navbar-actions">
        <button className="navbar-btn" title="Notifiche">
          🔔
          <span className="notification-dot"></span>
        </button>
        <div className="navbar-avatar" title={user?.full_name || 'Profilo'} onClick={onLogout}>
          {initials}
        </div>
      </div>
    </header>
  );
}
