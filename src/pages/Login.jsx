import React, { useState } from 'react';
import './Login.css';
import { login as apiLogin } from '../api/client';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await apiLogin(username, password);
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1 className="login-title">UrbanEye</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div style={{ color: '#ff4444', marginBottom: '15px', textAlign:'center', backgroundColor: '#ffecec', padding:'10px', borderRadius:'8px', fontSize: '0.9rem' }}>{error}</div>}
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="e.g. user1, admin"
                            style={{ width: '100%', padding: '12px', marginTop: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px' }}
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
                            style={{ width: '100%', padding: '12px', marginTop: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px' }}
                        />
                    </div>
                    
                    <button type="submit" className="login-submit-btn" style={{marginTop: '20px'}}>
                        Sign In
                    </button>
                    
                    <div style={{marginTop: '20px', fontSize: '0.8rem', color: '#666', textAlign: 'center'}}>
                        Simulate multiple users: <br/>
                        <b>user1</b> (pass1) • <b>user2</b> (pass2) • <b>admin</b> (adminpassword)
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
