# Taller de motos - arquitectura empresarial PAVAS

Migración del MVP de alistamientos y reparaciones a la plantilla empresarial suministrada. Conserva los requerimientos de las fases 1 y 2: clientes, motos, órdenes, ítems, flujo de estados, historial, JWT, roles y gestión de usuarios.

## Arquitectura

```text
client/
  src/
    api/                    Cliente HTTP y contratos de autenticación
    contexts/               Estado global de sesión
    layout/                 Shell empresarial (header, menú y sidebar)
    routes/                 Rutas públicas y privadas
    views/workshop/         Pantallas, componentes y servicios del taller
server/
  src/
    common/                 Configuración, middleware y utilidades transversales
    modules/auth/           Autenticación y usuarios (route/controller/service)
    modules/workshop/
      clients/              Clientes (route/controller/service)
      bikes/                Motos (route/controller/service)
      work-orders/          Órdenes, ítems e historial (route/controller/service)
database/
  taller_motos.sql          Esquema MySQL completo
```

## Requisitos

- Node.js 20
- MySQL 8

## Base de datos

Ejecuta `database/taller_motos.sql` en MySQL. El script crea la base `taller_motos`, sus relaciones, restricciones e índices.

## Servidor

```bash
cd server
copy .env.template .env
pnpm install
pnpm run seed
pnpm run dev
```

El servidor queda disponible en `http://localhost:4000`. Verificación:

```bash
curl http://localhost:4000/api/health
```

El seed crea el administrador inicial:

- Email: `admin@taller.com`
- Contraseña: `admin1234`

Estas credenciales deben cambiarse en un entorno real.

## Cliente

```bash
cd client
copy .env.template .env
pnpm install
pnpm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Variables de entorno

Servidor:

- `PORT`
- `CLIENT_URL`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Cliente:

- `VITE_API_URL`
- `VITE_APP_BASE_NAME`

## API principal

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/register` (ADMIN)
- `GET /api/auth/users` (ADMIN)
- `PATCH /api/auth/users/:id` (ADMIN)
- `POST /api/clients`
- `GET /api/clients?search=`
- `GET /api/clients/:id`
- `POST /api/bikes`
- `GET /api/bikes?plate=`
- `GET /api/bikes/:id`
- `POST /api/work-orders`
- `GET /api/work-orders?status=&plate=&page=&pageSize=`
- `GET /api/work-orders/:id`
- `PATCH /api/work-orders/:id/status`
- `GET /api/work-orders/:id/history`
- `POST /api/work-orders/:id/items`
- `DELETE /api/work-orders/items/:itemId`

Todos los endpoints de negocio requieren autenticación. Un usuario `MECANICO` no puede entregar ni cancelar órdenes; un `ADMIN` puede gestionar usuarios y ejecutar todas las transiciones válidas.
