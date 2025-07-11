import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener el usuario
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Parsear el body de la request
        const body = await request.json();
        const { orderNumber, items, pdfUrl } = body;

        // Validaciones
        if (!orderNumber || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos: número de pedido y items son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el número de pedido no exista
        const existingOrder = await prisma.order.findUnique({
            where: { orderNumber }
        });

        if (existingOrder) {
            return NextResponse.json(
                { success: false, error: 'El número de pedido ya existe' },
                { status: 400 }
            );
        }

        // Calcular el total del pedido
        let totalAmount = 0;
        const orderItems: Array<{
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }> = [];

        // Validar y preparar los items
        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                return NextResponse.json(
                    { success: false, error: 'Datos inválidos en los items del pedido' },
                    { status: 400 }
                );
            }

            // Verificar que el producto existe
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) {
                return NextResponse.json(
                    { success: false, error: `Producto con ID ${item.productId} no encontrado` },
                    { status: 404 }
                );
            }

            // Por ahora usamos un precio unitario de 1, puedes ajustarlo según tu lógica de negocio
            const unitPrice = 1;
            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                totalPrice
            });
        }

        // Crear el pedido con sus items en una transacción
        const order = await prisma.$transaction(async (tx) => {
            // Crear el pedido
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    type: 'MANUAL',
                    status: 'PENDING',
                    totalAmount,
                    pdfUrl: pdfUrl || null,
                    userId: user.id
                }
            });

            // Crear los items del pedido
            const createdItems = await Promise.all(
                orderItems.map(item =>
                    tx.orderItem.create({
                        data: {
                            ...item,
                            orderId: newOrder.id
                        },
                        include: {
                            product: true
                        }
                    })
                )
            );

            // Crear un log de la acción
            await tx.log.create({
                data: {
                    action: 'CREATE_ORDER',
                    description: `Pedido ${orderNumber} creado con ${items.length} productos`,
                    quantity: items.length,
                    userId: user.id,
                    orderId: newOrder.id
                }
            });

            return {
                ...newOrder,
                orderItems: createdItems
            };
        });

        return NextResponse.json({
            success: true,
            data: order,
            message: 'Pedido creado exitosamente'
        });

    } catch (error) {
        console.error('Error creando pedido:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener parámetros de query
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const orderNumber = searchParams.get('orderNumber');
        const productId = searchParams.get('productId');

        // Construir filtros
        const where: any = {};
        if (status) where.status = status;
        if (orderNumber) where.orderNumber = { contains: orderNumber, mode: 'insensitive' };
        
        // Si se especifica un productId, filtrar por productos en los orderItems
        if (productId) {
            where.orderItems = {
                some: {
                    productId: productId
                }
            };
        }

        // Obtener pedidos con paginación
        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                orderItems: {
                    include: {
                        product: {
                            include: {
                                area: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        });

        // Obtener el total de pedidos para la paginación
        const total = await prisma.order.count({ where });

        return NextResponse.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 