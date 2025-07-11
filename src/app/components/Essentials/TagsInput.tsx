import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface TagsInputProps {
    label?: string;
    placeholder?: string;
    value: string[];
    onChange: (tags: string[]) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    disabled?: boolean;
    className?: string;
    maxTags?: number;
}

const TagsInput: React.FC<TagsInputProps> = ({ 
    label = "Tags", 
    placeholder = "Agregar tag...", 
    value = [], 
    onChange, 
    onFocus,
    onBlur,
    disabled = false,
    className = "",
    maxTags = 10 
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !value.includes(trimmedValue) && value.length < maxTags) {
            const newTags = [...value, trimmedValue];
            onChange(newTags);
            setInputValue('');
        }
    };

    const removeTag = (index: number) => {
        const newTags = value.filter((_, i) => i !== index);
        onChange(newTags);
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag();
        }
        if (onBlur) {
            onBlur();
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="min-h-[48px] border border-gray-300 rounded-lg p-2 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <div className="flex flex-wrap gap-2 items-center">
                    {value.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                        >
                            {tag}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    disabled={disabled}
                                >
                                    <FaTimes size={12} />
                                </button>
                            )}
                        </span>
                    ))}
                    {value.length < maxTags && !disabled && (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            onFocus={onFocus}
                            placeholder={value.length === 0 ? placeholder : ""}
                            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                            disabled={disabled}
                        />
                    )}
                </div>
                {value.length >= maxTags && (
                    <div className="text-xs text-gray-500 mt-1">
                        Máximo {maxTags} tags permitidos
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagsInput; 