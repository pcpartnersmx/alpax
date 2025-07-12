import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params;

        // Obtener el lote con sus items y contenedores
        const batch = await prisma.batch.findUnique({
            where: { id },
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
            }
        });

        if (!batch) {
            return NextResponse.json(
                { success: false, error: 'Lote no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: batch
        });

    } catch (error) {
        console.error('Error obteniendo lote:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 