import { useState } from 'react';
import { 
    Order, 
    CreateOrderRequest, 
    CreateOrderResponse, 
    GetOrdersResponse,
    UpdateOrderRequest 
} from '@/types/pedido';

export const useOrders = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear el pedido');
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

    const getOrders = async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        orderNumber?: string;
        productId?: string;
    }): Promise<GetOrdersResponse> => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append('page', params.page.toString());
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.status) searchParams.append('status', params.status);
            if (params?.orderNumber) searchParams.append('orderNumber', params.orderNumber);
            if (params?.productId) searchParams.append('productId', params.productId);

            const url = `/api/pedido${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener los pedidos');
            }

            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getOrder = async (id: string): Promise<{ success: boolean; data?: Order; error?: string }> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pedido/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener el pedido');
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

    const updateOrder = async (id: string, updateData: UpdateOrderRequest): Promise<{ success: boolean; data?: Order; error?: string }> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pedido/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar el pedido');
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

    const deleteOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pedido/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al eliminar el pedido');
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
        createOrder,
        getOrders,
        getOrder,
        updateOrder,
        deleteOrder
    };
}; 