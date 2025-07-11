import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiEye, HiEyeOff, HiSearch } from 'react-icons/hi'; // Importamos los iconos de ojo y búsqueda
import { FiClipboard } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Input({
    label = "input",
    type = "text",
    placeholder = "",
    className = "",
    onChange,
    error = "",
    name = "",
    required = false,
    defaultValue = "",
    autoFocus = false,
    id = "",
    min = "",
    max = "",
    onBlur,
    disabled = false,
    copyable = false
}) {
    const [value, setValue] = useState(defaultValue);
    const [showPassword, setShowPassword] = useState(false); // Nuevo estado para controlar la visibilidad de la contraseña
    const [displayValue, setDisplayValue] = useState(defaultValue);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setValue(defaultValue);
        if (type === "price") {
            setDisplayValue(formatPrice(defaultValue));
        } else {
            setDisplayValue(defaultValue);
        }
    }, [defaultValue, type]);

    const formatPrice = (value) => {
        if (!value) return '';
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return '';
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericValue);
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        
        if (type === "price") {
            const numericValue = parseFloat(newValue.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(numericValue)) {
                setValue(numericValue);
                setDisplayValue(formatPrice(numericValue));
                if (onChange) {
                    onChange(numericValue);
                }
            } else if (newValue === '') {
                setValue('');
                setDisplayValue('');
                if (onChange) {
                    onChange('');
                }
            }
        } else {
            setValue(newValue);
            if (onChange) {
                onChange(newValue);
            }
        }
    };

    const handleBlur = (e) => {
        if (onBlur) {
            onBlur(e);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState); // Cambia entre mostrar y ocultar la contraseña
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success('Texto copiado al portapapeles', {
            duration: 2000,
            position: 'top-right',
            style: {
                background: '#3b82f6',
                color: '#fff',
            },
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const renderInput = (inputProps) => {
        if (copyable) {
            const inputElement = <input {...inputProps} />;
            if (disabled) {
                return (
                    <div 
                        className="relative flex items-center cursor-pointer"
                        onClick={handleCopy}
                        title="Copiar al portapapeles"
                    >
                        <div className="w-full pointer-events-none">
                            {inputElement}
                        </div>
                        <div className="absolute right-3 text-gray-400">
                            <FiClipboard className={copied ? "text-blue-500" : ""} />
                        </div>
                    </div>
                );
            }
            return (
                <div className="relative flex items-center">
                    {inputElement}
                    <button
                        onClick={handleCopy}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        title={copied ? "Copiado!" : "Copiar al portapapeles"}
                    >
                        <FiClipboard className={copied ? "text-blue-500" : ""} />
                    </button>
                </div>
            );
        }
        return <input {...inputProps} />;
    };

    return (
        <div className={` ${className}`}>
            {type === "password" ? (
                <>
                    <label>
                        {label} {required && <span className="text-red-500">*</span>}
                        <div className={` ${error && 'border-red-500 text-red-500 border'} flex gap-2 justify-between items-center h-12 input-field shadow appearance-none  rounded w-full py-2 px-3 text-gray-700 leading-tight`}>
                            {renderInput({
                                name,
                                type: showPassword ? "text" : "password",
                                placeholder,
                                onChange: handleChange,
                                onBlur: handleBlur,
                                required,
                                autoFocus,
                                className: `focus:outline-none focus:shadow-outline ${disabled ? 'bg-gray-100 text-gray-500' : ''}`,
                                id,
                                disabled
                            })}
                            {showPassword ? (
                                <HiEyeOff className='cursor-pointer' onClick={togglePasswordVisibility} />
                            ) : (
                                <HiEye className='cursor-pointer' onClick={togglePasswordVisibility} />
                            )}
                        </div>
                    </label>
                    {error && <span className="text-xs mt-1 text-red-500">{error}</span>}
                </>
            ) : type === "search" ? (
                <>
                    <label className="input-label">{label} {required && <span className="text-red-500">*</span>}</label>
                    <div className={`relative flex items-center`}>
                        <HiSearch className="absolute left-3 text-[#282b7e]" />
                        {renderInput({
                            name,
                            type,
                            placeholder,
                            onChange: handleChange,
                            onBlur: handleBlur,
                            required,
                            autoFocus,
                            id,
                            className: `h-12 input-field pl-10 ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 text-gray-500' : ''} shadow appearance-none border rounded w-full py-2 px-3 text-[#282b7e] leading-tight focus:outline-none focus:shadow-outline`,
                            min,
                            max,
                            disabled
                        })}
                    </div>
                    {error && <span className="text-xs mt-1 text-red-500">{error}</span>}
                </>
            ) : type === "price" ? (
                <>
                    <label className="input-label">{label} {required && <span className="text-red-500">*</span>}</label>
                    <div className={`relative flex items-center`}>
                        <span className="absolute left-3 text-gray-400">$</span>
                        {renderInput({
                            name,
                            type: "number",
                            defaultValue: value,
                            placeholder,
                            onChange: handleChange,
                            onBlur: handleBlur,
                            required,
                            autoFocus,
                            id,
                            className: `h-12 input-field pl-8 ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 text-gray-500' : ''} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`,
                            min,
                            max,
                            disabled,
                            step: "0.10"
                        })}
                    </div>
                    {error && <span className="text-xs mt-1 text-red-500">{error}</span>}
                </>
            ) : (
                <>
                    <label className="input-label">{label} {required && <span className="text-red-500">*</span>}</label>
                    {renderInput({
                        name,
                        type,
                        defaultValue: value,
                        placeholder,
                        onChange: handleChange,
                        onBlur: handleBlur,
                        required,
                        autoFocus,
                        id,
                        className: `h-12 input-field ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 text-gray-500' : ''} shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`,
                        min,
                        max,
                        disabled
                    })}
                    {error && <span className="text-xs mt-1 text-red-500">{error}</span>}
                </>
            )}
        </div>
    );
}

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    error: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    defaultValue: PropTypes.string,
    disabled: PropTypes.bool,
    copyable: PropTypes.bool
};

Input.defaultProps = {
    label: "input",
    type: "text",
    placeholder: "",
    className: "",
    onChange: null,
    onBlur: null,
    error: "",
    name: "",
    required: false,
    defaultValue: "",
    disabled: false,
    copyable: false
};
