import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import { fetchComplaints, fetchAllComplaintsAsAdmin, createComplaint } from './api/client';

function App() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('complaints');
  const [userRole, setUserRole] = useState(null); // 'user' or 'admin'
  const [adminDept, setAdminDept] = useState('All'); // Keeping placeholders
  const [adminLevel, setAdminLevel] = useState('State'); // Keeping placeholders
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUserRole(parsedUser.role);
        setUser(parsedUser);
        loadComplaints(parsedUser.role);
        
        if (parsedUser.role === 'admin') {
            setAdminDept(parsedUser.department || 'All');
            setAdminLevel(parsedUser.level || 'State');
        }
        
        // Only redirect if on login page, otherwise let them stay where they are
        if (location.pathname === '/login' || location.pathname === '/') {
            navigate(parsedUser.role === 'admin' ? '/admin' : '/user');
        }
    } else {
        if (location.pathname !== '/login') {
            navigate('/login');
        }
    }
  }, []);

  const loadComplaints = async (role) => {
    try {
      if (role === 'admin') {
        const data = await fetchAllComplaintsAsAdmin();
        setComplaints(data);
      } else {
        const data = await fetchComplaints();
        setComplaints(data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  const handleAddComplaint = async ({ heading, text, media, department, location }) => {
    try {
      const newComplaint = await createComplaint({
        title: heading,
        description: text,
        image: media && media.length > 0 ? media[0].preview : '',
        category: department,
        location: location ? { lat: location.lat, lng: location.lng, address: location.address || 'Selected on map' } : { lat: 0, lng: 0, address: 'Unknown' }, // Fallback if no location
      });
      // The API returns the MongoDB document `_id`. Map it so frontend components using `id` don't break.
      const transformed = { ...newComplaint, id: newComplaint._id };
      setComplaints([transformed, ...complaints]);
    } catch (err) {
      console.error('Failed to add complaint:', err);
      alert('Failed to add complaint. Make sure backend is running.');
    }
  };

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ 
        username: data.username, 
        role: data.role,
        department: data.department,
        level: data.level
    }));
    setUserRole(data.role);
    setUser({ username: data.username, role: data.role });
    
    if (data.role === 'admin') {
      setAdminDept(data.department || 'All');
      setAdminLevel(data.level || 'State');
    }

    loadComplaints(data.role);

    if (data.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null);
    setUser(null);
    setAdminDept('All');
    setAdminLevel('State');
    setComplaints([]);
    navigate('/login');
  };

  // Map MongoDB `_id` to `id` mapping for existing components expecting `.id`
  const normalizedComplaints = complaints.map(c => ({
      ...c,
      id: c.id || c._id,
      heading: c.heading || c.title,
      text: c.text || c.description,
      media: c.media || c.image,
      department: c.department || c.category,
      level: c.level || 'Panchayath',
  }));

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route
        path="/user"
        element={
          <UserDashboard
            complaints={normalizedComplaints}
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
            complaints={normalizedComplaints}
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
