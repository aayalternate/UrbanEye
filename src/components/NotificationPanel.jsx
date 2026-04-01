import React, { useState, useEffect } from 'react';
import { fetchNotifications, markNotificationRead } from '../api/client';
import './NotificationPanel.css';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
        setLoading(false);
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark notification:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Resolved': return '✅';
            case 'In Progress': return '⏳';
            default: return '📋';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Resolved': return 'status-resolved';
            case 'In Progress': return 'status-progress';
            default: return 'status-default';
        }
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="notification-panel">
                <div className="notification-loading">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="notification-panel">
            <div className="notification-header">
                <h2 className="notification-title">Notifications</h2>
                <span className="notification-count">{notifications.filter(n => !n.read).length} unread</span>
            </div>

            {notifications.length === 0 ? (
                <div className="notification-empty">
                    <div className="empty-icon">🔔</div>
                    <p>No notifications yet</p>
                    <span>You'll be notified when there are updates to your complaints.</span>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map(n => (
                        <div 
                            key={n._id} 
                            className={`notification-item ${!n.read ? 'unread' : ''}`}
                            onClick={() => !n.read && handleMarkRead(n._id)}
                        >
                            <div className={`notification-icon-wrapper ${getStatusClass(n.newStatus)}`}>
                                <span className="notification-icon">{getStatusIcon(n.newStatus)}</span>
                            </div>
                            <div className="notification-body">
                                <div className="notification-row">
                                    <p className="notification-message">{n.message}</p>
                                    <span className="notification-time">{formatTime(n.createdAt)}</span>
                                </div>
                                {n.note && (
                                    <div className="notification-note">
                                        <strong>Admin Note:</strong> {n.note}
                                    </div>
                                )}
                                {n.media && (
                                    <div className="notification-media">
                                        <p className="media-label">Completion Notice:</p>
                                        <img src={n.media} alt="Completion notice" className="notification-image" />
                                    </div>
                                )}
                                {!n.read && <span className="unread-dot"></span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
