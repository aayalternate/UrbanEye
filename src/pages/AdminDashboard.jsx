import React, { useState } from 'react';
import Header from '../components/Header';
import ComplaintGrid from '../components/ComplaintGrid';
import AdminComplaintDetailModal from '../components/AdminComplaintDetailModal';
import AdminAnalytics from '../components/AdminAnalytics';
import { escalateComplaint, updateComplaintStatus } from '../api/client';
import './AdminDashboard.css';

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function AdminDashboard({ complaints, setComplaints, activeTab, onTabChange, adminDept, adminLevel, onLogout }) {
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState('All');

    const adminTabs = [
        { key: 'complaints', label: 'Complaints' },
        { key: 'analytics', label: 'Analytics' },
        { key: 'notification', label: 'Notifications' },
    ];

    const filteredComplaints = complaints.filter(
        (c) => (adminDept === 'All' || c.department === adminDept) && 
               (c.level === adminLevel || (adminLevel === 'Panchayat' && c.level === 'Panchayath') || (adminLevel === 'All'))
    );

    const processedComplaints = [];
    const visited = new Set();

    filteredComplaints.forEach((c1) => {
        if (visited.has(c1.id)) return;
        const cluster = [c1];
        visited.add(c1.id);
        let added = true;
        while (added) {
            added = false;
            filteredComplaints.forEach(c2 => {
                if (visited.has(c2.id)) return;
                for (let clustered of cluster) {
                    if (getDistanceFromLatLonInMeters(clustered.location?.lat, clustered.location?.lng, c2.location?.lat, c2.location?.lng) <= 300) {
                        cluster.push(c2); visited.add(c2.id); added = true; break;
                    }
                }
            });
        }
        if (cluster.length > 1) {
            const combinedMedia = [];
            cluster.forEach(comp => { if (comp.media) combinedMedia.push(...(Array.isArray(comp.media) ? comp.media : [])); });
            processedComplaints.push({
                ...c1, id: `cluster-${c1.id}`, isCluster: true, subComplaints: cluster, media: combinedMedia,
                priority: 'High', priorityReason: `${cluster.length} same complaints combined`,
                text: `(Combined ${cluster.length} complaints)\n\n` + cluster.map((c, i) => `--- Complaint ${i + 1} ---\nHeading: ${c.heading}\nContext: ${c.text}`).join('\n\n')
            });
        } else {
            processedComplaints.push({ ...c1, priority: 'Low', priorityReason: null });
        }
    });

    const displayedComplaints = selectedPriority === 'All' ? processedComplaints : processedComplaints.filter(c => c.priority === selectedPriority);

    const counts = {
        All: processedComplaints.length,
        High: processedComplaints.filter(c => c.priority === 'High').length,
        Low: processedComplaints.filter(c => c.priority === 'Low').length
    };

    const handleEscalate = async (id) => {
        let escalateIds = [];
        const clusterComplaint = processedComplaints.find(c => c.id === id);
        if (clusterComplaint?.isCluster) {
            escalateIds = clusterComplaint.subComplaints.map(sc => sc.id);
        } else {
            escalateIds = [id];
        }
        const nextLevel = (adminLevel === 'Panchayath' || adminLevel === 'Panchayat') ? 'District' : 'State';
        try {
            await Promise.all(escalateIds.map(compId => escalateComplaint(compId, nextLevel, adminLevel)));
            setComplaints(prev => prev.map(c => escalateIds.includes(c.id) ? { ...c, level: nextLevel, passedFrom: adminLevel } : c));
            alert(`Complaint(s) passed to ${nextLevel} hierarchy.`);
        } catch (error) {
            alert('Failed to escalate complaint(s).');
        }
    };

    const handleStatusUpdate = async (id, status, note, image) => {
        // For clusters, update all sub-complaints
        let updateIds = [];
        const clusterComplaint = processedComplaints.find(c => c.id === id);
        if (clusterComplaint?.isCluster) {
            updateIds = clusterComplaint.subComplaints.map(sc => sc.id);
        } else {
            updateIds = [id];
        }
        await Promise.all(updateIds.map(compId => updateComplaintStatus(compId, status, note, image)));
        setComplaints(prev => prev.map(c => updateIds.includes(c.id) ? { ...c, status } : c));
        alert(`Complaint(s) marked as ${status}.`);
    };

    return (
        <>
            <Header activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} tabs={adminTabs} />
            <main className="main-content">
                {activeTab === 'complaints' ? (
                    <div className="admin-layout">
                        <aside className="priority-sidebar">
                            <h3 className="sidebar-title">Priority Queue</h3>
                            <ul className="priority-list">
                                <li className={selectedPriority === 'All' ? 'active' : ''} onClick={() => setSelectedPriority('All')}>
                                    <span className="priority-label">All Complaints</span><span className="priority-count">{counts.All}</span>
                                </li>
                                <li className={selectedPriority === 'High' ? 'active high-priority' : 'high-priority'} onClick={() => setSelectedPriority('High')}>
                                    <span className="priority-label">🔴 High Priority</span><span className="priority-count">{counts.High}</span>
                                </li>
                                <li className={selectedPriority === 'Low' ? 'active low-priority' : 'low-priority'} onClick={() => setSelectedPriority('Low')}>
                                    <span className="priority-label">🟢 Low Priority</span><span className="priority-count">{counts.Low}</span>
                                </li>
                            </ul>
                        </aside>
                        <div className="admin-main-area">
                            {displayedComplaints.length > 0 ? (
                                <ComplaintGrid complaints={displayedComplaints} onComplaintClick={(c) => setSelectedComplaint(c)} isAdminView={true} />
                            ) : (
                                <div className="empty-state"><p className="empty-text">No {selectedPriority !== 'All' ? selectedPriority.toLowerCase() + ' priority ' : ''}complaints.</p></div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'analytics' ? (
                    <AdminAnalytics complaints={filteredComplaints} />
                ) : (
                    <div className="empty-state"><p className="empty-text">Notifications are empty.</p></div>
                )}
                <AdminComplaintDetailModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} onEscalate={handleEscalate} onStatusUpdate={handleStatusUpdate} />
            </main>
        </>
    );
}

export default AdminDashboard;
