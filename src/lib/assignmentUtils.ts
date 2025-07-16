import prisma from './db';

// Función para asignar automáticamente un item de lote a pedidos pendientes
export async function assignBatchItemToPendingOrders(batchItem: any, userId: string) {
    try {
        console.log(`Iniciando asignación automática para producto: ${batchItem.productId}`);
        
        // Obtener pedidos pendientes para este producto
        const pendingOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ['PENDING', 'IN_PROGRESS']
                },
                orderItems: {
                    some: {
                        productId: batchItem.productId
                    }
                }
            },
            include: {
                orderItems: {
                    where: {
                        productId: batchItem.productId
                    }
                }
            },
            orderBy: {
                createdAt: 'asc' // Priorizar pedidos más antiguos
            }
        });

        console.log(`Encontrados ${pendingOrders.length} pedidos pendientes para el producto ${batchItem.productId}`);

        let remainingQuantity = batchItem.quantity;
        const assignments = [];

        console.log(`Cantidad disponible para asignar: ${remainingQuantity}`);

        // Asignar a cada pedido pendiente
        for (const order of pendingOrders) {
            if (remainingQuantity <= 0) break;

            console.log(`Procesando pedido: ${order.orderNumber} (${order.status})`);

            for (const orderItem of order.orderItems) {
                if (remainingQuantity <= 0) break;

                const pendingQuantity = orderItem.quantity - (orderItem.completedQuantity || 0);
                const assignQuantity = Math.min(remainingQuantity, pendingQuantity);

                console.log(`  Item del pedido: ${orderItem.quantity} total, ${orderItem.completedQuantity || 0} completado, ${pendingQuantity} pendiente`);

                if (assignQuantity > 0) {
                    // Asignar la cantidad
                    await prisma.$transaction(async (tx) => {
                        // Actualizar el batchItem para asignarlo al pedido
                        await tx.batchItem.update({
                            where: { id: batchItem.id },
                            data: {
                                orderItemId: orderItem.id
                            }
                        });

                        // Actualizar la cantidad completada del pedido
                        await tx.orderItem.update({
                            where: { id: orderItem.id },
                            data: {
                                completedQuantity: {
                                    increment: assignQuantity
                                }
                            }
                        });

                        // Verificar si el pedido está completo
                        const allOrderItems = await tx.orderItem.findMany({
                            where: { orderId: order.id }
                        });

                        const isOrderComplete = allOrderItems.every(item => 
                            (item.completedQuantity || 0) >= item.quantity
                        );

                        // Actualizar estado del pedido
                        if (isOrderComplete) {
                            await tx.order.update({
                                where: { id: order.id },
                                data: { status: 'COMPLETED' }
                            });
                        } else {
                            const hasInProgressItems = allOrderItems.some(item => 
                                (item.completedQuantity || 0) > 0 && (item.completedQuantity || 0) < item.quantity
                            );
                            
                            if (hasInProgressItems) {
                                await tx.order.update({
                                    where: { id: order.id },
                                    data: { status: 'IN_PROGRESS' }
                                });
                            }
                        }

                        // Crear log de la asignación
                        await tx.log.create({
                            data: {
                                action: 'AUTO_ASSIGN_BATCH_TO_ORDER',
                                description: `Asignación automática: ${assignQuantity} unidades del lote ${batchItem.id} al pedido ${order.orderNumber}`,
                                quantity: assignQuantity,
                                userId: userId,
                                orderId: order.id,
                                productId: batchItem.productId
                            }
                        });
                    });

                    assignments.push({
                        orderNumber: order.orderNumber,
                        orderItemId: orderItem.id,
                        assignedQuantity: assignQuantity,
                        pendingBefore: pendingQuantity,
                        pendingAfter: pendingQuantity - assignQuantity
                    });

                    remainingQuantity -= assignQuantity;
                }
            }
        }

        const result = {
            batchItemId: batchItem.id,
            productName: batchItem.product.name,
            totalQuantity: batchItem.quantity,
            assignedQuantity: batchItem.quantity - remainingQuantity,
            remainingQuantity: remainingQuantity,
            assignments: assignments
        };

        console.log(`Resultado de asignación para ${batchItem.product.name}:`, result);
        return result;

    } catch (error) {
        console.error('Error en asignación automática:', error);
        console.error('Detalles del error:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        return {
            batchItemId: batchItem.id,
            error: `Error en asignación automática: ${error.message}`,
            totalQuantity: batchItem.quantity,
            assignedQuantity: 0,
            remainingQuantity: batchItem.quantity,
            assignments: []
        };
    }
} 