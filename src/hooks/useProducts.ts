import { useState } from 'react';

export interface Product {
    id: string;
    name: string;
    code: string;
    area: string;
    areaId: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    quantity: number;
}

export interface GetProductsResponse {
    success: boolean;
    data: Product[];
    count: number;
    error?: string;
}

export const useProducts = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getProducts = async (params?: {
        areaId?: string;
        code?: string;
        name?: string;
    }): Promise<GetProductsResponse> => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();
            if (params?.areaId) searchParams.append('areaId', params.areaId);
            if (params?.code) searchParams.append('code', params.code);
            if (params?.name) searchParams.append('name', params.name);

            const url = `/api/productos${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener los productos');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return { success: false, data: [], count: 0, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getProducts
    };
}; 