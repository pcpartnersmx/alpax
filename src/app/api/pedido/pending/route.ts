import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

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
        const productId = searchParams.get('productId');
        const batchItemId = searchParams.get('batchItemId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'productId es requerido' },
                { status: 400 }
            );
        }

        // Construir filtros para obtener pedidos pendientes
        const where: any = {
            status: {
                in: ['PENDING', 'IN_PROGRESS']
            },
            orderItems: {
                some: {
                    productId: productId,
                    // Solo items que no estén completamente llenos
                    quantity: {
                        gt: prisma.orderItem.fields.completedQuantity
                    }
                }
            }
        };

        // Obtener pedidos pendientes con sus items
        const pendingOrders = await prisma.order.findMany({
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
                    where: {
                        productId: productId,
                        quantity: {
                            gt: prisma.orderItem.fields.completedQuantity
                        }
                    },
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
                createdAt: 'asc' // Priorizar pedidos más antiguos
            }
        });

        // Si se especifica un batchItemId, obtener información adicional
        let batchItemInfo = null;
        if (batchItemId) {
            batchItemInfo = await prisma.batchItem.findUnique({
                where: { id: batchItemId },
                include: {
                    product: true,
                    container: {
                        include: {
                            batch: true
                        }
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                pendingOrders,
                batchItemInfo
            }
        });

    } catch (error) {
        console.error('Error obteniendo pedidos pendientes:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 