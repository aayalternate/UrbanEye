import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminAnalytics.css';

const AdminAnalytics = ({ complaints }) => {
    const [timePeriod, setTimePeriod] = useState('all');

    const filteredComplaints = useMemo(() => {
        if (timePeriod === 'all') return complaints;
        const now = new Date();
        const cutoff = new Date();
        if (timePeriod === 'week') cutoff.setDate(now.getDate() - 7);
        else if (timePeriod === 'month') cutoff.setMonth(now.getMonth() - 1);
        return complaints.filter(c => new Date(c.createdAt) >= cutoff);
    }, [complaints, timePeriod]);

    // KPIs
    const totalProblems = filteredComplaints.length;
    const resolvedProblems = filteredComplaints.filter(c => c.status === 'Resolved').length;
    const pendingProblems = filteredComplaints.filter(c => c.status === 'Pending').length;
    const inProgressProblems = filteredComplaints.filter(c => c.status === 'In Progress').length;
    const efficiencyRate = totalProblems > 0 ? ((resolvedProblems / totalProblems) * 100).toFixed(1) : 0;

    // Status distribution
    const statusData = useMemo(() => {
        const statuses = { 'Pending': 0, 'In Progress': 0, 'Resolved': 0, 'Rejected': 0 };
        filteredComplaints.forEach(c => { statuses[c.status || 'Pending'] = (statuses[c.status || 'Pending'] || 0) + 1; });
        return statuses;
    }, [filteredComplaints]);

    // Trend data
    const trendData = useMemo(() => {
        const buckets = {};
        const now = new Date();
        if (timePeriod === 'week') {
            for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(now.getDate() - i); buckets[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0; }
            filteredComplaints.forEach(c => { const key = new Date(c.createdAt).toLocaleDateString('en-US', { weekday: 'short' }); if (buckets[key] !== undefined) buckets[key]++; });
        } else if (timePeriod === 'month') {
            for (let i = 3; i >= 0; i--) buckets[`Week ${4 - i}`] = 0;
            filteredComplaints.forEach(c => { const daysAgo = Math.floor((now - new Date(c.createdAt)) / 864e5); const wi = Math.floor(daysAgo / 7); if (wi >= 0 && wi < 4 && buckets[`Week ${4 - wi}`] !== undefined) buckets[`Week ${4 - wi}`]++; });
        } else {
            const months = {};
            filteredComplaints.forEach(c => { const key = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); months[key] = (months[key] || 0) + 1; });
            Object.keys(months).slice(-6).forEach(k => { buckets[k] = months[k]; });
            if (!Object.keys(buckets).length) buckets['No Data'] = 0;
        }
        const max = Math.max(...Object.values(buckets), 1);
        return Object.entries(buckets).map(([label, count]) => ({ label, count, height: (count / max) * 100 }));
    }, [filteredComplaints, timePeriod]);

    // Heatmap
    const heatmapData = useMemo(() => {
        const clusters = [];
        filteredComplaints.forEach(c => {
            if (!c.location?.lat || !c.location?.lng) return;
            let added = false;
            for (const cl of clusters) {
                if (Math.sqrt(Math.pow(cl.lat - c.location.lat, 2) + Math.pow(cl.lng - c.location.lng, 2)) < 0.005) {
                    cl.count++; cl.complaints.push(c); added = true; break;
                }
            }
            if (!added) clusters.push({ lat: c.location.lat, lng: c.location.lng, count: 1, complaints: [c] });
        });
        return clusters;
    }, [filteredComplaints]);

    const mapCenter = useMemo(() => {
        if (!heatmapData.length) return [20.5937, 78.9629];
        return [heatmapData.reduce((s, p) => s + p.lat, 0) / heatmapData.length, heatmapData.reduce((s, p) => s + p.lng, 0) / heatmapData.length];
    }, [heatmapData]);

    const getHeatColor = (count) => count >= 5 ? '#dc2626' : count >= 3 ? '#d97706' : count >= 2 ? '#2563eb' : '#059669';
    const getHeatRadius = (count) => Math.min(8 + count * 4, 30);
    const statusColors = { 'Pending': '#d97706', 'In Progress': '#2563eb', 'Resolved': '#059669', 'Rejected': '#dc2626' };
    const totalStatusCount = Object.values(statusData).reduce((a, b) => a + b, 0) || 1;

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div className="analytics-title-area">
                    <h2 className="analytics-title">Analytics Overview</h2>
                    <p className="analytics-subtitle">Insights from complaint data</p>
                </div>
                <div className="time-selector">
                    {['week', 'month', 'all'].map(p => (
                        <button key={p} className={`time-btn ${timePeriod === p ? 'active' : ''}`} onClick={() => setTimePeriod(p)}>
                            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card kpi-total">
                    <div className="kpi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                    <div className="kpi-content"><span className="kpi-value">{totalProblems}</span><span className="kpi-label">Total Problems</span></div>
                </div>
                <div className="kpi-card kpi-resolved">
                    <div className="kpi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div>
                    <div className="kpi-content"><span className="kpi-value">{resolvedProblems}</span><span className="kpi-label">Resolved</span></div>
                </div>
                <div className="kpi-card kpi-pending">
                    <div className="kpi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></div>
                    <div className="kpi-content"><span className="kpi-value">{pendingProblems + inProgressProblems}</span><span className="kpi-label">Active Cases</span></div>
                </div>
                <div className="kpi-card kpi-efficiency">
                    <div className="kpi-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div>
                    <div className="kpi-content"><span className="kpi-value">{efficiencyRate}%</span><span className="kpi-label">Efficiency Rate</span></div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title">Status Distribution</h3>
                    <div className="status-chart">
                        <div className="status-bar-stacked">
                            {Object.entries(statusData).map(([status, count]) => count > 0 ? (
                                <div key={status} className="status-segment" style={{ width: `${(count / totalStatusCount) * 100}%`, backgroundColor: statusColors[status] }} title={`${status}: ${count}`}></div>
                            ) : null)}
                        </div>
                        <div className="status-legend">
                            {Object.entries(statusData).map(([status, count]) => (
                                <div key={status} className="legend-item">
                                    <span className="legend-dot" style={{ backgroundColor: statusColors[status] }}></span>
                                    <span className="legend-label">{status}</span>
                                    <span className="legend-value">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="chart-card">
                    <h3 className="chart-title">Complaint Trend <span className="chart-subtitle">{timePeriod === 'week' ? '(Daily)' : timePeriod === 'month' ? '(Weekly)' : '(Monthly)'}</span></h3>
                    <div className="trend-chart">
                        <div className="trend-bars">
                            {trendData.map((d, i) => (
                                <div key={i} className="trend-col">
                                    <div className="trend-bar-wrapper">
                                        <span className="trend-count">{d.count}</span>
                                        <div className="trend-bar" style={{ height: `${Math.max(d.height, 4)}%` }}></div>
                                    </div>
                                    <span className="trend-label">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="chart-card heatmap-card">
                <h3 className="chart-title">Issue Hotspot Map <span className="chart-subtitle">Complaint density by location</span></h3>
                <div className="heatmap-legend">
                    <span className="heat-legend-item"><span className="heat-dot" style={{background:'#059669'}}></span> Low (1)</span>
                    <span className="heat-legend-item"><span className="heat-dot" style={{background:'#2563eb'}}></span> Medium (2)</span>
                    <span className="heat-legend-item"><span className="heat-dot" style={{background:'#d97706'}}></span> High (3-4)</span>
                    <span className="heat-legend-item"><span className="heat-dot" style={{background:'#dc2626'}}></span> Critical (5+)</span>
                </div>
                <div className="heatmap-container">
                    <MapContainer center={mapCenter} zoom={heatmapData.length > 0 ? 10 : 5} scrollWheelZoom={true} className="analytics-map">
                        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {heatmapData.map((point, i) => (
                            <CircleMarker key={i} center={[point.lat, point.lng]} radius={getHeatRadius(point.count)} pathOptions={{ color: getHeatColor(point.count), fillColor: getHeatColor(point.count), fillOpacity: 0.35, weight: 2, opacity: 0.8 }}>
                                <Popup><div style={{ fontSize: '13px' }}><strong>{point.count} complaint{point.count > 1 ? 's' : ''}</strong><br />{point.complaints.slice(0, 3).map((c, j) => <span key={j}>• {c.heading || c.title}<br /></span>)}{point.complaints.length > 3 && <span>...and {point.complaints.length - 3} more</span>}</div></Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
