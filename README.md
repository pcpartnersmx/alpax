# Alpax - Sistema de Gestión de Pedidos

Este es un proyecto [Next.js](https://nextjs.org) que incluye funcionalidades de análisis de PDF usando OpenAI.

## Características

- **Análisis de PDF**: Extrae texto de archivos PDF y los analiza usando OpenAI GPT-4
- **Gestión de Pedidos**: Sistema completo de gestión de pedidos y productos
- **Autenticación**: Sistema de autenticación con NextAuth
- **Base de Datos**: Integración con Prisma y PostgreSQL

## Configuración del Entorno

### Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/alpax"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (requerido para análisis de PDF)
OPENAI_API_KEY="tu-openai-api-key-aqui"
```

### Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú lateral
4. Crea una nueva API key
5. Copia la key y agrégala a tu archivo `.env.local`

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar la base de datos
npm run db:push

# Ejecutar el servidor de desarrollo
npm run dev
```

## Uso

### Análisis de PDF

1. Ve a `http://localhost:3000/test-pdf`
2. Sube un archivo PDF
3. El sistema extraerá el texto y lo analizará con OpenAI
4. Verás los resultados estructurados (número de orden y productos)

### API Endpoints

- `POST /api/pedido/pdf` - Analiza un archivo PDF
- `GET /api/pedido/pdf-generate` - Endpoint de prueba

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/pedido/pdf/          # API para análisis de PDF
│   ├── components/              # Componentes React
│   └── test-pdf/               # Página de prueba
├── lib/
│   ├── auth.ts                 # Configuración de autenticación
│   └── db.ts                   # Configuración de base de datos
└── types/                      # Tipos TypeScript
```

## Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **NextAuth** - Autenticación
- **OpenAI API** - Análisis de texto con IA
- **Tailwind CSS** - Estilos
- **pdf-parse** - Extracción de texto de PDF

## Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint
```
