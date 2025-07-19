import React, { useState, useEffect } from 'react';

export default function Select({
    options,
    label,
    name,
    id,
    placeholder = "Selecciona una opción",
    onChange,
    value,
    required,
    className,
    disabled,
    defaultValue
}) {
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");

    useEffect(() => {
        setSelectedValue(value || defaultValue || "");
    }, [value, defaultValue]);

    const handleChange = (e) => {
        setSelectedValue(e.target.value);
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="text-start pr-2 rounded-md p-1  border-2 border-[#2a3182]">
            {label && (
                <label
                    htmlFor={id}
                    className="text-start"
                >
                    {label}
                </label>
            )}
            <select
                name={name}
                id={id}
                onChange={handleChange}
                value={selectedValue}
                className='w-full outline-none'
                // className={`w-full px-4 pr-5 py-2 text-base rounded-lg focus:outline-none text-start ${!className ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow border border-gray-200' : className} ${disabled ? ' shadow-md bg-[#f3f4f6] border-gray-300' : ''}`}
                required={required}
                disabled={disabled}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
