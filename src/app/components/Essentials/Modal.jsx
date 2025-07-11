import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({
    title = "Modal title",
    message = "modal description",
    body,
    onClose,
    className = "",
    classNameTitle = "",
    classNameMessage = "",
    size = "md",
}) {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleModalClick = (event) => {
        event.stopPropagation();
    };

    const getSizeClasses = () => {
        switch (size) {
            case "xl":
                return className ? className : 'w-[80%] h-[90%]';
            case "md":
                return className ? className : 'w-[40%]';
            case "sm":
                return className ? className : 'w-[20%]';
            default:
                return className ? className : 'w-[40%]';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={`bg-white rounded-lg shadow-xl p-5 pt-10 ${getSizeClasses()} pb-10 text-center`}
                        onClick={handleModalClick}
                        initial={{ 
                            scale: 0.8, 
                            opacity: 0, 
                            y: 50 
                        }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            y: 0 
                        }}
                        exit={{ 
                            scale: 0.8, 
                            opacity: 0, 
                            y: 50 
                        }}
                        transition={{ 
                            type: "spring", 
                            damping: 25, 
                            stiffness: 300,
                            duration: 0.4
                        }}
                    >
                        <motion.button 
                            onClick={onClose} 
                            className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <IoClose />
                        </motion.button>
                        
                        <motion.h2 
                            className={`text-2xl font-semibold ${classNameTitle ? classNameTitle : 'mb-2'}`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {title}
                        </motion.h2>
                        
                        <motion.p 
                            className={`text-sm text-gray-600 ${classNameMessage ? '' : 'mt-6'}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {message}
                        </motion.p>
                        
                        <motion.div 
                            className="flex justify-center space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {body}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
