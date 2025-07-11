import React from 'react';
import { FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const InputSearch = ({ size, value, className, data, setFilteredData }) => {
    const handleSearch = (searchTerm) => {
        const filtered = data.filter((item) =>
            Object.values(item).some((value) =>
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        
        setFilteredData(filtered);
        
        if (filtered.length === 0 && searchTerm !== '') {
            toast.error('No se encontraron facturas con ese término de búsqueda');
        }
    };

    return (
        <label className={`flex items-center space-x-2 p-2 border border-gray-300 rounded-md  bg-white w-[${size}]`}>
            <FaSearch className="text-gray-500" />
            <input
                type="text"
                id="search-input"
                className=" outline-none"
                placeholder="Escribe tu búsqueda..."
                onChange={(e) => handleSearch(e.target.value)}
            />
        </label>
    );
};

export default InputSearch;
