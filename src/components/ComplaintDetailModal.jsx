import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ComplaintDetailModal.css';

const ComplaintDetailModal = ({ complaint, onClose }) => {
    if (!complaint) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Complaint Details</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="detail-scroll-area">
                    <div className="detail-header-section">
                        {complaint.department && (
                            <span className="department-badge large">{complaint.department}</span>
                        )}
                        <h3 className="detail-heading">{complaint.heading}</h3>
                    </div>

                    <div className="detail-section">
                        <h4>Context</h4>
                        <p className="detail-text">{complaint.text}</p>
                    </div>

                    {complaint.media && complaint.media.length > 0 && (
                        <div className="detail-section">
                            <h4>Attached Evidence</h4>
                            <div className="detail-media-grid">
                                {complaint.media.map((m, idx) => (
                                    <div key={idx} className="detail-media-item">
                                        <img src={m.preview} alt={`Evidence ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {complaint.location && (
                        <div className="detail-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h4>Location</h4>
                                <a
                                    href={`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`}
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
                                    <Marker position={complaint.location}></Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
                    {/* Could add actionable buttons here later, e.g. "Mark Resolved" */}
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetailModal;
