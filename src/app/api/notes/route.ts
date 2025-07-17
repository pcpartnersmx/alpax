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

        const body = await request.json();
        const { content, type, orderId, batchItemId } = body;

        // Validaciones
        if (!content || !type) {
            return NextResponse.json(
                { success: false, error: 'Contenido y tipo son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el tipo de nota sea válido
        const validTypes = ['ORDER_NOTE', 'GENERAL_NOTE', 'SYSTEM_NOTE', 'BATCH_ITEM_NOTE'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: 'Tipo de nota inválido' },
                { status: 400 }
            );
        }

        // Si se proporciona orderId, verificar que el pedido existe
        // Solo validar si no es una nota de batch item
        if (orderId && type !== 'BATCH_ITEM_NOTE') {
            const order = await prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                return NextResponse.json(
                    { success: false, error: 'Pedido no encontrado' },
                    { status: 404 }
                );
            }
        }

        // Si se proporciona batchItemId, verificar que el batch item existe
        // Comentado temporalmente hasta que se ejecute la migración
        /*
        if (batchItemId) {
            const batchItem = await prisma.batchItem.findUnique({
                where: { id: batchItemId }
            });

            if (!batchItem) {
                return NextResponse.json(
                    { success: false, error: 'Batch item no encontrado' },
                    { status: 404 }
                );
            }
        }
        */

        // Crear la nota
        const note = await prisma.note.create({
            data: {
                content,
                type,
                userId: user.id,
                orderId: orderId || null
                // batchItemId: batchItemId || null // Comentado temporalmente
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true
                    }
                }
                // batchItem: { // Comentado temporalmente
                //     select: {
                //         id: true,
                //         product: {
                //             select: {
                //                 id: true,
                //                 name: true,
                //                 code: true
                //             }
                //         }
                //     }
                // }
            }
        });

        // Crear un log de la acción
        await prisma.log.create({
            data: {
                action: 'CREATE_NOTE',
                description: `Nota creada: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                userId: user.id,
                orderId: orderId || null
                // batchId: batchItemId ? (await prisma.batchItem.findUnique({
                //     where: { id: batchItemId },
                //     include: { container: true }
                // }))?.container.batchId : null // Comentado temporalmente
            }
        });

        return NextResponse.json({
            success: true,
            data: note,
            message: 'Nota creada exitosamente'
        });

    } catch (error) {
        console.error('Error creando nota:', error);
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

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const batchItemId = searchParams.get('batchItemId');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Construir filtros
        const where: any = {};
        if (orderId) where.orderId = orderId;
        // if (batchItemId) where.batchItemId = batchItemId; // Comentado temporalmente
        if (type) where.type = type;

        // Obtener notas con paginación
        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    order: {
                        select: {
                            id: true,
                            orderNumber: true
                        }
                    }
                    // batchItem: { // Comentado temporalmente
                    //     select: {
                    //         id: true,
                    //         product: {
                    //             select: {
                    //             id: true,
                    //             name: true,
                    //             code: true
                    //         }
                    //     }
                    // }
                }
            }),
            prisma.note.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: notes,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Error obteniendo notas:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 