# API de Lotes (Salidas)

Este documento describe los endpoints disponibles para manejar los lotes (salidas) en el sistema.

## Endpoints

### POST /api/lotes

Crea un nuevo lote con sus productos y contenedores.

#### Request Body

```json
{
  "batchNumber": "LOTE-001",
  "name": "Lote de Productos A",
  "description": "Descripción opcional del lote",
  "items": [
    {
      "productId": "product-id-1",
      "quantity": 100
    },
    {
      "productId": "product-id-2", 
      "quantity": 50
    }
  ],
  "containers": ["CONT-001", "CONT-002"]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "batch-id",
    "batchNumber": "LOTE-001",
    "name": "Lote de Productos A",
    "description": "Descripción opcional del lote",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "batchItems": [
      {
        "id": "item-id-1",
        "quantity": 100,
        "product": {
          "id": "product-id-1",
          "name": "Producto A",
          "code": "PROD-001",
          "area": {
            "name": "Área 1"
          }
        }
      }
    ],
    "containers": [
      {
        "id": "container-id-1",
        "containerCode": "CONT-001",
        "name": "Contenedor CONT-001",
        "status": "ACTIVE"
      }
    ]
  },
  "message": "Lote creado exitosamente"
}
```

### GET /api/lotes

Obtiene la lista de lotes con paginación y filtros.

#### Query Parameters

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `status` (opcional): Filtrar por estado (ACTIVE, INACTIVE, DEPLETED)
- `batchNumber` (opcional): Buscar por número de lote

#### Response

```json
{
  "success": true,
  "data": {
    "batches": [
      {
        "id": "batch-id",
        "batchNumber": "LOTE-001",
        "name": "Lote de Productos A",
        "status": "ACTIVE",
        "batchItems": [...],
        "containers": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### GET /api/lotes/[id]

Obtiene un lote específico por su ID.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "batch-id",
    "batchNumber": "LOTE-001",
    "name": "Lote de Productos A",
    "description": "Descripción del lote",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "batchItems": [...],
    "containers": [...]
  }
}
```

## Estados de Lote

- `ACTIVE`: Lote activo y disponible
- `INACTIVE`: Lote inactivo
- `DEPLETED`: Lote agotado

## Estados de Contenedor

- `ACTIVE`: Contenedor activo
- `INACTIVE`: Contenedor inactivo
- `DAMAGED`: Contenedor dañado

## Autenticación

Todos los endpoints requieren autenticación mediante NextAuth. El usuario debe estar autenticado para acceder a estos endpoints.

## Errores

Los endpoints devuelven errores en el siguiente formato:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Códigos de Error Comunes

- `400`: Datos inválidos o faltantes
- `401`: No autorizado
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Ejemplos de Uso

### Crear un Lote

```javascript
const response = await fetch('/api/lotes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    batchNumber: 'LOTE-2024-001',
    name: 'Lote de Inicio de Año',
    description: 'Lote creado para el inicio del año 2024',
    items: [
      {
        productId: 'product-1',
        quantity: 100
      }
    ],
    containers: ['CONT-001', 'CONT-002']
  })
});

const data = await response.json();
```

### Obtener Lotes

```javascript
const response = await fetch('/api/lotes?page=1&limit=10&status=ACTIVE');
const data = await response.json();
```

### Obtener un Lote Específico

```javascript
const response = await fetch('/api/lotes/batch-id');
const data = await response.json();
``` 