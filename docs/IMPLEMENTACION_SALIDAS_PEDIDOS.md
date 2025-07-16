# Implementación de Salidas con Pedidos

Esta documentación describe la implementación de la funcionalidad que permite que las salidas (lotes) llenen los pedidos automáticamente.

## Descripción General

El sistema ahora permite asignar salidas de productos a pedidos específicos, rastreando las cantidades completadas y actualizando automáticamente el estado de los pedidos.

## Cambios en la Base de Datos

### Nuevos Campos

1. **OrderItem.completedQuantity**: Campo que rastrea cuánto se ha completado de cada item del pedido
2. **BatchItem.orderItemId**: Relación opcional que conecta una salida con un item de pedido específico

### Relaciones

- Un `BatchItem` puede estar asignado a un `OrderItem` específico
- Un `OrderItem` puede tener múltiples `BatchItem` asignados (a través de la relación inversa)

## Endpoints de API

### 1. Asignar Salida a Pedido

**PUT** `/api/lotes`

Asigna una salida específica a un pedido y actualiza las cantidades completadas.

#### Request Body
```json
{
  "batchItemId": "batch-item-id",
  "orderItemId": "order-item-id", 
  "quantity": 100
}
```

#### Validaciones
- Los productos del lote y del pedido deben coincidir
- La cantidad no puede exceder lo disponible en el lote
- La cantidad no puede exceder lo pendiente del pedido

#### Response
```json
{
  "success": true,
  "data": {
    "batchItem": { /* item del lote actualizado */ },
    "orderItem": { /* item del pedido actualizado */ },
    "isOrderComplete": true
  },
  "message": "Salida asignada al pedido exitosamente"
}
```

### 2. Obtener Pedidos Pendientes

**GET** `/api/pedido/pending`

Obtiene los pedidos pendientes que pueden ser llenados por una salida específica.

#### Query Parameters
- `productId` (requerido): ID del producto
- `batchItemId` (opcional): ID del item del lote

#### Response
```json
{
  "success": true,
  "data": {
    "pendingOrders": [
      {
        "id": "order-id",
        "orderNumber": "PED-001",
        "status": "PENDING",
        "orderItems": [
          {
            "id": "order-item-id",
            "quantity": 100,
            "completedQuantity": 50,
            "product": { /* información del producto */ }
          }
        ]
      }
    ],
    "batchItemInfo": { /* información del lote */ }
  }
}
```

## Funcionalidad en el Frontend

### Página Principal (Salidas)

1. **Nueva Columna**: Se agregó una columna "ASIGNAR A PEDIDO" con un ícono de enlace
2. **Modal de Asignación**: Al hacer clic en el ícono, se abre un modal que permite:
   - Ver información de la salida seleccionada
   - Seleccionar un pedido pendiente del mismo producto
   - Especificar la cantidad a asignar
   - Confirmar la asignación

### Creación de Salidas (Asignación Automática)

1. **Modal de Resumen**: Después de crear una salida, si hay asignaciones automáticas:
   - Se muestra un modal con el resumen completo de asignaciones
   - Detalle por producto con cantidades asignadas y restantes
   - Lista de pedidos que fueron llenados con sus cantidades
   - Información sobre unidades sin asignar (si las hay)
2. **Notificación Toast**: Mensaje de éxito con resumen de asignaciones

### Página de Pedidos

1. **Columna Actualizada**: La columna "FABRICACIÓN" ahora se llama "COMPLETADO"
2. **Cálculo de Restante**: Se calcula automáticamente la cantidad restante (pedido - completado)
3. **Colores Dinámicos**: 
   - Verde: Pedido completamente lleno
   - Amarillo: Pedido parcialmente lleno
   - Rojo: Error en el cálculo

## Flujo de Trabajo

### Asignación Manual (Opcional)
1. **Crear Pedido**: Se crea un pedido con items específicos
2. **Crear Salida**: Se crea una salida (lote) con productos
3. **Asignar Salida**: Se asigna manualmente la salida a un pedido específico
4. **Actualización Automática**: 
   - Se actualiza la cantidad completada del pedido
   - Se cambia el estado del pedido (PENDING → IN_PROGRESS → COMPLETED)
   - Se crea un log de la acción

### Asignación Automática (Recomendado)
1. **Crear Pedido**: Se crea un pedido con items específicos
2. **Crear Salida**: Se crea una salida (lote) con productos
3. **Asignación Automática**: 
   - El sistema automáticamente busca pedidos pendientes del mismo producto
   - Asigna las cantidades disponibles a los pedidos más antiguos primero
   - Actualiza las cantidades completadas y estados de pedidos
   - Muestra un resumen detallado de las asignaciones realizadas
   - Crea logs de todas las asignaciones automáticas

## Estados de Pedido

- **PENDING**: Pedido creado, sin items completados
- **IN_PROGRESS**: Al menos un item tiene cantidad completada
- **COMPLETED**: Todos los items están completamente llenos
- **CANCELLED**: Pedido cancelado

## Logs del Sistema

Todas las asignaciones se registran en la tabla `Log` con:
- **Asignación Manual**: Acción `ASSIGN_BATCH_TO_ORDER`
- **Asignación Automática**: Acción `AUTO_ASSIGN_BATCH_TO_ORDER`
- Descripción detallada de la asignación
- Cantidad asignada
- Referencias al pedido, lote y producto

## Validaciones de Negocio

1. **Coincidencia de Productos**: Solo se pueden asignar salidas del mismo producto al pedido
2. **Cantidades Disponibles**: No se puede asignar más de lo disponible en el lote
3. **Cantidades Pendientes**: No se puede asignar más de lo pendiente del pedido
4. **Estados de Pedido**: Solo se pueden asignar a pedidos en estado PENDING o IN_PROGRESS

## Hook Personalizado

Se creó el hook `useAssignments` que proporciona:
- `getPendingOrders`: Obtener pedidos pendientes
- `assignBatchToOrder`: Asignar salida a pedido
- Manejo de estados de carga y errores

## Próximos Pasos

1. **Interfaz Mejorada**: Agregar notificaciones toast en lugar de alerts ✅
2. **Validaciones Frontend**: Validar cantidades antes de enviar al servidor
3. **Historial de Asignaciones**: Mostrar qué salidas han llenado cada pedido
4. **Reportes**: Generar reportes de eficiencia de llenado de pedidos
5. **Búsqueda Avanzada**: Filtrar salidas por pedidos asignados
6. **Configuración de Asignación**: Permitir configurar si se desea asignación automática o manual
7. **Priorización de Pedidos**: Permitir configurar reglas de priorización personalizadas 