import React, { useState } from 'react';
import Header from '../components/Header';
import ComplaintGrid from '../components/ComplaintGrid';
import Fab from '../components/Fab';
import ComplaintModal from '../components/ComplaintModal';
import ComplaintDetailModal from '../components/ComplaintDetailModal';

function UserDashboard({ complaints, onAddComplaint, activeTab, onTabChange, onLogout }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const handleFabClick = () => {
        setIsModalOpen(true);
    };

    const handleComplaintClick = (complaint) => {
        setSelectedComplaint(complaint);
    };

    return (
        <>
            <Header activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />

            <main className="main-content">
                {activeTab === 'complaints' ? (
                    complaints.length > 0 ? (
                        <>
                            <ComplaintGrid complaints={complaints} onComplaintClick={handleComplaintClick} />
                            <div className="fab-container">
                                <Fab onClick={handleFabClick} />
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-text">There are no issued complaints at this moment</p>
                            <Fab onClick={handleFabClick} extended text="Give a Complaint" />
                        </div>
                    )
                ) : (
                    <div className="empty-state">
                        <p className="empty-text" style={{ color: 'var(--text-muted)' }}>
                            Notifications are empty.
                        </p>
                    </div>
                )}

                <ComplaintModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={onAddComplaint}
                />

                <ComplaintDetailModal
                    complaint={selectedComplaint}
                    onClose={() => setSelectedComplaint(null)}
                />
            </main>
        </>
    );
}

export default UserDashboard;
