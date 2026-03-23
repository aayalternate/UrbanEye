import React from 'react';
import './Fab.css';

const Fab = ({ onClick, extended, text }) => {
    return (
        <button className={`fab ${extended ? 'fab-extended' : ''}`} onClick={onClick}>
            <span className="fab-icon">+</span>
            {text && <span className="fab-text">{text}</span>}
        </button>
    );
};

export default Fab;
