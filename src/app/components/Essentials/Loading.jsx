import React from 'react'
import { CgSpinner } from 'react-icons/cg'

const Loading = ({ message, loading }) => {
    if (loading) {
        return (
            <div className='fixed !z-[60] top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-[#0000005d] text-white flex-col gap-2'>
                <CgSpinner size={50} className='animate-spin' />
                <span className='animate-pulse'>{message}</span>
            </div>
        )
    }
    return null;
}

export default Loading