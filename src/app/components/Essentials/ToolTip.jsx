"use client";
import React from 'react';
import PropTypes from 'prop-types';

const ToolTip = ({ icon, tip, visible, position, arrowSize = 6, className = '', bg = '#27283a', color="white", opacity='0.2' }) => {
    return (
        <div
            className={`fixed z-10 ${visible ? 'block' : 'hidden'} ${className}`}
            style={{ top: position.y - 30, left: position.x - 50, opacity: opacity }}
            role="tooltip"
            aria-hidden={!visible}
        >
            <div
                className="flex gap-2 justify-center items-center rounded p-2 text-xs font-semibold shadow-lg"
                style={{ backgroundColor: bg, color: color }}
            >
                {icon && <span>{icon}</span>}
                <span>{tip}</span>
            </div>
            <div
                className="absolute left-5"
                style={{
                    bottom: `-${arrowSize}px`,
                    width: 0,
                    height: 0,
                    borderLeft: `${arrowSize}px solid transparent`,
                    borderRight: `${arrowSize}px solid transparent`,
                    borderTop: `${arrowSize}px solid ${bg}`,
                }}
            />
        </div>
    );
};

ToolTip.propTypes = {
    icon: PropTypes.node,
    tip: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    arrowSize: PropTypes.number,
    className: PropTypes.string,
};

export default ToolTip;
