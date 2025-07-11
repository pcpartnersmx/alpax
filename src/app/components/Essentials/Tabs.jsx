import React, { useState, useEffect } from 'react';
import { FaBus, FaFilePdf, FaPlus } from 'react-icons/fa';
import { MdOutlineLocalShipping } from 'react-icons/md';
import { DatePickerRangeMonth } from '../ui/date-picker-range-month';

const Tabs = ({ tabs, onTabChange, options, className, position}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [open, setOpen] = useState(true);

    const handleTab = (index) => {
        if (activeTab !== index) {
            setOpen(false); // Cierra el contenido actual
            setTimeout(() => {
                setActiveTab(index); // Cambia el tab después de que se cierre
                setOpen(true); // Abre el nuevo contenido
                if (onTabChange) {
                    onTabChange(index); // Llama a la función externa con el índice del tab activo
                }
            }, 300); // Duración de la animación
        }
    };

    useEffect(() => {
        if (onTabChange) {
            onTabChange(activeTab); // Llamamos a la función cuando se carga el componente para pasar el tab inicial
        }
    }, [activeTab, onTabChange]);

    return (
        <div
        // className="border rounded-lg bg-white"
        >
            {options &&
                <div className='flex gap-2 justify-end -mb-11 mr-5'>
                    {options}
                </div>
            }
            <ul className="flex gap-10 pl-5 ">
                <div className='flex justify-between w-full'>
                    <div className={`flex gap-2 w-full ${position === 'center' ? 'justify-center' : 'justify-start'}`}>
                        {tabs.map((tab, index) => (
                            <li key={index} className="text-center ">
                                <button
                                    className={`flex p-5 items-center text-xl font-semibold justify-center w-full py-2 gap-2 transition-all ${activeTab === index
                                        ? 'border-b-2 border-teal-600 text-teal-700'
                                        : 'text-gray-600 hover:text-teal-600 '
                                        }`}
                                    onClick={() => handleTab(index)}
                                >
                                    {tab.icon}
                                    {tab.title}
                                </button>
                            </li>
                        ))}
                    </div>



                    <div className={`flex items-center gap-2`}>

                        {tabs[activeTab].settings}

                    </div>
                </div>
            </ul>

            <div className={`pt-2 p-4 ${className}`}>
                <div className={`mt-2 text-gray-700 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
                    <div
                    // className={`transform transition-transform duration-300 ${open ? 'translate-y-0' : '-translate-y-4'}`}
                    >
                        {tabs[activeTab].body}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tabs;
