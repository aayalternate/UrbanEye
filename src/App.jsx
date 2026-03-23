import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('complaints');
  const [userRole, setUserRole] = useState(null); // 'user' or 'admin'
  const [adminDept, setAdminDept] = useState('');
  const [adminLevel, setAdminLevel] = useState('');

  const navigate = useNavigate();

  const handleAddComplaint = ({ heading, text, media, department, location }) => {
    const newComplaint = {
      id: Date.now(),
      heading,
      text,
      media,
      department,
      location,
      level: 'Panchayath', // Default to Panchayath
    };
    setComplaints([...complaints, newComplaint]);
  };

  const handleLogin = (role, dept, level) => {
    setUserRole(role);
    if (role === 'admin') {
      setAdminDept(dept);
      setAdminLevel(level);
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setAdminDept('');
    setAdminLevel('');
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route
        path="/user"
        element={
          <UserDashboard
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminDashboard
            complaints={complaints}
            setComplaints={setComplaints}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            adminDept={adminDept}
            adminLevel={adminLevel}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
}

export default App;
