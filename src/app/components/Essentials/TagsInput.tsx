import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

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
    error?: string;
    required?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
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
    maxTags = 10,
    error,
    required = false,
    buttonText = "Crear",
    onButtonClick
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log('Key pressed:', e.key); // Debug log
        
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Enter pressed, calling onButtonClick'); // Debug log
            if (onButtonClick) {
                console.log('✅ onButtonClick function executed!'); // Confirm execution
                onButtonClick();
            } else {
                console.log('❌ onButtonClick function is not provided');
            }
            return;
        }
        
        if (e.key === ',') {
            e.preventDefault();
            console.log('Comma pressed, adding tag:', inputValue);
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !value.includes(trimmedValue) && value.length < maxTags) {
            const newTags = [...value, trimmedValue];
            console.log('✅ Tag added:', trimmedValue, 'New tags array:', newTags);
            onChange(newTags);
            setInputValue('');
        } else {
            console.log('❌ Tag not added. Reason:', {
                trimmedValue,
                alreadyExists: value.includes(trimmedValue),
                atMaxTags: value.length >= maxTags
            });
        }
    };

    const removeTag = (index: number) => {
        const newTags = value.filter((_, i) => i !== index);
        onChange(newTags);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) {
            onBlur();
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) {
            onFocus();
        }
    };

    const handleAddClick = () => {
        addTag();
        inputRef.current?.focus();
    };

    const handleButtonClick = () => {
        if (onButtonClick) {
            onButtonClick();
        }
    };

    // Auto-focus input when component mounts
    useEffect(() => {
        if (!disabled && value.length < maxTags) {
            inputRef.current?.focus();
        }
    }, [disabled, value.length, maxTags]);

    // Handle Enter key globally
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && document.activeElement === inputRef.current) {
                console.log('Global Enter detected');
                if (onButtonClick) {
                    onButtonClick();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [onButtonClick]);

    const isAtMaxTags = value.length >= maxTags;
    const hasError = !!error;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div 
                className={`
                    relative min-h-[48px] border rounded-lg bg-white transition-all duration-200
                    ${isFocused 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : hasError 
                            ? 'border-red-300' 
                            : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
                `}
            >
                <div className="flex flex-wrap gap-2 p-3 min-h-[48px] items-center">
                    {value.map((tag, index) => (
                        <span
                            key={`${tag}-${index}`}
                            className={`
                                inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                                bg-blue-50 text-blue-700 border border-blue-200 transition-all duration-200
                                hover:bg-blue-100 hover:border-blue-300
                                ${disabled ? 'opacity-60' : ''}
                            `}
                        >
                            <span className="max-w-[150px] truncate">{tag}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="ml-1 text-blue-500 hover:text-blue-700 transition-colors p-0.5 rounded-full hover:bg-blue-200"
                                    disabled={disabled}
                                    aria-label={`Eliminar tag ${tag}`}
                                >
                                    <FaTimes size={10} />
                                </button>
                            )}
                        </span>
                    ))}

                    {!isAtMaxTags && !disabled && (
                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                        console.log('Enter pressed via onKeyUp');
                                        if (onButtonClick) {
                                            handleAddClick()
                                        }
                                    }
                                }}
                                onBlur={handleBlur}
                                onFocus={handleFocus}
                                placeholder={value.length === 0 ? placeholder : ""}
                                className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
                                disabled={disabled}
                                aria-label="Agregar nuevo tag"
                            />
                            {inputValue.trim() && (
                                <button
                                    type="button"
                                    onClick={handleAddClick}
                                    className="flex items-center absolute right-2 justify-center w-6 h-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                    disabled={disabled}
                                    aria-label="Agregar tag"
                                >
                                    <FaPlus size={10} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* {onButtonClick && (
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={handleButtonClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        disabled={disabled}
                    >
                        {buttonText}
                    </button>
                </div>
            )} */}
        </div>
    );
};

export default TagsInput; 