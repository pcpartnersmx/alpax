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
        let lastAssignedOrder = null;
        let lastAssignedOrderItem = null;
        for (const order of pendingOrders) {
            if (remainingQuantity <= 0) break;

            console.log(`Procesando pedido: ${order.orderNumber} (${order.status})`);

            for (const orderItem of order.orderItems) {
                if (remainingQuantity <= 0) break;

                const pendingQuantity = orderItem.quantity - (orderItem.completedQuantity || 0);
                const assignQuantity = Math.min(remainingQuantity, pendingQuantity);

                console.log(`  Item del pedido: ${orderItem.quantity} total, ${orderItem.completedQuantity || 0} completado, ${pendingQuantity} pendiente`);

                if (assignQuantity > 0) {
                    await prisma.$transaction(async (tx) => {
                        await tx.batchItem.update({
                            where: { id: batchItem.id },
                            data: {
                                orderItemId: orderItem.id
                            }
                        });
                        await tx.orderItem.update({
                            where: { id: orderItem.id },
                            data: {
                                completedQuantity: {
                                    increment: assignQuantity
                                }
                            }
                        });
                        const allOrderItems = await tx.orderItem.findMany({
                            where: { orderId: order.id }
                        });
                        const isOrderComplete = allOrderItems.every(item => 
                            (item.completedQuantity || 0) >= item.quantity
                        );
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
                    lastAssignedOrder = order;
                    lastAssignedOrderItem = orderItem;
                }
            }
        }

        // Si queda sobrante y hubo al menos un pedido asignado, asignar el sobrante al último pedido
        if (remainingQuantity > 0 && lastAssignedOrder && lastAssignedOrderItem) {
            await prisma.$transaction(async (tx) => {
                await tx.batchItem.update({
                    where: { id: batchItem.id },
                    data: {
                        orderItemId: lastAssignedOrderItem.id
                    }
                });
                await tx.orderItem.update({
                    where: { id: lastAssignedOrderItem.id },
                    data: {
                        completedQuantity: {
                            increment: remainingQuantity
                        }
                    }
                });
                await tx.log.create({
                    data: {
                        action: 'OVER_ASSIGN_BATCH_TO_ORDER',
                        description: `Asignación de sobrante: ${remainingQuantity} unidades extra del lote ${batchItem.id} al pedido ${lastAssignedOrder.orderNumber}`,
                        quantity: remainingQuantity,
                        userId: userId,
                        orderId: lastAssignedOrder.id,
                        productId: batchItem.productId
                    }
                });
            });
            assignments.push({
                orderNumber: lastAssignedOrder.orderNumber,
                orderItemId: lastAssignedOrderItem.id,
                assignedQuantity: remainingQuantity,
                pendingBefore: 0,
                pendingAfter: 0 - remainingQuantity
            });
            remainingQuantity = 0;
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

    } catch (error: any) {
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