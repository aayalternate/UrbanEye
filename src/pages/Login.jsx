import React, { useState } from 'react';
import './Login.css';
import { login as apiLogin } from '../api/client';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [department, setDepartment] = useState('All');
    const [level, setLevel] = useState('Panchayat'); // Changed default to Panchayat
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        let loginUsername = username;
        let loginPassword = password;
        
        if (isAdminLogin) {
            // Mapping dropdown selections to the newly seeded admin usernames
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
            // We no longer manually overwrite level/department.
            // data.department and data.level come directly from the DB auth route.
            onLogin(data);
        } catch (err) {
            setError(err.message + (isAdminLogin ? " (Note: Make sure the specific Admin account for this department/level is seeded in DB)" : ""));
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
                    <div className="role-toggle" style={{display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px'}}>
                        <button type="button" onClick={() => setIsAdminLogin(false)} style={{padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', background: !isAdminLogin ? '#8b00cc' : 'transparent', color: !isAdminLogin ? 'white' : '#333', cursor: 'pointer', fontWeight: 'bold'}}>User</button>
                        <button type="button" onClick={() => setIsAdminLogin(true)} style={{padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', background: isAdminLogin ? '#8b00cc' : 'transparent', color: isAdminLogin ? 'white' : '#333', cursor: 'pointer', fontWeight: 'bold'}}>Admin</button>
                    </div>

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
                    
                    {isAdminLogin && (
                        <>
                            <div className="input-group slide-down">
                                <label>Admin Level</label>
                                <select 
                                    value={level} 
                                    onChange={(e) => setLevel(e.target.value)}
                                    style={{ width: '100%', padding: '12px', marginTop: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}
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
                                    style={{ width: '100%', padding: '12px', marginTop: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}
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
