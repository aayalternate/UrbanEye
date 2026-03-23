import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ComplaintModal.css';

// Fix for default Leaflet icon not loading in Webpack/Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
};

const ComplaintModal = ({ isOpen, onClose, onSubmit }) => {
    const [step, setStep] = useState(1);

    // Step 1 State
    const [heading, setHeading] = useState('');
    const [text, setText] = useState('');

    // Step 2 State
    const [media, setMedia] = useState([]);

    // Step 3 State
    const [department, setDepartment] = useState('');
    const [location, setLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (heading.trim() && text.trim() && department) {
            onSubmit({ heading, text, media, department, location });
            resetState();
            onClose();
        }
    };

    const resetState = () => {
        setStep(1);
        setHeading('');
        setText('');
        setMedia([]);
        setDepartment('');
        setLocation(null);
        setSearchQuery('');
        setSearchResults([]);
        setMapCenter([28.6139, 77.2090]);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching location:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectLocation = (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setLocation({ lat, lng: lon });
        setMapCenter({ lat, lng: lon });
        setSearchResults([]);
        setSearchQuery(result.display_name);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setMedia(prev => [...prev, ...newFiles]);
        }
    };

    const removeMedia = (index) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    };

    const renderStep1 = () => (
        <div className="step-container">
            <div className="input-group">
                <label htmlFor="complaint-heading">Heading</label>
                <input
                    id="complaint-heading"
                    className="complaint-input"
                    type="text"
                    placeholder="E.g., Broken street light"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="input-group">
                <label htmlFor="complaint-text">Context</label>
                <textarea
                    id="complaint-text"
                    className="complaint-input"
                    placeholder="Provide more details about the issue..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="step-container">
            <div className="media-upload-area">
                <label htmlFor="media-upload" className="upload-btn">
                    <span>+ Add Photos/Videos</span>
                    <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </label>
                <p className="upload-hint">Upload evidence to help us resolve the issue.</p>
            </div>

            {media.length > 0 && (
                <div className="media-preview-grid">
                    {media.map((m, idx) => (
                        <div key={idx} className="media-preview-item">
                            {/* Assuming images for preview simplicity, but could handle video tags too */}
                            <img src={m.preview} alt={`preview-${idx}`} className="media-preview-img" />
                            <button type="button" className="remove-media-btn" onClick={() => removeMedia(idx)}>&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="step-container">
            <div className="input-group">
                <label htmlFor="department-select">Relevant Department</label>
                <select
                    id="department-select"
                    className="complaint-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                >
                    <option value="" disabled>Select a department</option>
                    <option value="Health">Health Department</option>
                    <option value="Roads">Road & Safety</option>
                    <option value="Water">Water & Sanitation</option>
                    <option value="Electricity">Electricity Board</option>
                    <option value="Other">Other Public Departments</option>
                </select>
            </div>
            <div className="input-group">
                <label>Pinpoint Location</label>

                <div className="search-bar-container">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            className="complaint-input search-input"
                            placeholder="Search for a location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                        />
                        <button type="button" className="search-btn" onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? '...' : '🔍'}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <ul className="search-results-dropdown">
                            {searchResults.map((result) => (
                                <li key={result.place_id} onClick={() => handleSelectLocation(result)}>
                                    {result.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="map-container-wrapper">
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="leaflet-map"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={mapCenter} />
                        <LocationPicker position={location} setPosition={setLocation} />
                    </MapContainer>
                </div>
                {location && <p className="location-selected-text">✓ Location pinpointed</p>}
            </div>
        </div>
    );

    const isNextDisabled = () => {
        if (step === 1) return !heading.trim() || !text.trim();
        if (step === 2) return false; // Media is optional
        if (step === 3) return !department; // Location might be optional, but department required
        return false;
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-titles">
                        <h2>New Complaint</h2>
                        <span className="step-indicator">Step {step} of 3</span>
                    </div>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <div className="modal-footer">
                        {step > 1 ? (
                            <button type="button" className="btn-cancel" onClick={handleBack}>Back</button>
                        ) : (
                            <button type="button" className="btn-cancel" onClick={handleClose}>Cancel</button>
                        )}

                        {step < 3 ? (
                            <button type="button" className="btn-submit" onClick={handleNext} disabled={isNextDisabled()}>Next</button>
                        ) : (
                            <button type="submit" className="btn-submit" disabled={isNextDisabled()}>Submit</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComplaintModal;
