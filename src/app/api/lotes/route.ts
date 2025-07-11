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
        const { batchNumber, name, description, items, containers } = body;

        // Validaciones
        if (!batchNumber || !name || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Datos inválidos: número de lote, nombre e items son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el número de lote no exista
        const existingBatch = await prisma.batch.findUnique({
            where: { batchNumber }
        });

        if (existingBatch) {
            return NextResponse.json(
                { success: false, error: 'El número de lote ya existe' },
                { status: 400 }
            );
        }

        // Validar y preparar los items
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

        // Crear el lote con sus items y contenedores en una transacción
        const batch = await prisma.$transaction(async (tx) => {
            // Crear el lote
            const newBatch = await tx.batch.create({
                data: {
                    batchNumber,
                    name,
                    description: description || null,
                    status: 'ACTIVE'
                }
            });

            // Crear los items del lote
            const createdItems = await Promise.all(
                batchItems.map(item =>
                    tx.batchItem.create({
                        data: {
                            ...item,
                            batchId: newBatch.id
                        },
                        include: {
                            product: true
                        }
                    })
                )
            );

            // Crear los contenedores si se proporcionan
            let createdContainers: any[] = [];
            if (containers && Array.isArray(containers) && containers.length > 0) {
                createdContainers = await Promise.all(
                    containers.map((containerCode: string) =>
                        tx.container.create({
                            data: {
                                containerCode,
                                name: `Contenedor ${containerCode}`,
                                description: `Contenedor del lote ${batchNumber}`,
                                status: 'ACTIVE',
                                batchId: newBatch.id
                            }
                        })
                    )
                );
            }

            // Crear un log de la acción
            await tx.log.create({
                data: {
                    action: 'CREATE_BATCH',
                    description: `Lote ${batchNumber} creado con ${items.length} productos`,
                    quantity: items.length,
                    userId: user.id,
                    batchId: newBatch.id
                }
            });

            return {
                ...newBatch,
                batchItems: createdItems,
                containers: createdContainers
            };
        });

        return NextResponse.json({
            success: true,
            data: batch,
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
                batchItems: {
                    include: {
                        product: {
                            include: {
                                area: true
                            }
                        }
                    }
                },
                containers: true
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