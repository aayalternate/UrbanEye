import React, { useState } from 'react';
import './Login.css';
import { login as apiLogin } from '../api/client';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [department, setDepartment] = useState('All');
    const [level, setLevel] = useState('Panchayat');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        let loginUsername = username;
        let loginPassword = password;
        
        if (isAdminLogin) {
            if (level === 'All' && department === 'All') {
                loginUsername = 'admin';
                loginPassword = 'adminpassword';
            } else {
                loginUsername = `admin_${level.toLowerCase()}_${department.toLowerCase()}`;
                loginPassword = 'adminpassword';
            }
        }

        try {
            const data = await apiLogin(loginUsername, loginPassword);
            onLogin(data);
        } catch (err) {
            setError(err.message + (isAdminLogin ? " (Note: Make sure the specific Admin account for this department/level is seeded in DB)" : ""));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated background shapes */}
            <div className="login-bg">
                <div className="bg-shape bg-shape-1"></div>
                <div className="bg-shape bg-shape-2"></div>
                <div className="bg-shape bg-shape-3"></div>
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <svg width="32" height="42" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.373 0 0 5.373 0 12v8c0 6.627 5.373 12 12 12s12-5.373 12-12V12c0-6.627-5.373-12-12-12zm-3 8c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm6 16c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" fill="url(#loginLogoGrad)" />
                            <defs>
                                <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="24" y2="32" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#8b5cf6" />
                                    <stop offset="1" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="login-title">UrbanEye</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-btn ${!isAdminLogin ? 'active' : ''}`}
                            onClick={() => setIsAdminLogin(false)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            User
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${isAdminLogin ? 'active' : ''}`}
                            onClick={() => setIsAdminLogin(true)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4"/></svg>
                            Admin
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="e.g. user1, admin"
                            className="login-input"
                        />
                    </div>
                    <div className="input-group slide-down">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="e.g. pass1, adminpassword"
                            className="login-input"
                        />
                    </div>
                    
                    {isAdminLogin && (
                        <>
                            <div className="input-group slide-down">
                                <label>Admin Level</label>
                                <select 
                                    value={level} 
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="login-input"
                                >
                                    <option value="State">State</option>
                                    <option value="District">District</option>
                                    <option value="Panchayat">Panchayat</option>
                                </select>
                            </div>
                            <div className="input-group slide-down">
                                <label>Department</label>
                                <select 
                                    value={department} 
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="login-input"
                                >
                                    <option value="All">All Departments</option>
                                    <option value="Health">Health</option>
                                    <option value="Roads">Road & Safety</option>
                                    <option value="Water">Water & Sanitation</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </>
                    )}
                    
                    <button type="submit" className="login-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <span className="btn-spinner"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                    
                    <div className="login-hint">
                        Demo credentials: <strong>user1</strong> (pass1) • <strong>user2</strong> (pass2) • <strong>admin</strong> (adminpassword)
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
