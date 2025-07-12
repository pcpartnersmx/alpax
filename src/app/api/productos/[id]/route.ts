import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Obtener un producto específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        area: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Producto no encontrado',
          message: 'El producto con el ID especificado no existe'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el producto'
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un producto específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, area, description } = body;

    // Validación de campos requeridos
    if (!name || !code || !area) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Los campos nombre, código y área son requeridos'
        },
        { status: 400 }
      );
    }

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Producto no encontrado',
          message: 'El producto con el ID especificado no existe'
        },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro producto con el mismo código
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        code,
        id: { not: id }
      }
    });

    if (duplicateProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ya existe un producto con este código'
        },
        { status: 409 }
      );
    }

    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        code,
        area,
        description: description || null
      },
      select: {
        id: true,
        name: true,
        code: true,
        area: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el producto'
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un producto específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Producto no encontrado',
          message: 'El producto con el ID especificado no existe'
        },
        { status: 404 }
      );
    }

    // Eliminar el producto
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar el producto'
      },
      { status: 500 }
    );
  }
} 