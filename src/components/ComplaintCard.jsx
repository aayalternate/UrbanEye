import React from 'react';
import './ComplaintCard.css';

const ComplaintCard = ({ complaint, onClick, isAdminView, isMini }) => {
    const isCluster = complaint.isCluster;
    const cardClass = `complaint-card ${isCluster ? 'cluster-card' : ''} ${isMini ? 'mini-card' : ''}`;

    return (
        <div className={cardClass} onClick={onClick}>
            <div className="complaint-card-header">
                <div className="card-badges" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {!isAdminView && complaint.department && (
                        <span className="department-badge">{complaint.department}</span>
                    )}
                    {isAdminView && (
                        <span className={`source-badge ${complaint.passedFrom ? 'passed' : 'direct'}`}>
                            {complaint.passedFrom ? `Passed from ${complaint.passedFrom}` : 'Direct Complaint'}
                        </span>
                    )}
                    {isCluster && (
                        <span className="cluster-badge">
                            📁 {complaint.subComplaints?.length} Combined
                        </span>
                    )}
                </div>
                {complaint.location && (
                    <a
                        href={`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location-pin"
                        title="View on Google Maps"
                        onClick={(e) => e.stopPropagation()}
                    >
                        📍
                    </a>
                )}
            </div>
            {complaint.heading && (
                <h3 className="complaint-heading">{complaint.heading}</h3>
            )}
            <hr className="complaint-divider" />
            <div className="complaint-content-wrapper">
                {complaint.text && (
                    <p className="complaint-text">{complaint.text}</p>
                )}
                {/* Display a small thumbnail of the first media item if it exists */}
                {complaint.media && complaint.media.length > 0 && (
                    <div className="card-media-thumbnail">
                        <img src={complaint.media[0].preview} alt="Evidence thumbnail" />
                        {complaint.media.length > 1 && (
                            <div className="media-count-overlay">+{complaint.media.length - 1}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintCard;
