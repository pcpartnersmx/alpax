import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { assignBatchItemToPendingOrders } from '@/lib/assignmentUtils';



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

        console.log("lotes", body)

        const { batchNumber, name, description, items } = body;

        console.log("Datos recibidos:", { batchNumber, name, description, items });

    console.log("items:", items)

    const existingBatch = await prisma.batch.findUnique({
        where: { batchNumber }
    });


    if (existingBatch) {
        return NextResponse.json(
            { success: false, error: 'El número de lote ya existe' },
            { status: 400 }
        );
    }

    console.log("nuevo batch")

    const batchItems: Array<{
        productId: string;
        quantity: number;
    }> = [];



    for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos en los items del lote' },
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
        batchItems.push({
            productId: item.productId,
            quantity: item.quantity
        });
    }


    console.log("batchItems:", batchItems)


    const newBatch = await prisma.batch.create({
        data: {
            batchNumber,
            name,
            description: description || null,
            status: 'ACTIVE'
        }
    });

    if (!newBatch) {
        return NextResponse.json(
            { success: false, error: 'Error al crear el lote' },
            { status: 500 }
        );
    }

    console.log("newBatch:", newBatch)

    // Crear los items del lote si se proporcionan
    if (batchItems.length > 0) {
        console.log("Creando contenedor y items del lote...");
        
        // Crear un contenedor por defecto para los items
        const defaultContainer = await prisma.container.create({
            data: {
                containerCode: `CONT-${batchNumber}`,
                name: `Contenedor ${batchNumber}`,
                description: `Contenedor por defecto del lote ${batchNumber}`,
                status: 'ACTIVE',
                batchId: newBatch.id
            }
        });

        console.log("Contenedor creado:", defaultContainer.id);

        // Crear los items del lote en el contenedor
        const createdItems = await Promise.all(
            batchItems.map(async (item) => {
                console.log(`Creando item para producto ${item.productId} con cantidad ${item.quantity}`);
                return await prisma.batchItem.create({
                    data: {
                        ...item,
                        containerId: defaultContainer.id
                    },
                    include: {
                        product: true,
                        container: true
                    }
                });
            })
        );

        console.log(`Creados ${createdItems.length} items del lote`);

        // Asignar automáticamente las salidas a pedidos pendientes
        console.log("Iniciando asignación automática...");
        const assignmentResults = await Promise.all(
            createdItems.map(async (batchItem) => {
                console.log(`Asignando item ${batchItem.id} (${batchItem.product.name})`);
                return await assignBatchItemToPendingOrders(batchItem, user.id);
            })
        );

        console.log("Resultados de asignación:", assignmentResults);

        return NextResponse.json({
            success: true,
            data: {
                ...newBatch,
                containers: [defaultContainer],
                batchItems: createdItems,
                assignments: assignmentResults
            },
            message: 'Lote creado exitosamente con asignaciones automáticas'
        });
    }

    return NextResponse.json({
        success: true,
        data: newBatch,
        message: 'Lote creado exitosamente'
    });

    } catch (error) {
        console.error('Error creando lote:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
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
        const { batchItemId, orderItemId, quantity } = body;

        // Validaciones
        if (!batchItemId || !orderItemId || !quantity || quantity <= 0) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos: batchItemId, orderItemId y quantity son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el batchItem existe
        const batchItem = await prisma.batchItem.findUnique({
            where: { id: batchItemId },
            include: {
                product: true,
                container: true
            }
        });

        if (!batchItem) {
            return NextResponse.json(
                { success: false, error: 'Item de lote no encontrado' },
                { status: 404 }
            );
        }

        // Verificar que el orderItem existe
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
            include: {
                product: true,
                order: true
            }
        });

        if (!orderItem) {
            return NextResponse.json(
                { success: false, error: 'Item de pedido no encontrado' },
                { status: 404 }
            );
        }

        // Verificar que los productos coinciden
        if (batchItem.productId !== orderItem.productId) {
            return NextResponse.json(
                { success: false, error: 'Los productos del lote y del pedido no coinciden' },
                { status: 400 }
            );
        }

        // Verificar que la cantidad no exceda lo disponible en el lote
        if (quantity > batchItem.quantity) {
            return NextResponse.json(
                { success: false, error: 'La cantidad excede lo disponible en el lote' },
                { status: 400 }
            );
        }

        // Verificar que la cantidad no exceda lo pendiente del pedido
        const pendingQuantity = orderItem.quantity - (orderItem.completedQuantity || 0);
        if (quantity > pendingQuantity) {
            return NextResponse.json(
                { success: false, error: 'La cantidad excede lo pendiente del pedido' },
                { status: 400 }
            );
        }

        // Actualizar en una transacción
        const result = await prisma.$transaction(async (tx) => {
            // Actualizar el batchItem para asignarlo al pedido
            const updatedBatchItem = await tx.batchItem.update({
                where: { id: batchItemId },
                data: {
                    orderItemId: orderItemId
                }
            });

            // Actualizar la cantidad completada del pedido
            const updatedOrderItem = await tx.orderItem.update({
                where: { id: orderItemId },
                data: {
                    completedQuantity: {
                        increment: quantity
                    }
                },
                include: {
                    product: true,
                    order: true
                }
            });

            // Verificar si el pedido está completo
            const allOrderItems = await tx.orderItem.findMany({
                where: { orderId: orderItem.orderId }
            });

            const isOrderComplete = allOrderItems.every(item => 
                (item.completedQuantity || 0) >= item.quantity
            );

            // Si el pedido está completo, actualizar su estado
            if (isOrderComplete) {
                await tx.order.update({
                    where: { id: orderItem.orderId },
                    data: { status: 'COMPLETED' }
                });
            } else {
                // Si no está completo pero tiene items en progreso, cambiar a IN_PROGRESS
                const hasInProgressItems = allOrderItems.some(item => 
                    (item.completedQuantity || 0) > 0 && (item.completedQuantity || 0) < item.quantity
                );
                
                if (hasInProgressItems) {
                    await tx.order.update({
                        where: { id: orderItem.orderId },
                        data: { status: 'IN_PROGRESS' }
                    });
                }
            }

            // Crear un log de la acción
            await tx.log.create({
                data: {
                    action: 'ASSIGN_BATCH_TO_ORDER',
                    description: `Asignado ${quantity} unidades del lote ${batchItem.id} al pedido ${orderItem.order.orderNumber}`,
                    quantity: quantity,
                    userId: user.id,
                    orderId: orderItem.orderId,
                    batchId: batchItem.container.batchId,
                    productId: batchItem.productId
                }
            });

            return {
                batchItem: updatedBatchItem,
                orderItem: updatedOrderItem,
                isOrderComplete
            };
        });

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Salida asignada al pedido exitosamente'
        });

    } catch (error) {
        console.error('Error asignando salida a pedido:', error);
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
        const batchNumber = searchParams.get('batchNumber');

        // Construir filtros
        const where: any = {};
        if (status) where.status = status;
        if (batchNumber) where.batchNumber = { contains: batchNumber, mode: 'insensitive' };

        // Obtener lotes con paginación
        const batches = await prisma.batch.findMany({
            where,
            include: {
                containers: {
                    include: {
                        batchItems: {
                            include: {
                                product: {
                                    include: {
                                        area: true
                                    }
                                }
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

        // Obtener el total de lotes para la paginación
        const total = await prisma.batch.count({ where });

        return NextResponse.json({
            success: true,
            data: {
                batches,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo lotes:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 