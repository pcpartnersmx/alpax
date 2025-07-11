import React, { useState } from 'react';
import { HiDotsVertical } from "react-icons/hi";

const UserCard = ({ options, onDelete, username, email, body }) => {
    const [optionsOpen, setOptionsOpen] = useState(false);

    return (
        <div className='flex justify-center items-center border rounded-lg shadow-lg p-5 relative flex-col'>
            <button
                onClick={() => setOptionsOpen(!optionsOpen)}
                className='absolute top-5 right-5 rounded-full hover:bg-gray-100 transition-all hover:-translate-y-[1px] p-2 text-gray-500'
            >
                <HiDotsVertical />
            </button>
            {optionsOpen && (
                <div className='absolute bg-white top-12 right-5 rounded shadow-lg w-48'>
                    <ul className='flex justify-center flex-col items-center pt-2 pb-2 border-b-[1px]'>
                        {Object.entries(options).map(([key, action]) => (
                            <li key={key} className='cursor-pointer w-full hover:bg-gray-100 transition-all pl-5 p-2'>
                                <button className='w-full text-start' onClick={() => {
                                    action()
                                    setOptionsOpen(!optionsOpen)
                                }}>{key}</button>
                            </li>
                        ))}
                    </ul>
                    <ul className='flex justify-center flex-col items-center pt-2 pb-2'>
                        <li className='cursor-pointer w-full hover:bg-gray-100 transition-all text-red-500 pl-5 p-2'>
                            <button className='w-full text-start' onClick={() => {
                                onDelete()
                                setOptionsOpen(!optionsOpen)
                            }}>Delete</button>
                        </li>
                    </ul>
                </div>
            )}

            <div className='flex justify-center items-center flex-col gap-2'>
                <img
                    src="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/assets/img/avatars/3.png"
                    className='w-24 rounded-full'
                    alt=""
                />
                <h2 className='font-semibold text-lg'>{username}</h2>
                <p className='text-sm font-medium'>{email}</p>
            </div>
            <div className='mt-2'>
                {body}
            </div>
        </div>
    );
}

export default UserCard;
