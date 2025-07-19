import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { batchData, items } = body;

        // Crear nuevo documento PDF
        const doc = new jsPDF();

        const pageWidth = 210;
        const margin = 10;
        const cellHeight = 10;

        // Calcular el ancho total de las columnas del encabezado
        const col1Width = 65;
        const col2Width = 25;
        const col3Width = 35;
        const col4Width = 55;
        const totalHeaderWidth = col1Width + col2Width + col3Width + col4Width;
        
        // Centrar la tabla del encabezado
        const headerStartX = (pageWidth - totalHeaderWidth) / 2;
        let startY = 20;

        // === PRIMERA FILA DEL ENCABEZADO ===

        // Celda 1: FORMATO DE REGISTROS DE OPERACIÓN
        doc.rect(headerStartX, startY, col1Width, cellHeight);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text('FORMATO DE REGISTROS DE OPERACIÓN', headerStartX + 2, startY + 6);

        // Celda 2: PROVEEDOR 4
        doc.rect(headerStartX + col1Width, startY, col2Width, cellHeight);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('PROVEEDOR 4', headerStartX + col1Width + 2, startY + 6);

        // Celda 3: DEPARTAMENTO
        doc.rect(headerStartX + col1Width + col2Width, startY, col3Width, cellHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text('DEPARTAMENTO:', headerStartX + col1Width + col2Width + 2, startY + 4);
        doc.setFontSize(5.5);
        doc.text('ALMACÉN DE', headerStartX + col1Width + col2Width + 2, startY + 7);
        doc.text('PRODUCTO TERMINADO', headerStartX + col1Width + col2Width + 2, startY + 10);

        // Celda 4-6: Fechas - Ajustar para que no se corten
        const subColWidth = col4Width / 3;
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

        const fechaLabels = ['FECHA DE EMISIÓN:', 'FECHA DE APLICACIÓN:', 'PRÓXIMA REVISIÓN:'];
        const fechaValues = [
            `${currentDate.getDate().toString().padStart(2, '0')} – ${issueDate.split(' ')[1]} – ${currentDate.getFullYear()}`,
            `${currentDate.getDate().toString().padStart(2, '0')} – ${issueDate.split(' ')[1]} – ${currentDate.getFullYear()}`,
            `${currentDate.getDate().toString().padStart(2, '0')} – ${nextRevision.split(' ')[1]} – ${currentDate.getFullYear() + 4}`
        ];

        for (let i = 0; i < 3; i++) {
            doc.rect(headerStartX + col1Width + col2Width + col3Width + i * subColWidth, startY, subColWidth, cellHeight);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            // Ajustar posición del texto para evitar que se corte
            const labelX = headerStartX + col1Width + col2Width + col3Width + i * subColWidth + 1;
            const valueX = headerStartX + col1Width + col2Width + col3Width + i * subColWidth + 1;
            
            // Truncar texto si es muy largo
            let label = fechaLabels[i];
            let value = fechaValues[i];
            
            if (label.length > 12) {
                label = label.substring(0, 12) + '...';
            }
            if (value.length > 15) {
                value = value.substring(0, 15) + '...';
            }
            
            doc.text(label, labelX, startY + 4);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(5.5);
            doc.text(value, valueX, startY + 8);
        }

        // === SEGUNDA FILA DEL ENCABEZADO ===
        startY += cellHeight;

        // SALIDA DE PRODUCTO TERMINADO
        doc.rect(headerStartX, startY, col1Width, cellHeight * 2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('SALIDA DE PRODUCTO', headerStartX + 5, startY + 7);
        doc.text('TERMINADO', headerStartX + 20, startY + 14);

        // CÓDIGO: FAL-018
        doc.rect(headerStartX + col1Width, startY, col2Width, cellHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text('CÓDIGO:', headerStartX + col1Width + 2, startY + 4);
        doc.setFont('helvetica', 'bold');
        doc.text('FAL-018', headerStartX + col1Width + 2, startY + 8);

        // PÁGINA: 1
        doc.rect(headerStartX + col1Width, startY + cellHeight, col2Width, cellHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text('PÁGINA:', headerStartX + col1Width + 2, startY + cellHeight + 4);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('1', headerStartX + col1Width + 2, startY + cellHeight + 8);

        // No. Revisión
        doc.rect(headerStartX + col1Width + col2Width, startY, col3Width, cellHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text('No. Revisión:', headerStartX + col1Width + col2Width + 2, startY + 4);
        doc.setFont('helvetica', 'bold');
        doc.text('02', headerStartX + col1Width + col2Width + 2, startY + 8);

        // Celda vacía
        doc.rect(headerStartX + col1Width + col2Width, startY + cellHeight, col3Width, cellHeight);

        // ELABORÓ
        doc.rect(headerStartX + col1Width + col2Width + col3Width, startY, col4Width, cellHeight * 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.text('ELABORÓ:', headerStartX + col1Width + col2Width + col3Width + 2, startY + 4);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('Q. PATRICIA AGUADO M.', headerStartX + col1Width + col2Width + col3Width + 2, startY + 10);

        // === CLIENTE ===
        startY += cellHeight * 2 + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('CLIENTE: DESARROLLOS SERYSI S DE RL DE CV', pageWidth / 2, startY, { align: 'center' });

        // === TABLA DE PRODUCTOS ===
        startY += 10;

        const headers = ['PRODUCTO', 'CLAVE', 'NO. DE LOTE', 'CANTIDAD', 'NO. CONTENEDORES', 'NO. DE PEDIDO'];
        
        // Usar el mismo ancho total que la tabla del encabezado
        const totalTableWidth = totalHeaderWidth;
        
        // Distribuir las columnas proporcionalmente dentro del mismo ancho
        // Definir proporciones relativas para cada columna
        const columnProportions = [0.25, 0.15, 0.20, 0.15, 0.15, 0.10]; // Suma = 1.0
        const finalColWidths = columnProportions.map(proportion => Math.floor(totalTableWidth * proportion));
        
        // Ajustar la última columna para que la suma sea exactamente igual al ancho total
        const currentSum = finalColWidths.reduce((sum, width) => sum + width, 0);
        finalColWidths[finalColWidths.length - 1] += (totalTableWidth - currentSum);
        
        const colX = [];
        
        // Centrar la tabla de productos usando el mismo punto de inicio que el encabezado
        colX[0] = headerStartX;
        for (let i = 1; i < finalColWidths.length; i++) {
            colX[i] = colX[i - 1] + finalColWidths[i - 1];
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);

        // Dibujar encabezado
        let y = startY;
        for (let i = 0; i < headers.length; i++) {
            doc.rect(colX[i], y, finalColWidths[i], cellHeight);
            // Truncar texto del encabezado si es muy largo
            let headerText = headers[i];
            if (headerText.length > 8) {
                headerText = headerText.substring(0, 8) + '...';
            }
            doc.text(headerText, colX[i] + 1, y + 6);
        }

        y += cellHeight;

        // Dibujar filas
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        for (const item of items) {
            // Preparar datos de la fila y truncar si es necesario
            const producto = (item.productName || 'PRODUCTO').substring(0, 15);
            const clave = (item.productCode || 'CLAVE').substring(0, 8);
            const lote = (item.lote || 'LOTE').substring(0, 10);
            const cantidad = (item.quantity ? item.quantity.toString() : '0').substring(0, 8);
            const contenedores = (item.containers ? item.containers.join(', ') : 'CONTENEDORES').substring(0, 15);
            const pedido = (item.orderNumber || 'PEDIDO').substring(0, 10);

            // Dibujar celdas
            doc.rect(colX[0], y, finalColWidths[0], cellHeight);
            doc.text(producto, colX[0] + 1, y + 6);
            
            doc.rect(colX[1], y, finalColWidths[1], cellHeight);
            doc.text(clave, colX[1] + 1, y + 6);
            
            doc.rect(colX[2], y, finalColWidths[2], cellHeight);
            doc.text(lote, colX[2] + 1, y + 6);
            
            doc.rect(colX[3], y, finalColWidths[3], cellHeight);
            doc.text(cantidad, colX[3] + 1, y + 6);
            
            doc.rect(colX[4], y, finalColWidths[4], cellHeight);
            doc.text(contenedores, colX[4] + 1, y + 6);
            
            doc.rect(colX[5], y, finalColWidths[5], cellHeight);
            doc.text(pedido, colX[5] + 1, y + 6);

            y += cellHeight;
        }

        // Dibujar dos filas vacías al final
        for (let i = 0; i < 2; i++) {
            for (let c = 0; c < colX.length; c++) {
                doc.rect(colX[c], y, finalColWidths[c], cellHeight);
            }
            y += cellHeight;
        }

        const lineWidth = 50;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);

        // === LÍNEA DE FIRMAS ===
        const yFirmas = startY + 80;
        doc.text('ENTREGÓ:', margin, yFirmas);
        doc.text('RECIBIÓ:', pageWidth / 2 + 10, yFirmas);

        // Dibujar líneas de firma
        doc.line(margin + 25, yFirmas - 2, margin + 25 + lineWidth, yFirmas - 2);
        doc.line(pageWidth / 2 + 30, yFirmas - 2, pageWidth / 2 + 30 + lineWidth, yFirmas - 2);

        // === OBSERVACIONES ===
        const yObs = yFirmas + 15;
        doc.text('OBSERVACIONES:', margin, yObs);
        doc.line(margin + 35, yObs - 2, pageWidth - margin, yObs - 2);

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