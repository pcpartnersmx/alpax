import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jsPDF from 'jspdf';

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

        const body = await request.json();
        const { product, orders, generatedAt } = body;

        if (!product || !orders) {
            return NextResponse.json(
                { success: false, error: 'Datos requeridos faltantes' },
                { status: 400 }
            );
        }

        // Crear el PDF con jsPDF
        const doc = new jsPDF();
        
        // Configurar fuentes y colores
        const primaryColor = [42, 49, 130]; // #2A3182
        const secondaryColor = [139, 139, 139]; // #8B8B8B
        
        // Título principal
        doc.setFontSize(20);
        doc.setTextColor(...primaryColor);
        doc.text('Reporte de Pedidos por Producto', 105, 20, { align: 'center' });
        
        // Fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado el: ${generatedAt}`, 105, 30, { align: 'center' });
        
        let yPosition = 45;
        
        // Información del producto
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('Información del Producto', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Tabla de información del producto
        const productInfo = [
            ['Código:', product.code],
            ['Nombre:', product.name],
            ['Área:', product.area],
            ['Descripción:', product.description || 'Sin descripción']
        ];
        
        productInfo.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, 20, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(value, 50, yPosition);
            yPosition += 6;
        });
        
        yPosition += 10;
        
        // Sección de pedidos
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('Pedidos que contienen este producto', 20, yPosition);
        yPosition += 10;
        
        if (orders.length > 0) {
            // Encabezados de la tabla
            doc.setFillColor(...primaryColor);
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            
            const headers = ['Número', 'Estado', 'Cantidad', 'Fecha'];
            const columnWidths = [40, 35, 25, 35];
            let xPosition = 20;
            
            headers.forEach((header, index) => {
                doc.rect(xPosition, yPosition - 5, columnWidths[index], 8, 'F');
                doc.text(header, xPosition + 2, yPosition);
                xPosition += columnWidths[index];
            });
            
            yPosition += 8;
            
            // Datos de los pedidos
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
            
            orders.forEach((order: any, index: number) => {
                // Verificar si hay espacio suficiente en la página
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                const productItem = order.orderItems.find((item: any) => item.productId === product.id);
                
                // Estado con color
                const statusText = order.status === 'PENDING' ? 'PENDIENTE' :
                                 order.status === 'IN_PROGRESS' ? 'EN PROCESO' :
                                 order.status === 'COMPLETED' ? 'COMPLETADO' : 'CANCELADO';
                
                let statusColor;
                switch (order.status) {
                    case 'PENDING':
                        statusColor = [254, 243, 199]; // Amarillo claro
                        break;
                    case 'IN_PROGRESS':
                        statusColor = [219, 234, 254]; // Azul claro
                        break;
                    case 'COMPLETED':
                        statusColor = [209, 250, 229]; // Verde claro
                        break;
                    default:
                        statusColor = [254, 226, 226]; // Rojo claro
                }
                
                // Fila de datos
                xPosition = 20;
                doc.text(order.orderNumber, xPosition + 2, yPosition);
                xPosition += 40;
                
                // Estado con fondo de color
                doc.setFillColor(...statusColor);
                doc.rect(xPosition, yPosition - 3, 35, 6, 'F');
                doc.setTextColor(0, 0, 0);
                doc.text(statusText, xPosition + 2, yPosition);
                xPosition += 35;
                
                doc.text((productItem?.quantity || 0).toString(), xPosition + 2, yPosition);
                xPosition += 25;
                
                doc.text(new Date(order.createdAt).toLocaleDateString('es-ES'), xPosition + 2, yPosition);
                
                yPosition += 8;
            });
        } else {
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'italic');
            doc.text('No hay pedidos que contengan este producto', 20, yPosition);
        }
        
        // Pie de página
        yPosition += 15;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Reporte generado automáticamente por el sistema', 105, yPosition, { align: 'center' });
        yPosition += 5;
        doc.text(`Total de pedidos: ${orders.length}`, 105, yPosition, { align: 'center' });
        
        // Generar el PDF como buffer
        const pdfBuffer = doc.output('arraybuffer');
        
        // Devolver el PDF como respuesta
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="pedidos-${product.code}-${new Date().toISOString().split('T')[0]}.pdf"`
            }
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 