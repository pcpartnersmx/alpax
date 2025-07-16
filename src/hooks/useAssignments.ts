import { useState } from 'react';

export interface AssignmentRequest {
    batchItemId: string;
    orderItemId: string;
    quantity: number;
}

export interface AssignmentResponse {
    success: boolean;
    data?: {
        batchItem: any;
        orderItem: any;
        isOrderComplete: boolean;
    };
    error?: string;
}

export interface PendingOrdersResponse {
    success: boolean;
    data?: {
        pendingOrders: any[];
        batchItemInfo: any;
    };
    error?: string;
}

export const useAssignments = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPendingOrders = async (productId: string, batchItemId?: string): Promise<PendingOrdersResponse> => {
        setLoading(true);
        setError(null);

        try {
            const url = `/api/pedido/pending?productId=${productId}${batchItemId ? `&batchItemId=${batchItemId}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener pedidos pendientes');
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

    const assignBatchToOrder = async (assignmentData: AssignmentRequest): Promise<AssignmentResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/lotes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assignmentData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al asignar salida al pedido');
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
        getPendingOrders,
        assignBatchToOrder
    };
}; 