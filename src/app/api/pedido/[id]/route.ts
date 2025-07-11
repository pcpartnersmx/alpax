import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = params;

        // Obtener el pedido con todos sus detalles
        const order = await prisma.order.findUnique({
            where: { id },
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
                },
                notes: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                logs: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Pedido no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { status, orderNotes } = body;

        // Verificar que el pedido existe
        const existingOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!existingOrder) {
            return NextResponse.json(
                { success: false, error: 'Pedido no encontrado' },
                { status: 404 }
            );
        }

        // Actualizar el pedido
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: status || existingOrder.status,
                orderNotes: orderNotes || existingOrder.orderNotes
            },
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
            }
        });

        // Crear un log de la actualización
        await prisma.log.create({
            data: {
                action: 'UPDATE_ORDER',
                description: `Pedido ${updatedOrder.orderNumber} actualizado`,
                userId: session.user.id as string,
                orderId: id
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedOrder,
            message: 'Pedido actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando pedido:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = params;

        // Verificar que el pedido existe
        const existingOrder = await prisma.order.findUnique({
            where: { id }
        });

        if (!existingOrder) {
            return NextResponse.json(
                { success: false, error: 'Pedido no encontrado' },
                { status: 404 }
            );
        }

        // Eliminar el pedido (esto también eliminará los orderItems por la cascada)
        await prisma.order.delete({
            where: { id }
        });

        // Crear un log de la eliminación
        await prisma.log.create({
            data: {
                action: 'DELETE_ORDER',
                description: `Pedido ${existingOrder.orderNumber} eliminado`,
                userId: session.user.id as string
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Pedido eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando pedido:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 