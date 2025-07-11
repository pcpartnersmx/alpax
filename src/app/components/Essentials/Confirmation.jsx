import { useEffect, useState } from 'react';
import { FiAlertTriangle } from "react-icons/fi";

export default function Confirmation({
    title = "Confirmación",
    message = "¿Está seguro de realizar esta acción?",
    onConfirm,
    onCancel,
    type = "danger",
    confirmButtonText = "Confirmar",
    cancelButtonText = "Cancelar",
    Icon = FiAlertTriangle
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleModalClick = (event) => {
        event.stopPropagation();
    };

    const typeColors = {
        danger: { bg: "bg-red-100", text: "text-red-600", button: "bg-red-600 hover:bg-red-700" },
        success: { bg: "bg-green-100", text: "text-green-600", button: "bg-green-600 hover:bg-green-700" },
        warning: { bg: "bg-yellow-100", text: "text-yellow-600", button: "bg-yellow-600 hover:bg-yellow-700" },
        info: { bg: "bg-blue-100", text: "text-blue-600", button: "bg-blue-600 hover:bg-blue-700" }
    };

    const colors = typeColors[type] || typeColors.danger;

    return (
        <div className="fixed z-[80] top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onCancel}>
            <div onClick={handleModalClick} className={`bg-white rounded-lg shadow-xl p-10 w-[30%] text-center transition-transform transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-36 opacity-0'}`}>
                <div className={`${colors.bg} ${colors.text} flex justify-center items-center p-3 rounded-full w-12 h-12 mb-4 mx-auto`}>
                    <Icon className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="mb-6 text-sm text-gray-600">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        className={`${colors.button} text-white py-2 px-6 rounded-lg shadow hover:opacity-90 transition duration-200`}
                        onClick={onConfirm}
                    >
                        {confirmButtonText}
                    </button>
                    <button
                        className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-200"
                        onClick={onCancel}
                    >
                        {cancelButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
