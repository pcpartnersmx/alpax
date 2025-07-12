'use client'
import Gleap from 'gleap';
import React, { useEffect } from 'react'

const GleapComponent = () => {
    useEffect(() => {
        Gleap.initialize(process.env.NEXT_PUBLIC_GLEAP_API_KEY || '');
    }, [])

    return null
}

export default GleapComponent