import { useState } from 'react';

export interface BatchItem {
    productId: string;
    productCode: string;
    productName: string;
    lotNumber: string; // Número de lote específico para este producto
    quantity: number;
    containers: string[];
}

export interface CreateBatchRequest {
    name: string;
    description?: string;
    items: BatchItem[]; // Cada item es un lote completo
}

export interface CreateBatchResponse {
    success: boolean;
    data?: {
        batchNumber: string; // Folio de la salida
        batches: Array<{
            id: string;
            batchNumber: string;
            name: string;
            description?: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            containers: any[];
            batchItems: any[];
            assignments?: Array<{
                batchItemId: string;
                productName: string;
                totalQuantity: number;
                assignedQuantity: number;
                remainingQuantity: number;
                assignments: Array<{
                    orderNumber: string;
                    orderItemId: string;
                    assignedQuantity: number;
                    pendingBefore: number;
                    pendingAfter: number;
                }>;
                error?: string;
            }>;
        }>;
        totalBatches: number;
        assignments: Array<{
            batchItemId: string;
            productName: string;
            totalQuantity: number;
            assignedQuantity: number;
            remainingQuantity: number;
            assignments: Array<{
                orderNumber: string;
                orderItemId: string;
                assignedQuantity: number;
                pendingBefore: number;
                pendingAfter: number;
            }>;
            error?: string;
        }>;
    };
    error?: string;
    message?: string;
}

export interface GetBatchesResponse {
    success: boolean;
    data?: {
        batches: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    error?: string;
}

export const useBatches = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBatch = async (batchData: CreateBatchRequest): Promise<CreateBatchResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/lotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batchData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear el lote');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getBatches = async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        batchNumber?: string;
    }): Promise<GetBatchesResponse> => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append('page', params.page.toString());
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.status) searchParams.append('status', params.status);
            if (params?.batchNumber) searchParams.append('batchNumber', params.batchNumber);

            const url = `/api/lotes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener los lotes');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return { 
                success: false, 
                data: { 
                    batches: [], 
                    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } 
                }, 
                error: errorMessage 
            };
        } finally {
            setLoading(false);
        }
    };

    const getBatch = async (id: string): Promise<{ success: boolean; data?: any; error?: string }> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/lotes/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener el lote');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createBatch,
        getBatches,
        getBatch
    };
}; 