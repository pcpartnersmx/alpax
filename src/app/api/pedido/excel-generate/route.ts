import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { generatedAt } = body;

        // Obtener todos los productos con sus áreas
        const products = await prisma.product.findMany({
            include: {
                area: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Obtener todos los pedidos con sus items
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                orderNumber: 'asc'
            }
        });

        // Verificar si hay datos
        if (products.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No hay productos disponibles' },
                { status: 404 }
            );
        }

        // Crear un nuevo workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Resumen de Pedidos');

        // Configurar el título principal
        const titleRow = worksheet.addRow(['Suma de Cantidad Pedido']);
        titleRow.height = 25;
        titleRow.getCell(1).font = { bold: true, size: 14 };
        titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        titleRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6E6' }
        };

        // Merge de celdas para el título
        worksheet.mergeCells('A1:' + String.fromCharCode(65 + 1 + orders.length) + '1');

        // Crear encabezados
        const headerRow = ['PRODUCTO', 'DPTO.'];
        orders.forEach(order => {
            headerRow.push(order.orderNumber.toString());
        });
        
        const header = worksheet.addRow(headerRow);
        header.height = 20;

        // Aplicar estilos al encabezado
        header.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDEBF7' } // Color azul claro
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Agregar datos de productos
        products.forEach(product => {
            const productRow = [product.name, product.area.name];
            
            // Para cada pedido, buscar la cantidad de este producto
            orders.forEach(order => {
                const orderItem = order.orderItems.find(item => item.productId === product.id);
                const quantity = orderItem ? orderItem.quantity : 0;
                productRow.push(quantity);
            });
            
            const row = worksheet.addRow(productRow);
            
            // Aplicar estilos a las celdas de datos
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };
                
                // Alineación específica para números
                if (colNumber > 2) {
                    cell.alignment = { horizontal: 'right' };
                } else {
                    cell.alignment = { horizontal: 'left' };
                }
            });
        });

        // Agregar fila de totales por pedido
        const totalRow = ['TOTAL', ''];
        
        // Calcular totales por pedido
        orders.forEach(order => {
            const totalQuantity = order.orderItems.reduce((total, item) => total + item.quantity, 0);
            totalRow.push(totalQuantity);
        });
        
        const totalRowData = worksheet.addRow(totalRow);
        totalRowData.height = 20;
        
        // Aplicar estilos a la fila de totales
        totalRowData.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDEBF7' } // Mismo color azul claro del encabezado
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            // Alineación específica para números
            if (colNumber > 2) {
                cell.alignment = { horizontal: 'right' };
            } else {
                cell.alignment = { horizontal: 'left' };
            }
        });

        // Ajustar ancho de columnas
        worksheet.getColumn(1).width = 40; // PRODUCTO
        worksheet.getColumn(2).width = 15; // DPTO.
        
        // Ajustar ancho para las columnas de pedidos
        for (let i = 3; i <= 2 + orders.length; i++) {
            worksheet.getColumn(i).width = 12;
        }

        // Generar el buffer del Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // Crear la respuesta con el archivo Excel
        const response = new NextResponse(buffer);
        response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.headers.set('Content-Disposition', `attachment; filename="resumen-pedidos-${new Date().toISOString().split('T')[0]}.xlsx"`);

        return response;

    } catch (error) {
        console.error('Error generando Excel:', error);
        return NextResponse.json(
            { success: false, error: 'Error al generar el archivo Excel' },
            { status: 500 }
        );
    }
} 