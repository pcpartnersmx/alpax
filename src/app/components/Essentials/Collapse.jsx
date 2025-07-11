"use client"
import React, { useEffect, useState, useRef } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const Collapse = ({ titleOpen, titleClose, body, height }) => {
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => {
                setHidden(true);
            }, 300); // Tiempo para ocultar
            return () => clearTimeout(timer);
        } else {
            setHidden(false);
        }
    }, [open]);

    const handleToggle = () => {
        setOpen(prev => !prev);
    };

    return (
        <>
            <button
                onClick={handleToggle}
                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors"
            >
                {open ? (
                    <>
                        <FaChevronUp className="w-3 h-3" />
                        {titleOpen}
                    </>
                ) : (
                    <>
                        <FaChevronDown className="w-3 h-3" />
                        {titleClose}
                    </>
                )}
            </button>
            <div
                ref={contentRef}
                className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? `max-h-[${height}]` : 'max-h-0'} ${hidden ? 'hidden' : ''}`}
            >
                <div className="p-2">
                    {body}
                </div>
            </div>
        </>
    )
}

export default Collapse
