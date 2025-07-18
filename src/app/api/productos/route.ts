import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, code, areaId, description } = body;

        // Validación de campos requeridos
        if (!name || !code || !areaId) {
            return NextResponse.json(
                { error: 'Los campos nombre, código y área son requeridos' },
                { status: 400 }
            );
        }

        // Verificar si ya existe un producto con el mismo código
        const existingProduct = await prisma.product.findUnique({
            where: { code }
        });

        if (existingProduct) {
            return NextResponse.json(
                { error: 'Ya existe un producto con este código' },
                { status: 409 }
            );
        }

        // Verificar si el área existe
        const area = await prisma.area.findUnique({
            where: { id: areaId }
        });

        if (!area) {
            return NextResponse.json(
                { error: 'El área seleccionada no existe' },
                { status: 400 }
            );
        }

        // Crear el nuevo producto
        const newProduct = await prisma.product.create({
            data: {
                name,
                code,
                areaId,
                description: description || null
            },
            include: {
                area: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Transformar el producto para compatibilidad con el frontend
        const transformedProduct = {
            id: newProduct.id,
            name: newProduct.name,
            code: newProduct.code,
            area: newProduct.area?.name,
            areaId: newProduct.areaId,
            description: newProduct.description,
            quantity: newProduct.quantity, // <-- AÑADIDO
            createdAt: newProduct.createdAt,
            updatedAt: newProduct.updatedAt
        };

        return NextResponse.json(
            {
                success: true,
                message: 'Producto creado exitosamente',
                data: transformedProduct
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error al crear producto:', error);
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
        const areaId = searchParams.get('areaId');
        const code = searchParams.get('code');
        const name = searchParams.get('name');

        // Construir filtros dinámicos
        const where: any = {};
        
        if (areaId) {
            where.areaId = areaId;
        }
        
        if (code) {
            where.code = code;
        }
        
        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive'
            };
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                area: {
                    select: {
                        id: true,
                        name: true,
                        
                    }
                }
            }
        });

        // Transformar los datos para mantener compatibilidad con el frontend
        const transformedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            code: product.code,
            area: product?.area?.name, // Mantener el nombre del área para compatibilidad
            areaId: product.areaId,
            description: product.description,
            quantity: product.quantity, // <-- AÑADIDO
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));

        return NextResponse.json({
            success: true,
            data: transformedProducts,
            count: transformedProducts.length
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos'
            },
            { status: 500 }
        );
    }
} 