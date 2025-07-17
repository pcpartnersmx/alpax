import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { assignBatchItemToPendingOrders } from '@/lib/assignmentUtils';

// Función para generar el batchNumber automático con formato N-{consecutivo}-{año}
async function generateBatchNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // Buscar el último lote del año actual con formato N-XXX-YYYY
    const lastBatch = await prisma.batch.findFirst({
        where: {
            batchNumber: {
                startsWith: 'N-',
                endsWith: `-${currentYear}`
            }
        },
        orderBy: {
            batchNumber: 'desc'
        }
    });

    let nextConsecutive = 1;
    
    if (lastBatch) {
        // Extraer el consecutivo del último lote
        const match = lastBatch.batchNumber.match(/N-(\d+)-(\d+)/);
        if (match && parseInt(match[2]) === currentYear) {
            nextConsecutive = parseInt(match[1]) + 1;
        }
    }

    // Formatear el consecutivo con ceros a la izquierda (ej: 001, 002, etc.)
    const formattedConsecutive = nextConsecutive.toString().padStart(3, '0');
    
    return `N-${formattedConsecutive}-${currentYear}`;
}



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

        const { name, description, items } = body;

        console.log("Datos recibidos:", { name, description, items });

        // Validar que hay items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Debe proporcionar al menos un lote' },
                { status: 400 }
            );
        }

        // Validar cada item
        for (const item of items) {
            if (!item.productId || !item.lotNumber || !item.quantity || item.quantity <= 0) {
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
        }

        // Crear múltiples lotes (uno por cada item)
        const createdBatches = [];
        const allAssignments = [];

        // Generar UN SOLO batchNumber (folio) para toda la salida
        const batchNumber = await generateBatchNumber();
        console.log(`Creando salida con folio: ${batchNumber}`);

        for (const item of items) {
            console.log(`Creando lote para producto ${item.productName} con número de lote: ${item.lotNumber}`);

            // Crear el lote usando el mismo batchNumber (folio de la salida)
            const newBatch = await prisma.batch.create({
                data: {
                    batchNumber, // Mismo folio para toda la salida
                    name: item.lotNumber, // Guardar el número de lote ingresado por el usuario en el campo name
                    description: description || `Lote ${item.lotNumber} de ${item.productName}`,
                    status: 'ACTIVE'
                }
            });

            if (!newBatch) {
                return NextResponse.json(
                    { success: false, error: 'Error al crear el lote' },
                    { status: 500 }
                );
            }

            // Crear contenedores para este lote
            const containers = [];
            if (item.containers && item.containers.length > 0) {
                // Crear contenedores específicos para este lote
                for (const containerCode of item.containers) {
                    // Verificar si el contenedor ya existe
                    let container = await prisma.container.findUnique({
                        where: { containerCode: containerCode }
                    });
                    
                    if (!container) {
                        // Crear el contenedor si no existe
                        container = await prisma.container.create({
                            data: {
                                containerCode: containerCode,
                                name: `Contenedor ${containerCode}`,
                                description: `Contenedor ${containerCode} del lote ${item.lotNumber}`,
                                status: 'ACTIVE',
                                batchId: newBatch.id
                            }
                        });
                    } else {
                        // Si el contenedor ya existe, actualizar su batchId
                        container = await prisma.container.update({
                            where: { id: container.id },
                            data: {
                                batchId: newBatch.id,
                                description: `Contenedor ${containerCode} del lote ${item.lotNumber}`
                            }
                        });
                    }
                    containers.push(container);
                }
            } else {
                // Crear un contenedor por defecto
                const defaultContainer = await prisma.container.create({
                    data: {
                        containerCode: `CONT-${item.lotNumber}`,
                        name: `Contenedor ${item.lotNumber}`,
                        description: `Contenedor por defecto del lote ${item.lotNumber}`,
                        status: 'ACTIVE',
                        batchId: newBatch.id
                    }
                });
                containers.push(defaultContainer);
            }

            // Crear el batch item en el primer contenedor
            const batchItem = await prisma.batchItem.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    containerId: containers[0].id
                },
                include: {
                    product: true,
                    container: true
                }
            });

            // Asignar automáticamente a pedidos pendientes
            console.log(`Asignando lote ${item.lotNumber} (${item.productName})`);
            const assignmentResult = await assignBatchItemToPendingOrders(batchItem, user.id);

            createdBatches.push({
                ...newBatch,
                containers: containers,
                batchItems: [batchItem],
                assignments: [assignmentResult]
            });

            allAssignments.push(assignmentResult);
        }

        console.log(`Creados ${createdBatches.length} lotes en la salida ${batchNumber}`);

        return NextResponse.json({
            success: true,
            data: {
                batchNumber, // Folio de la salida
                batches: createdBatches,
                totalBatches: createdBatches.length,
                assignments: allAssignments
            },
            message: `Salida ${batchNumber} creada exitosamente con ${createdBatches.length} lote(s) y asignaciones automáticas`
        });

    } catch (error) {
        console.error('Error creando lotes:', error);
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
                                },
                                orderItem: {
                                    include: {
                                        order: true
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