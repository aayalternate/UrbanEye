import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ComplaintDetailModal.css';
import ComplaintCard from './ComplaintCard';

const AdminComplaintDetailModal = ({ complaint, onClose, onEscalate, onStatusUpdate }) => {
    const [viewingSubC, setViewingSubC] = useState(null);
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolveNote, setResolveNote] = useState('');
    const [resolveImage, setResolveImage] = useState(null);
    const [resolveImagePreview, setResolveImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setViewingSubC(null);
        setShowResolveForm(false);
        setResolveNote('');
        setResolveImage(null);
        setResolveImagePreview(null);
    }, [complaint]);

    if (!complaint) return null;

    const displayComplaint = viewingSubC || complaint;
    const canEscalate = displayComplaint.level !== 'State' && !viewingSubC;
    const currentStatus = displayComplaint.status || 'Pending';

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setResolveImage(reader.result);
            setResolveImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleMarkInProgress = async () => {
        setIsSubmitting(true);
        try {
            await onStatusUpdate(complaint.id, 'In Progress', '', '');
            onClose();
        } catch (err) {
            alert('Failed to update status.');
        }
        setIsSubmitting(false);
    };

    const handleResolve = async () => {
        if (!resolveImage) {
            alert('Please attach a completion notice image.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onStatusUpdate(complaint.id, 'Resolved', resolveNote, resolveImage);
            onClose();
        } catch (err) {
            alert('Failed to resolve complaint.');
        }
        setIsSubmitting(false);
    };

    const statusColor = {
        'Pending': '#d97706',
        'In Progress': '#2563eb',
        'Resolved': '#059669',
        'Rejected': '#dc2626'
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {viewingSubC && (
                            <button onClick={() => setViewingSubC(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>←</button>
                        )}
                        <h2>{viewingSubC ? 'Sub-Complaint Details' : 'Complaint Details'}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="detail-scroll-area">
                    <div className="detail-header-section">
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className="department-badge large" style={{ backgroundColor: 'var(--purple-accent)', color: 'white' }}>
                                {displayComplaint.level} Level
                            </span>
                            <span className="department-badge large" style={{ backgroundColor: displayComplaint.passedFrom ? '#d97706' : '#059669', color: 'white' }}>
                                {displayComplaint.passedFrom ? `Passed from ${displayComplaint.passedFrom}` : 'Direct Complaint'}
                            </span>
                            <span className="department-badge large" style={{ backgroundColor: statusColor[currentStatus], color: 'white' }}>
                                {currentStatus}
                            </span>
                            {displayComplaint.priority === 'High' && (
                                <span className="department-badge large" style={{ backgroundColor: '#dc2626', color: 'white' }}>
                                    🔴 High Priority
                                </span>
                            )}
                        </div>
                        <h3 className="detail-heading">{displayComplaint.heading}</h3>
                    </div>
                    
                    {displayComplaint.priorityReason && (
                        <div className="detail-section" style={{ backgroundColor: '#fefce8', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #d97706' }}>
                            <h4 style={{ color: '#92400e', margin: '0 0 4px', fontSize: '14px' }}>Priority Alert</h4>
                            <p className="detail-text" style={{ color: '#92400e', margin: 0 }}>{displayComplaint.priorityReason}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h4>Context</h4>
                        {displayComplaint.isCluster ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
                                {displayComplaint.subComplaints.map(subC => (
                                    <ComplaintCard key={subC.id} complaint={subC} isAdminView={true} isMini={true} onClick={() => setViewingSubC(subC)} />
                                ))}
                            </div>
                        ) : (
                            <p className="detail-text" style={{ whiteSpace: 'pre-wrap' }}>{displayComplaint.text}</p>
                        )}
                    </div>

                    {displayComplaint.media && displayComplaint.media.length > 0 && (
                        <div className="detail-section">
                            <h4>Attached Evidence</h4>
                            <div className="detail-media-grid">
                                {displayComplaint.media.map((m, idx) => (
                                    <div key={idx} className="detail-media-item">
                                        <img src={m.preview} alt={`Evidence ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {displayComplaint.location && (
                        <div className="detail-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h4>Location</h4>
                                <a href={`https://www.google.com/maps?q=${displayComplaint.location.lat},${displayComplaint.location.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--purple-accent)', textDecoration: 'none', fontWeight: 500 }} onClick={(e) => e.stopPropagation()}>Open in Google Maps ↗</a>
                            </div>
                            <p className="detail-text" style={{ marginBottom: '12px', fontSize: '13px' }}>
                                Coordinates: {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
                            </p>
                            <div className="map-container-wrapper static-map">
                                <MapContainer center={complaint.location} zoom={15} scrollWheelZoom={false} dragging={false} zoomControl={false} doubleClickZoom={false} className="leaflet-map">
                                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={displayComplaint.location}></Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}

                    {/* Resolve Form */}
                    {showResolveForm && (
                        <div className="detail-section" style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid rgba(5,150,105,0.2)' }}>
                            <h4 style={{ color: '#059669' }}>Resolution Details</h4>
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Admin Note (optional)</label>
                                <textarea className="complaint-input" rows="3" value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} placeholder="Add a note about the resolution..." />
                            </div>
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <label>Completion Notice / Proof *</label>
                                <div className="media-upload-area" style={{ padding: '20px' }}>
                                    <input type="file" id="resolve-media" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    <label htmlFor="resolve-media" className="upload-btn">Upload Image</label>
                                    <p className="upload-hint">Attach proof of completion (e.g. photo of fixed issue)</p>
                                </div>
                            </div>
                            {resolveImagePreview && (
                                <div style={{ marginBottom: '12px' }}>
                                    <img src={resolveImagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                            )}
                            <button className="btn-submit" onClick={handleResolve} disabled={isSubmitting} style={{ width: '100%', background: '#059669' }}>
                                {isSubmitting ? 'Submitting...' : 'Confirm Resolution'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {currentStatus === 'Pending' && !viewingSubC && (
                            <button type="button" className="btn-submit" style={{ background: '#2563eb' }} onClick={handleMarkInProgress} disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : '⏳ Mark In Progress'}
                            </button>
                        )}
                        {(currentStatus === 'Pending' || currentStatus === 'In Progress') && !viewingSubC && !showResolveForm && (
                            <button type="button" className="btn-submit" style={{ background: '#059669' }} onClick={() => setShowResolveForm(true)}>
                                ✅ Mark Resolved
                            </button>
                        )}
                        {canEscalate && (
                            <button type="button" className="btn-submit" style={{ background: '#d97706' }} onClick={() => { onEscalate(complaint.id); onClose(); }}>
                                ⬆ Pass to Higher
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminComplaintDetailModal;
