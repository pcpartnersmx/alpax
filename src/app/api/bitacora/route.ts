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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');

        // Construir filtros
        const where: any = {};

        // Filtro por fechas
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Filtro de búsqueda
        if (search) {
            where.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { product: { name: { contains: search, mode: 'insensitive' } } },
                { product: { code: { contains: search, mode: 'insensitive' } } },
                { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
                { batch: { batchNumber: { contains: search, mode: 'insensitive' } } },
                { area: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Obtener logs con paginación
        const [logs, total] = await Promise.all([
            prisma.log.findMany({
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
                    product: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    },
                    order: {
                        select: {
                            id: true,
                            orderNumber: true
                        }
                    },
                    batch: {
                        select: {
                            id: true,
                            batchNumber: true
                        }
                    },
                    area: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),
            prisma.log.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        // Transformar los datos para que coincidan con el formato esperado por la bitácora
        const transformedLogs = logs.map(log => ({
            folio: log.id.substring(0, 8).toUpperCase(),
            area: log.area?.name || log.user.name || 'Sistema',
            clave: log.product?.code || '-',
            pedido: log.order?.orderNumber || '-',
            lote: log.batch?.batchNumber || '-',
            fecha: log.createdAt.toLocaleDateString('es-ES'),
            hora: log.createdAt.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            }),
            cantidad: log.quantity ? log.quantity.toLocaleString() : '-',
            action: log.action,
            description: log.description
        }));

        return NextResponse.json({
            success: true,
            data: transformedLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error('Error obteniendo logs:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 