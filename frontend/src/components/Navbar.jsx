import { Link } from 'react-router-dom';

const Navbar = ({ sidebarOpen, onToggleSidebar }) => {
  return (
    <nav className="chat-navbar">
      {/* Show hamburger in navbar ONLY when sidebar is closed */}
      {!sidebarOpen && (
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar} aria-label="Open sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}
      <div className="chat-navbar-title">
        <Link to="/" className="navbar-logo-text">⚡ PaperMind</Link>
      </div>
      {/* Balance spacer so logo stays centered when hamburger is visible */}
      {!sidebarOpen && <div style={{ width: 34 }} />}
    </nav>
  );
};

export default Navbar;
