import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description } = body;

        // Validación de campos requeridos
        if (!name) {
            return NextResponse.json(
                { error: 'El campo nombre es requerido' },
                { status: 400 }
            );
        }

        // Verificar si ya existe un área con el mismo nombre
        const existingArea = await prisma.area.findUnique({
            where: { name }
        });

        if (existingArea) {
            return NextResponse.json(
                { error: 'Ya existe un área con este nombre' },
                { status: 409 }
            );
        }

        // Crear la nueva área
        const newArea = await prisma.area.create({
            data: {
                name,
                description: description || null,
                status: 'ACTIVE'
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Área creada exitosamente',
                data: newArea
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error al crear área:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Error interno del servidor' 
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Construir filtros dinámicos
        const where: any = {};
        
        if (status) {
            where.status = status;
        } else {
            // Por defecto, mostrar solo áreas activas
            where.status = 'ACTIVE';
        }

        const areas = await prisma.area.findMany({
            where,
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: areas,
            count: areas.length
        });
    } catch (error) {
        console.error('Error al obtener áreas:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las áreas'
            },
            { status: 500 }
        );
    }
} 