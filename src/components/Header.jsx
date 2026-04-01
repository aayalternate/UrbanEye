import React from 'react';
import './Header.css';

const Header = ({ activeTab, onTabChange, onLogout, tabs }) => {
  const defaultTabs = [
    { key: 'complaints', label: 'Complaints' },
    { key: 'notification', label: 'Notifications' },
  ];

  const tabList = tabs || defaultTabs;

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="20" height="26" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12v8c0 6.627 5.373 12 12 12s12-5.373 12-12V12c0-6.627-5.373-12-12-12zm-3 8c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm6 16c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" fill="url(#logoGrad)" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">UrbanEye</span>
        </div>

        <nav className="nav-tabs">
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
