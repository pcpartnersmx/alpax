import { useState } from 'react';

export interface BitacoraItem {
    folio: string;
    area: string;
    clave: string;
    pedido: string;
    lote: string;
    fecha: string;
    hora: string;
    cantidad: string;
    action: string;
    description: string;
}

export interface GetBitacoraResponse {
    success: boolean;
    data: BitacoraItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    error?: string;
}

export const useBitacora = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getBitacora = async (params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
    }): Promise<GetBitacoraResponse> => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append('page', params.page.toString());
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.startDate) searchParams.append('startDate', params.startDate);
            if (params?.endDate) searchParams.append('endDate', params.endDate);
            if (params?.search) searchParams.append('search', params.search);

            const url = `/api/bitacora${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener la bitácora');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return { success: false, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getBitacora
    };
}; 