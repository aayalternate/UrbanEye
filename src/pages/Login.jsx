import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
    const [role, setRole] = useState('user');
    const [department, setDepartment] = useState('');
    const [level, setLevel] = useState('Panchayath');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(role, department, level);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1 className="login-title">UrbanEye</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Login As:</label>
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${role === 'user' ? 'active' : ''}`}
                                onClick={() => setRole('user')}
                            >
                                User
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                                onClick={() => setRole('admin')}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <>
                            <div className="input-group slide-down">
                                <label htmlFor="admin-dept">Department</label>
                                <select
                                    id="admin-dept"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Department</option>
                                    <option value="Health">Health Department</option>
                                    <option value="Roads">Road & Safety</option>
                                    <option value="Water">Water & Sanitation</option>
                                    <option value="Electricity">Electricity Board</option>
                                    <option value="Other">Other Public Departments</option>
                                </select>
                            </div>

                            <div className="input-group slide-down">
                                <label htmlFor="admin-level">Admin Level</label>
                                <select
                                    id="admin-level"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    required
                                >
                                    <option value="Panchayath">Panchayath (Level 1)</option>
                                    <option value="District">District (Level 2)</option>
                                    <option value="State">State (Level 3)</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="login-submit-btn">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
