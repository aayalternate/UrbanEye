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
