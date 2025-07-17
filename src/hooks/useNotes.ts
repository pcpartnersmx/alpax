import { useState } from 'react';

export interface Note {
    id: string;
    content: string;
    type: 'ORDER_NOTE' | 'GENERAL_NOTE' | 'SYSTEM_NOTE';
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    order?: {
        id: string;
        orderNumber: string;
    };
}

export interface CreateNoteRequest {
    content: string;
    type: 'ORDER_NOTE' | 'GENERAL_NOTE' | 'SYSTEM_NOTE' | 'BATCH_ITEM_NOTE';
    orderId?: string;
    batchItemId?: string;
}

export interface CreateNoteResponse {
    success: boolean;
    data?: Note;
    message?: string;
    error?: string;
}

export interface GetNotesResponse {
    success: boolean;
    data: Note[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    error?: string;
}

export const useNotes = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createNote = async (noteData: CreateNoteRequest): Promise<CreateNoteResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear la nota');
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

    const getNotes = async (params?: {
        page?: number;
        limit?: number;
        orderId?: string;
        batchItemId?: string;
        type?: string;
    }): Promise<GetNotesResponse> => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append('page', params.page.toString());
            if (params?.limit) searchParams.append('limit', params.limit.toString());
            if (params?.orderId) searchParams.append('orderId', params.orderId);
            if (params?.batchItemId) searchParams.append('batchItemId', params.batchItemId);
            if (params?.type) searchParams.append('type', params.type);

            const url = `/api/notes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener las notas');
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

    return {
        loading,
        error,
        createNote,
        getNotes
    };
}; 