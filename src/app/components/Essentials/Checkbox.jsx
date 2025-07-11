import { useState } from "react";
import { FaCheck } from "react-icons/fa";

export default function Checkbox({ label, disabled, onChange, checked }) {
    const handleChange = (e) => {
        onChange(e.target.checked);
    };

    return (
        <label className="flex items-center cursor-pointer">
            <div
                onClick={handleChange}
                className={`flex items-center justify-center rounded border-2 transition-colors duration-300 
                    ${checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400'} 
                    h-4 w-4 mr-2`}
            >
                {checked && <FaCheck color="white" />}
            </div>
            <span className={`transition-colors duration-300 ${checked ? 'text-blue-500' : 'text-gray-800'}`}>
                {label}
            </span>
            <input
                onChange={handleChange}
                type="checkbox"
                checked={checked}
                className="hidden"
                disabled={disabled}
            />
        </label>
    );
}
