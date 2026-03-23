import React from 'react';
import './Header.css';

const Header = ({ activeTab, onTabChange, onLogout }) => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12v8c0 6.627 5.373 12 12 12s12-5.373 12-12V12c0-6.627-5.373-12-12-12zm-3 8c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm6 16c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" fill="#000" />
        </svg>
      </div>
      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => onTabChange('complaints')}
        >
          Complaints
        </button>
        <button
          className={`tab-btn ${activeTab === 'notification' ? 'active' : ''}`}
          onClick={() => onTabChange('notification')}
        >
          Notification
        </button>
      </nav>
      {onLogout && (
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
