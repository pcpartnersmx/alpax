export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
        id: string;
        name: string;
        code: string;
        area: {
            id: string;
            name: string;
        };
    };
}

export interface Order {
    id: string;
    orderNumber: string;
    type: 'MANUAL' | 'AI_GENERATED';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    orderNotes?: string;
    pdfUrl?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    orderItems: OrderItem[];
}

export interface CreateOrderRequest {
    orderNumber: string;
    items: {
        productId: string;
        quantity: number;
    }[];
    pdfUrl?: string;
}

export interface CreateOrderResponse {
    success: boolean;
    data?: Order;
    message?: string;
    error?: string;
}

export interface GetOrdersResponse {
    success: boolean;
    data: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    error?: string;
}

export interface UpdateOrderRequest {
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    orderNotes?: string;
}

export interface OrderFormData {
    numeroPedido: string;
    producto: string;
    cantidad: string;
}

export interface OrderFormErrors {
    numeroPedido: string;
    producto: string;
    cantidad: string;
}

export interface PedidoItem {
    producto: string;
    cantidad: string;
    codigo: string;
    id: string;
} 