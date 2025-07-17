import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { batchData, items } = body;

        // Crear nuevo documento PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Configurar fuente y tamaños
        doc.setFont('helvetica');
        
        // Dimensiones de la página A4
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        let yPosition = margin;

        // Título del formato (izquierda)
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('FORMATO DE REGISTROS DE OPERACIÓN', margin, yPosition);
        yPosition += 8;

        // Título principal
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('SALIDA DE PRODUCTO TERMINADO', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Información del proveedor (izquierda)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('PROVEEDOR 4', margin, yPosition);
        yPosition += 5;
        doc.text('CÓDIGO: FAL-018', margin, yPosition);
        yPosition += 5;
        doc.text('No. Revisión: 02', margin, yPosition);
        yPosition += 8;

        // Departamento y página (derecha)
        doc.text('DEPARTAMENTO: ALMACÉN DE PRODUCTO TERMINADO', margin + 80, yPosition - 8);
        doc.text('PAGINA: 1', margin + 80, yPosition - 3);
        yPosition += 5;

        // Fechas
        const currentDate = new Date();
        const issueDate = currentDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        }).toUpperCase();
        const nextRevision = new Date(currentDate.getFullYear() + 4, currentDate.getMonth(), currentDate.getDate())
            .toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }).toUpperCase();

        doc.text(`FECHA DE EMISIÓN: ${currentDate.getDate().toString().padStart(2, '0')} - ${issueDate.split(' ')[1]}-${currentDate.getFullYear()}`, margin, yPosition);
        yPosition += 5;
        doc.text(`FECHA DE APLICACIÓN: ${currentDate.getDate().toString().padStart(2, '0')}- ${issueDate.split(' ')[1]}-${currentDate.getFullYear()}`, margin, yPosition);
        yPosition += 5;
        doc.text(`PRÓXIMA REVISIÓN: ${currentDate.getDate().toString().padStart(2, '0')}- ${nextRevision.split(' ')[1]}-${currentDate.getFullYear() + 4}`, margin, yPosition);
        yPosition += 8;

        // Elaborador
        doc.text('ELABORO: Q. PATRICIA AGUADO M.', margin, yPosition);
        yPosition += 15;

        // Fecha y folio
        const folioNumber = Math.floor(Math.random() * 999) + 1;
        const folioYear = currentDate.getFullYear().toString().slice(-2);
        doc.text(`FECHA: ${currentDate.getDate()} ${currentDate.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()} ${currentDate.getFullYear()}`, margin, yPosition);
        doc.text(`FOLIO: N ${folioNumber.toString().padStart(3, '0')}-${folioYear}`, pageWidth - margin - 40, yPosition);
        yPosition += 10;

        // Cliente (centrado)
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE: DESARROLLOS SERYSI S DE RL DE CV', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Tabla de productos
        const tableStartY = yPosition;
        const tableHeaders = ['PRODUCTO', 'CLAVE', 'NO. DE LOTE', 'CANTIDAD', 'NO. CONTENEDORES', 'NO. DE PEDIDO'];
        const columnWidths = [40, 25, 30, 25, 35, 30];
        const columnPositions = [margin];
        
        // Calcular posiciones de columnas
        for (let i = 1; i < columnWidths.length; i++) {
            columnPositions.push(columnPositions[i-1] + columnWidths[i-1]);
        }

        // Encabezados de tabla
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        
        tableHeaders.forEach((header, index) => {
            doc.text(header, columnPositions[index], tableStartY);
        });

        // Línea debajo de encabezados
        yPosition += 5;
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        // Datos de productos
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        items.forEach((item: any, index: number) => {
            const rowData = [
                item.productName || 'PRODUCTO',
                item.productCode || 'CLAVE',
                item.lote || 'LOTE',
                item.quantity ? item.quantity.toString() : '0',
                item.containers ? item.containers.join(', ') : 'CONTENEDORES',
                item.orderNumber || 'PEDIDO'
            ];

            rowData.forEach((cell, colIndex) => {
                doc.text(cell, columnPositions[colIndex], yPosition);
            });
            
            yPosition += 6;
        });

        // Agregar líneas horizontales para completar la tabla
        const tableEndY = yPosition + 2;
        doc.line(margin, tableStartY + 3, pageWidth - margin, tableStartY + 3); // Línea superior
        doc.line(margin, tableEndY, pageWidth - margin, tableEndY); // Línea inferior
        
        // Líneas verticales
        columnPositions.forEach((x, index) => {
            if (index === 0) {
                doc.line(x, tableStartY + 3, x, tableEndY); // Primera línea
            }
            if (index < columnPositions.length - 1) {
                doc.line(columnPositions[index + 1], tableStartY + 3, columnPositions[index + 1], tableEndY);
            }
        });

        yPosition = tableEndY + 20;

        // Footer con firmas y observaciones
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ENTREGÓ:', margin, yPosition);
        doc.text('RECIBIÓ:', pageWidth - margin - 30, yPosition);
        yPosition += 8;

        // Líneas para firmas
        doc.line(margin, yPosition, margin + 40, yPosition);
        doc.line(pageWidth - margin - 50, yPosition, pageWidth - margin - 10, yPosition);
        yPosition += 15;

        // Observaciones
        doc.text('OBSERVACIONES:', margin, yPosition);
        yPosition += 5;
        doc.line(margin, yPosition, pageWidth - margin, yPosition);

        // Generar el PDF
        const pdfBuffer = doc.output('arraybuffer');
        
        // Crear respuesta con el PDF
        const response = new NextResponse(pdfBuffer);
        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set('Content-Disposition', `attachment; filename="salida-producto-${batchData.batchNumber || 'terminado'}-${new Date().toISOString().split('T')[0]}.pdf"`);

        return response;

    } catch (error) {
        console.error('Error generando PDF:', error);
        return NextResponse.json(
            { success: false, error: 'Error al generar el PDF' },
            { status: 500 }
        );
    }
} 