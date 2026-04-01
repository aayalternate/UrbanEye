const BASE_URL = 'http://localhost:5001/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const login = async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
    }
    return res.json();
};

export const fetchComplaints = async () => {
    const res = await fetch(`${BASE_URL}/complaints`, {
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
};

export const fetchAllComplaintsAsAdmin = async () => {
    const res = await fetch(`${BASE_URL}/complaints/admin`, {
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch admin complaints');
    return res.json();
};

export const createComplaint = async (complaintData) => {
    const res = await fetch(`${BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(complaintData)
    });
    if (!res.ok) throw new Error('Failed to create complaint');
    return res.json();
};

export const escalateComplaint = async (id, level, passedFrom) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/escalate`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify({ level, passedFrom })
    });
    if (!res.ok) throw new Error('Failed to escalate complaint');
    return res.json();
};

export const updateComplaintStatus = async (id, status, note, image) => {
    const res = await fetch(`${BASE_URL}/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify({ status, note, image })
    });
    if (!res.ok) throw new Error('Failed to update complaint status');
    return res.json();
};

export const fetchNotifications = async () => {
    const res = await fetch(`${BASE_URL}/notifications`, {
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
};

export const markNotificationRead = async (id) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to mark notification');
    return res.json();
};
