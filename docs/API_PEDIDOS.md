# API de Pedidos

Esta documentación describe los endpoints disponibles para gestionar pedidos en el sistema.

## Endpoints

### 1. Crear Pedido

**POST** `/api/pedido`

Crea un nuevo pedido con sus items correspondientes.

#### Request Body
```json
{
  "orderNumber": "PED-001",
  "items": [
    {
      "productId": "product_id_1",
      "quantity": 10
    },
    {
      "productId": "product_id_2", 
      "quantity": 5
    }
  ],
  "pdfUrl": "/uploads/documento.pdf" // Opcional
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "orderNumber": "PED-001",
    "type": "MANUAL",
    "status": "PENDING",
    "totalAmount": 15.00,
    "pdfUrl": "/uploads/documento.pdf",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user_id",
      "name": "Usuario",
      "email": "usuario@ejemplo.com"
    },
    "orderItems": [
      {
        "id": "item_id_1",
        "productId": "product_id_1",
        "quantity": 10,
        "unitPrice": 1.00,
        "totalPrice": 10.00,
        "product": {
          "id": "product_id_1",
          "name": "Producto 1",
          "code": "PROD-001",
          "area": {
            "id": "area_id",
            "name": "Área 1"
          }
        }
      }
    ]
  },
  "message": "Pedido creado exitosamente"
}
```

### 2. Obtener Pedidos

**GET** `/api/pedido`

Obtiene una lista paginada de pedidos con filtros opcionales.

#### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `status` (opcional): Filtrar por estado (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `orderNumber` (opcional): Buscar por número de pedido

#### Ejemplo
```
GET /api/pedido?page=1&limit=20&status=PENDING&orderNumber=PED
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "orderNumber": "PED-001",
      "type": "MANUAL",
      "status": "PENDING",
      "totalAmount": 15.00,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "name": "Usuario",
        "email": "usuario@ejemplo.com"
      },
      "orderItems": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 3. Obtener Pedido por ID

**GET** `/api/pedido/{id}`

Obtiene un pedido específico con todos sus detalles.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "orderNumber": "PED-001",
    "type": "MANUAL",
    "status": "PENDING",
    "totalAmount": 15.00,
    "orderNotes": "Notas del pedido",
    "pdfUrl": "/uploads/documento.pdf",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user_id",
      "name": "Usuario",
      "email": "usuario@ejemplo.com"
    },
    "orderItems": [...],
    "notes": [...],
    "logs": [...]
  }
}
```

### 4. Actualizar Pedido

**PUT** `/api/pedido/{id}`

Actualiza el estado o notas de un pedido existente.

#### Request Body
```json
{
  "status": "IN_PROGRESS", // Opcional
  "orderNotes": "Nuevas notas del pedido" // Opcional
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "orderNumber": "PED-001",
    "status": "IN_PROGRESS",
    "orderNotes": "Nuevas notas del pedido",
    // ... resto de datos del pedido
  },
  "message": "Pedido actualizado exitosamente"
}
```

### 5. Eliminar Pedido

**DELETE** `/api/pedido/{id}`

Elimina un pedido y todos sus items asociados.

#### Response
```json
{
  "success": true,
  "message": "Pedido eliminado exitosamente"
}
```

## Estados de Pedido

- `PENDING`: Pedido pendiente de procesamiento
- `IN_PROGRESS`: Pedido en proceso
- `COMPLETED`: Pedido completado
- `CANCELLED`: Pedido cancelado

## Tipos de Pedido

- `MANUAL`: Pedido creado manualmente por el usuario
- `AI_GENERATED`: Pedido generado automáticamente por IA

## Autenticación

Todos los endpoints requieren autenticación mediante NextAuth. El usuario debe estar autenticado para acceder a estos endpoints.

## Manejo de Errores

Todos los endpoints devuelven errores en el siguiente formato:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Códigos de Estado HTTP

- `200`: Operación exitosa
- `400`: Datos inválidos o faltantes
- `401`: No autorizado
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Logs

El sistema automáticamente registra logs para las siguientes acciones:
- Creación de pedidos
- Actualización de pedidos
- Eliminación de pedidos

Los logs incluyen información sobre el usuario que realizó la acción, la descripción de la acción y referencias a los recursos afectados. 