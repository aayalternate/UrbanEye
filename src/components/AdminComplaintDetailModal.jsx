import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ComplaintDetailModal.css';
import ComplaintCard from './ComplaintCard';

const AdminComplaintDetailModal = ({ complaint, onClose, onEscalate }) => {
    const [viewingSubC, setViewingSubC] = useState(null);

    // Reset sub-view if main complaint changes
    useEffect(() => {
        setViewingSubC(null);
    }, [complaint]);

    if (!complaint) return null;

    const displayComplaint = viewingSubC || complaint;

    const canEscalate = displayComplaint.level !== 'State' && !viewingSubC; // Disable escalate on sub-view just to be safe

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {viewingSubC && (
                            <button 
                                onClick={() => setViewingSubC(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' }}
                            >
                                ←
                            </button>
                        )}
                        <h2>{viewingSubC ? 'Sub-Complaint Details' : 'Complaint Details'}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="detail-scroll-area">
                    <div className="detail-header-section">
                        <span className="department-badge large" style={{ backgroundColor: 'var(--purple-accent)', color: 'white' }}>
                            {displayComplaint.level} Level
                        </span>
                        <span className="department-badge large" style={{ marginLeft: '10px', backgroundColor: displayComplaint.passedFrom ? '#e67e22' : '#2ecc71', color: 'white' }}>
                            {displayComplaint.passedFrom ? `Passed from ${displayComplaint.passedFrom}` : 'Direct Complaint'}
                        </span>
                        {displayComplaint.priority === 'High' && (
                            <span className="department-badge large" style={{ marginLeft: '10px', backgroundColor: '#e74c3c', color: 'white' }}>
                                🔴 High Priority
                            </span>
                        )}
                        <h3 className="detail-heading">{displayComplaint.heading}</h3>
                    </div>
                    
                    {displayComplaint.priorityReason && (
                        <div className="detail-section" style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ffc107', marginTop: '10px' }}>
                            <h4 style={{ color: '#856404', margin: '0 0 4px 0', fontSize: '14px' }}>Priority Alert</h4>
                            <p className="detail-text" style={{ color: '#856404', margin: 0 }}>{displayComplaint.priorityReason}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h4>Context</h4>
                        {displayComplaint.isCluster ? (
                            <div className="sub-complaints-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '10px' }}>
                                {displayComplaint.subComplaints.map(subC => (
                                    <ComplaintCard 
                                        key={subC.id} 
                                        complaint={subC} 
                                        isAdminView={true} 
                                        isMini={true}
                                        onClick={() => setViewingSubC(subC)} 
                                    />
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
                                <a
                                    href={`https://www.google.com/maps?q=${displayComplaint.location.lat},${displayComplaint.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '13px', color: 'var(--purple-accent)', textDecoration: 'none', fontWeight: 500 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Open in Google Maps ↗
                                </a>
                            </div>
                            <p className="detail-text" style={{ marginBottom: '12px', fontSize: '13px' }}>
                                Coordinates: {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
                            </p>
                            <div className="map-container-wrapper static-map">
                                <MapContainer
                                    center={complaint.location}
                                    zoom={15}
                                    scrollWheelZoom={false}
                                    dragging={false}
                                    zoomControl={false}
                                    doubleClickZoom={false}
                                    className="leaflet-map"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={displayComplaint.location}></Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
                    {canEscalate && (
                        <button
                            type="button"
                            className="btn-submit"
                            style={{ backgroundColor: '#e67e22' }}
                            onClick={() => {
                                onEscalate(complaint.id);
                                onClose();
                            }}
                        >
                            Pass to Higher Authorities
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminComplaintDetailModal;
