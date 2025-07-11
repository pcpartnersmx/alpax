import { useEffect, useState } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoClose } from "react-icons/io5";

export default function ModalSuccess({
    title = "Modal title",
    message = "modal description",
    body,
    onClose
}) {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        setTimeout(() => {
            onClose()
        }, 1500);
    }, []);

    const handleModalClick = (event) => {
        event.stopPropagation();
    };
    

    return (
        <div
            className="fixed !z-[60] top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-lg shadow-xl p-5 pt-10 pb-10 w-[30%] text-center transition-transform transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-36 opacity-0'}`}
                onClick={handleModalClick}
            >
                <button onClick={onClose} className="absolute top-2 right-2 z-10 text-gray-400">
                    <IoClose />
                </button>
                <div className="flex justify-center items-center">
                    <IoIosCheckmarkCircleOutline size={50} color="green" />
                </div>

                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="mb-6 text-sm text-gray-600">{message}</p>
                <div className="flex justify-center space-x-4">
                    {body}
                </div>
            </div>
        </div>
    );
}
