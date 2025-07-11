import React from 'react';
import { IoClose } from 'react-icons/io5';

const Offcanvas = ({ title, open, onClose, origin = 'right', className, children, size = 'md'}) => {

    const sizeClasses = {
        left: {
            sm: 'w-64',
            md: 'w-96',
            lg: 'w-128',
            xl: 'w-[25%]',
            xxl: 'w-[90%]'
        },
        right: {
            sm: 'w-64',
            md: 'w-96',
            lg: 'w-128',
            xl: 'w-[25%]',
            xxl: 'w-[90%]'
        },
        top: {
            sm: 'h-1/3',
            md: 'h-1/2',
            lg: 'h-2/3',
            xl: 'h-3/4',
            xxl: 'h-[90%]'
        },
        bottom: {
            sm: 'h-1/3',
            md: 'h-1/2',
            lg: 'h-2/3',
            xl: 'h-3/4',
            xxl: 'h-[90%]'
        }
    };

    const positionClasses = {
        left: `absolute left-0 bg-white top-0 bottom-0 p-10 transition-transform duration-300  ${open ? 'translate-x-0' : '-translate-x-full'} ${sizeClasses.left[size]}`,
        right: `absolute right-0 bg-white top-0 bottom-0 p-10 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} ${sizeClasses.right[size]}`,
        top: `absolute right-0 bg-white top-0 left-0 p-10 transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-full'} ${sizeClasses.top[size]}`,
        bottom: `absolute right-0 bg-white bottom-0 left-0 p-10 transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'} ${sizeClasses.bottom[size]}`
    };

    const translateClass = positionClasses[origin];

    return (
        <div
            onClick={onClose}
            className={`fixed ${(origin == "right" || origin == "left") ? "z-50" : "z-40"} top-0 right-0 left-0 bottom-0 bg-black bg-opacity-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={translateClass + ` ${className}`}
            >
                <button className='absolute right-3 top-5' onClick={onClose}>
                    <IoClose />
                </button>
                <div className='flex gap-5 flex-col p-10'>
                    {title &&
                        <h1 className='text-xl font-semibold'>{title}</h1>
                    }
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Offcanvas;
