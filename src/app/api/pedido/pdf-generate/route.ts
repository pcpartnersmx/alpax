import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simular un texto de PDF para testing
        const mockPdfText = `
        ORDEN DE COMPRA
        Número de Orden: 200
        Fecha: 2024-01-15
        
        PRODUCTOS:
        - Código: S039, Cantidad: 7342 unidades
        - Código: S040, Cantidad: 1500 unidades
        - Código: S041, Cantidad: 2500 unidades
        
        Total: 11342 unidades
        `;

        return NextResponse.json({
            success: true,
            message: 'Endpoint de prueba creado',
            mockText: mockPdfText,
            instructions: 'Usa este endpoint para probar la funcionalidad de análisis de PDF'
        });
    } catch (error) {
        console.error('Error en endpoint de prueba:', error);
        return NextResponse.json({ success: false, error: 'Error en endpoint de prueba' }, { status: 500 });
    }
} 