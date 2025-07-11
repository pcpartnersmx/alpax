"use client"
import React from 'react'
import { useRouter } from "next/navigation";
import { IoArrowBack } from 'react-icons/io5'; // Importamos el icono
import { usePathname } from 'next/navigation'; // Importa usePathname

const Navigation = () => {
    const router = useRouter();
    const pathname = usePathname(); 

    if (pathname === '/pickings' || pathname === '/' || pathname === '/dashboard' || pathname === '/dashboard/supervisor' || pathname === '/dashboard/supervisor/repartidores' || pathname === '/dashboard/supervisor/usuarios') {
        return null;
    }

    return (
        <div className='mt-24'>
            <button className='hover:text-gray-500 transition-all' onClick={() => router.push('/')}>
                <IoArrowBack size={24} />
            </button>
        </div>
    )
}

export default Navigation
