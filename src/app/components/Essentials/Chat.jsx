import React, { useState } from 'react';
import { CiImageOn, CiSearch } from 'react-icons/ci';
import { FaSearch } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { LuSend } from 'react-icons/lu';
import { PiChecksLight, PiPaperclipHorizontal } from "react-icons/pi";

const Chat = ({ avatar }) => {
    const [currentChat, setCurrentChat] = useState(null);
    const chats = [
        { id: 1, name: 'Luis', email: 'luis@example.com', avatar: 'https://demos.themeselection.com/sneat-bootstrap-html-admin-template/assets/img/avatars/4.png' },
        { id: 2, name: 'Usuario 1', email: 'usuario1@example.com', avatar: 'https://demos.themeselection.com/sneat-bootstrap-html-admin-template/assets/img/avatars/4.png' },
        { id: 3, name: 'Usuario 2', email: 'usuario2@example.com', avatar: 'https://demos.themeselection.com/sneat-bootstrap-html-admin-template/assets/img/avatars/4.png' },
        { id: 4, name: 'Usuario 3', email: 'usuario3@example.com', avatar: 'https://demos.themeselection.com/sneat-bootstrap-html-admin-template/assets/img/avatars/4.png' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* User List */}
            <div className="w-1/3 bg-white border-r border-gray-300 shadow-lg">
                <div className="flex items-center gap-4 mb-4 border-b p-4 pb-4">
                    <div className='relative'>
                        <div className="w-12 h-12 overflow-hidden rounded-full shadow-md">
                            <img
                                className="w-full h-full object-cover"
                                src={avatar}
                                alt="User"
                            />
                        </div>
                        <div className='rounded-full bg-green-500 h-3 w-3 absolute bottom-0 right-0 border border-white' />
                    </div>
                    <div className="flex items-center p-1 pl-5 border border-gray-300 rounded-full shadow-sm bg-gray-100 w-full transition duration-200 hover:bg-gray-200">
                        <FaSearch className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            className="flex-grow outline-none p-1 rounded-full bg-transparent"
                            placeholder="Buscar usuario..."
                        />
                    </div>
                </div>
                <div className='p-4'>
                    <h2 className="font-semibold text-lg mb-2">Chats</h2>
                    <ul className="bg-white ">
                        {chats.map((user) => (
                            <li
                                key={user.id}
                                onClick={() => setCurrentChat(user)}
                                className={`p-4  cursor-pointer border-b last:border-b-0 ${currentChat?.id === user.id ? 'bg-[#696cff] text-white rounded-lg' : 'hover:bg-gray-100'}`}
                            >
                                <div className='flex items-center gap-3'>
                                    <img className='h-10 w-10 rounded-full' src={user.avatar} alt={`${user.name} avatar`} />
                                    <div className='flex flex-col relative w-full'>
                                        <span className='font-semibold text-lg '>{user.name}</span>
                                        <span className='absolute top-0 right-0 text-xs font-medium'>5 Minutos</span>
                                        <span className=''>{user.email}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-gray-200">
                {/* Chat Header */}
                {currentChat ? (
                    <div className="flex justify-between items-center bg-white p-4 border-b shadow">
                        <div className="flex items-center">
                            <img
                                className="rounded-full w-10 h-10 mr-3"
                                src={currentChat.avatar}
                                alt={currentChat.name}
                            />
                            <div className="flex flex-col">
                                <h2 className="font-semibold text-lg">{currentChat.name}</h2>
                                <p className="text-gray-600">{currentChat.email}</p>
                            </div>
                        </div>
                        <div>
                            <ul className="flex gap-2">
                                <li>
                                    <button className="p-2 hover:bg-gray-200 rounded transition duration-200">
                                        <CiSearch className="text-xl" />
                                    </button>
                                </li>
                                <li>
                                    <button className="p-2 hover:bg-gray-200 rounded transition duration-200">
                                        <HiDotsVertical className="text-xl" />
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full bg-gray-300">
                        <p className="text-gray-600">Selecciona un chat para empezar a chatear</p>
                    </div>
                )}

                {currentChat && (
                    <div className='flex flex-col bg-gray-100 h-full p-4'>
                        <div className="flex-grow overflow-y-auto p-4">
                            <div className="mb-4 flex gap-2 justify-start ">
                                <img className="rounded-full w-10 h-10" src={currentChat.avatar} alt="User" />
                                <div className='relative'>
                                    <span className='bg-white shadow-md rounded p-2'>Hola! ¿Cómo estás?</span>
                                    <span className='text-xs text-gray-400 absolute left-0 -bottom-3'>10:15 AM</span>
                                </div>

                            </div>
                            <div className="mb-4 flex gap-2 justify-end">
                                <div className='relative'>
                                    <span className='bg-blue-500 text-white shadow-md rounded p-2'>Hola! ¿Cómo estás?</span>
                                    <div className='text-xs text-gray-400 absolute right-0 -bottom-3 flex gap-2 items-center'>
                                        <PiChecksLight
                                            // color='blue'
                                        />
                                        10:15 AM
                                    </div>
                                </div>

                                <img className="rounded-full w-10 h-10" src={avatar} alt="User" />
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className='flex justify-center w-full p-2'>
                            <div className='p-2 bg-white w-full flex justify-between rounded-lg shadow'>
                                <input
                                    type="text"
                                    className='w-full outline-none p-2 transition-all peer placeholder:transition-all focus:placeholder:pl-2'
                                    placeholder='Escribe un mensaje...'
                                />
                                <div className='flex gap-5 items-center'>
                                    <label className='cursor-pointer'>
                                        <input className='hidden' type="file" />
                                        <CiImageOn size={20} />
                                    </label>
                                    <label className='cursor-pointer'>
                                        <input className='hidden' type="file" />
                                        <PiPaperclipHorizontal size={20} />
                                    </label>
                                    <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition flex gap-2 items-center">
                                        Enviar
                                        <LuSend />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;