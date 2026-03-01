# 📚 Documentación Educativa — Sistema de Gestión de Reservas de Hotel

## 📋 Tabla de Contenidos

1. [¿Qué hace esta aplicación?](#1-qué-hace-esta-aplicación)
2. [Arquitectura por capas](#2-arquitectura-por-capas)
3. [Flujo de una petición HTTP](#3-flujo-de-una-petición-http)
4. [Autenticación JWT](#4-autenticación-jwt)
5. [Modelos y Base de Datos (Sequelize)](#5-modelos-y-base-de-datos-sequelize)
6. [Endpoints principales de la API](#6-endpoints-principales-de-la-api)
7. [CORS — Qué es y cómo está configurado](#7-cors--qué-es-y-cómo-está-configurado)
8. [Promise.all — Asincronicidad](#8-promiseall--asincronicidad)
9. [Docker y Docker Compose](#9-docker-y-docker-compose)
10. [Frontend — Las 8 vistas](#10-frontend--las-8-vistas)

---

## 1. ¿Qué hace esta aplicación?

Es un sistema para gestionar reservas en un hotel. Permite:

- **Iniciar sesión** con usuario y contraseña (JWT)
- **Gestionar huéspedes** (crear, listar, editar, eliminar)
- **Gestionar habitaciones** (crear, listar, editar, eliminar, filtrar por estado/tipo)
- **Crear reservas** (seleccionar huésped + habitación + fechas → calcula precio automáticamente)
- **Check-in / Check-out** individual o masivo (batch)
- **Operaciones masivas** con `Promise.all`

---

## 2. Arquitectura por capas

La aplicación sigue una **arquitectura en capas** donde cada capa tiene una única responsabilidad:

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (HTML/JS)                │  ← Lo que ve el usuario
├─────────────────────────────────────────────────────┤
│                   ROUTES (routes/)                  │  ← Define qué URL llama a qué función
├─────────────────────────────────────────────────────┤
│                MIDDLEWARE (middleware/)              │  ← Verifica el token JWT
├─────────────────────────────────────────────────────┤
│              CONTROLLERS (controllers/)             │  ← Recibe la petición HTTP y responde
├─────────────────────────────────────────────────────┤
│                SERVICES (services/)                 │  ← Lógica de negocio (reglas)
├─────────────────────────────────────────────────────┤
│             REPOSITORIES (repositories/)            │  ← Acceso a la base de datos
├─────────────────────────────────────────────────────┤
│                 MODELS (models/)                    │  ← Estructura de las tablas
├─────────────────────────────────────────────────────┤
│              CONFIG (config/database.ts)            │  ← Conexión a PostgreSQL
├─────────────────────────────────────────────────────┤
│                   PostgreSQL (DB)                   │  ← Base de datos
└─────────────────────────────────────────────────────┘
```

### ¿Por qué capas?

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Config** | Conectar a la BD | `new Sequelize(...)` |
| **Model** | Definir estructura de tabla | "Una habitación tiene: número, tipo, precio, estado" |
| **Repository** | Operaciones CRUD directas con la BD | `Room.findAll()`, `Room.create(data)` |
| **Service** | Reglas de negocio | "Al crear reserva: verificar que la habitación esté disponible, calcular noches, calcular precio" |
| **Controller** | Recibir petición HTTP, llamar al service, devolver respuesta | `req.body` → service → `res.json()` |
| **Route** | Mapear URL a controller | `POST /api/reservations` → `createReservation` |
| **Middleware** | Verificaciones antes del controller | "¿Tiene token JWT válido?" |

---

## 3. Flujo de una petición HTTP

Ejemplo: **Crear una reserva** (`POST /api/reservations`)

```
1. El usuario llena el formulario en new-reservation.html
2. El JavaScript envía un fetch() con el token y los datos

         fetch('/api/reservations', {
             method: 'POST',
             headers: { 'Authorization': 'Bearer <token>' },
             body: JSON.stringify({ guestId: 1, roomId: 3, checkIn: '...', checkOut: '...' })
         })

3. Express recibe la petición en routes/index.ts:
         router.post('/reservations', authMiddleware, createReservation)

4. MIDDLEWARE (auth.ts): Verifica que el token JWT sea válido
         → Si NO es válido: responde 401/403
         → Si SÍ es válido: pasa al controller

5. CONTROLLER (ReservationController.ts): Extrae datos del req.body
         const reservation = await reservationService.createReservation(req.body)

6. SERVICE (ReservationService.ts): Aplica reglas de negocio
         → Busca la habitación en la BD
         → Verifica que esté disponible
         → Calcula las noches
         → Calcula el precio total
         → Crea la reserva en la BD
         → Marca la habitación como "occupied"

7. REPOSITORY (ReservationRepository.ts): Ejecuta el SQL real
         Reservation.create({ guestId, roomId, checkIn, checkOut, totalPrice, status })

8. La respuesta viaja de vuelta: Repository → Service → Controller → res.json(reserva)

9. El frontend recibe la respuesta y redirige a la lista de reservas
```

---

## 4. Autenticación JWT

### ¿Qué es JWT?
**JSON Web Token** es un estándar para transmitir información de forma segura. Es como un "pase de acceso" que el servidor genera cuando inicias sesión.

### ¿Cómo funciona aquí?

```
1. LOGIN: El usuario envía usuario + contraseña
   POST /api/login  →  { username: "admin", password: "password123" }

2. El servidor verifica las credenciales y genera un token:
   jwt.sign({ id: 1, username: "admin", role: "admin" }, "supersecretkey", { expiresIn: '1h' })
   
   → Responde: { token: "eyJhbGciOiJIUzI1NiIsInR..." }

3. El frontend guarda el token en localStorage:
   localStorage.setItem('token', data.token)

4. En CADA petición posterior, el frontend envía el token:
   headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR...' }

5. El MIDDLEWARE verifica el token ANTES de cada controller:
   jwt.verify(token, "supersecretkey") → Si es válido, deja pasar
```

### Archivo clave: `src/middleware/auth.ts`

```typescript
export const authMiddleware = (req, res, next) => {
    // 1. Extraer el token del header "Authorization: Bearer <token>"
    const token = req.headers['authorization']?.split(' ')[1];

    // 2. Si no hay token, rechazar
    if (!token) return res.status(401).json({ message: 'No token provided' });

    // 3. Verificar que el token sea válido
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        
        // 4. Si es válido, guardar los datos del usuario y continuar
        req.user = decoded;  // { id: 1, username: "admin", role: "admin" }
        next();  // ← Pasa al controller
    });
};
```

---

## 5. Modelos y Base de Datos (Sequelize)

### ¿Qué es Sequelize?
Es un **ORM** (Object-Relational Mapping) que permite trabajar con la base de datos usando objetos de JavaScript/TypeScript en vez de escribir SQL directamente.

### Los 4 modelos:

```
┌─────────────┐       ┌──────────────────┐
│    User      │       │      Guest       │
├─────────────┤       ├──────────────────┤
│ id           │       │ id               │
│ username     │       │ firstName        │
│ password     │       │ lastName         │
│ role         │       │ email            │
│ (admin /     │       │ phone            │
│  receptionist│       │ documentId       │
└─────────────┘       └───────┬──────────┘
                              │ hasMany
                              ▼
┌──────────────────┐   ┌──────────────────┐
│      Room        │   │   Reservation    │
├──────────────────┤   ├──────────────────┤
│ id               │   │ id               │
│ roomNumber       │   │ guestId (FK) ────┼──→ Guest
│ type (single /   │   │ roomId  (FK) ────┼──→ Room
│  double / suite) │   │ checkIn          │
│ pricePerNight    │   │ checkOut         │
│ status (available│   │ totalPrice       │
│  / occupied /    │   │ status (confirmed│
│  maintenance)    │   │  / checked_in /  │
└───────┬──────────┘   │  checked_out /   │
        │ hasMany      │  cancelled)      │
        └──────────────┘──────────────────┘
```

### Ejemplo de modelo: `Room.ts`

```typescript
// Así se define una tabla con Sequelize:
Room.init({
    id: {
        type: DataTypes.INTEGER,      // Tipo de dato: entero
        autoIncrement: true,           // Se auto-incrementa (1, 2, 3...)
        primaryKey: true,              // Es la clave primaria
    },
    roomNumber: {
        type: DataTypes.STRING,        // Tipo texto
        allowNull: false,              // NO puede estar vacío
        unique: true,                  // NO se puede repetir
    },
    type: {
        type: DataTypes.ENUM('single', 'double', 'suite'),  // Solo estos valores
        allowNull: false,
    },
    pricePerNight: {
        type: DataTypes.FLOAT,         // Número decimal
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
        defaultValue: 'available',     // Valor por defecto
    },
}, {
    sequelize,                         // Conexión a la BD
    tableName: 'rooms',                // Nombre de la tabla en PostgreSQL
});
```

### Asociaciones (Relaciones)

En `Reservation.ts` se definen las relaciones:

```typescript
// Un huésped puede tener MUCHAS reservas
Guest.hasMany(Reservation, { foreignKey: 'guestId' });
Reservation.belongsTo(Guest, { foreignKey: 'guestId' });

// Una habitación puede tener MUCHAS reservas
Room.hasMany(Reservation, { foreignKey: 'roomId' });
Reservation.belongsTo(Room, { foreignKey: 'roomId' });
```

---

## 6. Endpoints principales de la API

### Autenticación
| Método | Endpoint | Qué hace | Protegido |
|--------|----------|----------|-----------|
| `POST` | `/api/login` | Inicia sesión, devuelve token JWT | ❌ No |

### Huéspedes (CRUD completo)
| Método | Endpoint | Qué hace | Protegido |
|--------|----------|----------|-----------|
| `GET` | `/api/guests` | Lista todos los huéspedes | ✅ Sí |
| `GET` | `/api/guests/:id` | Obtiene un huésped por ID | ✅ Sí |
| `POST` | `/api/guests` | Crea un nuevo huésped | ✅ Sí |
| `PUT` | `/api/guests/:id` | Actualiza un huésped | ✅ Sí |
| `DELETE` | `/api/guests/:id` | Elimina un huésped | ✅ Sí |

### Habitaciones (CRUD + Batch)
| Método | Endpoint | Qué hace | Protegido |
|--------|----------|----------|-----------|
| `GET` | `/api/rooms` | Lista todas las habitaciones | ✅ Sí |
| `GET` | `/api/rooms/available` | Solo habitaciones disponibles | ✅ Sí |
| `GET` | `/api/rooms/:id` | Obtiene una habitación por ID | ✅ Sí |
| `POST` | `/api/rooms` | Crea una nueva habitación | ✅ Sí |
| `PUT` | `/api/rooms/:id` | Actualiza una habitación | ✅ Sí |
| `DELETE` | `/api/rooms/:id` | Elimina una habitación | ✅ Sí |
| `POST` | `/api/rooms/batch-status` | **Cambia estado masivo (Promise.all)** | ✅ Sí |

### Reservas (CRUD + Batch)
| Método | Endpoint | Qué hace | Protegido |
|--------|----------|----------|-----------|
| `GET` | `/api/reservations` | Lista todas las reservas | ✅ Sí |
| `GET` | `/api/reservations?status=confirmed` | Filtra por estado | ✅ Sí |
| `GET` | `/api/reservations/:id` | Detalle de una reserva | ✅ Sí |
| `POST` | `/api/reservations` | Crea una nueva reserva | ✅ Sí |
| `PUT` | `/api/reservations/:id` | Actualiza una reserva | ✅ Sí |
| `DELETE` | `/api/reservations/:id` | Elimina una reserva | ✅ Sí |
| `POST` | `/api/reservations/batch-checkin` | **Check-in masivo (Promise.all)** | ✅ Sí |
| `POST` | `/api/reservations/batch-checkout` | **Check-out masivo (Promise.all)** | ✅ Sí |

---

## 7. CORS — Qué es y cómo está configurado

### ¿Qué es CORS?
**Cross-Origin Resource Sharing** es un mecanismo de seguridad del navegador. Por defecto, una página web solo puede hacer peticiones al **mismo dominio** donde está alojada. CORS permite que un dominio A haga peticiones a un dominio B.

### ¿Por qué lo necesitamos?
Cuando el frontend está en `http://localhost:5500` (Live Server) y el backend en `http://localhost:3000`, son **orígenes diferentes**. Sin CORS, el navegador bloquea las peticiones.

### Configuración en `src/index.ts`:

```typescript
app.use(cors({
    origin: 'http://localhost:3000',           // Solo este origen puede hacer peticiones
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Solo estos métodos HTTP permitidos
}));
```

Esto significa:
- ✅ `http://localhost:3000` puede hacer peticiones → PERMITIDO
- ❌ `http://localhost:8080` no puede → BLOQUEADO
- ❌ `http://otrodominio.com` no puede → BLOQUEADO

---

## 8. Promise.all — Asincronicidad

### ¿Qué es una Promise (Promesa)?
Una Promise representa una **operación asíncrona** — algo que tarda un tiempo en completarse (como consultar la base de datos o hacer una petición HTTP).

```typescript
// Esto es asíncrono: no sabemos cuánto tardará
const guest = await Guest.findByPk(1);  // "Espera" a que la BD responda
```

### ¿Qué es Promise.all?
`Promise.all` toma un **array de promesas** y las ejecuta **todas en paralelo** (concurrentemente). En vez de esperar una por una, las ejecuta al mismo tiempo.

### Comparación: Sin vs Con Promise.all

```
❌ SIN Promise.all (secuencial — más lento):
   Habitación 1: ████████░░  (2 segundos)
   Habitación 2:            ████████░░  (2 segundos)
   Habitación 3:                       ████████░░  (2 segundos)
   Total: 6 segundos

✅ CON Promise.all (paralelo — más rápido):
   Habitación 1: ████████░░  (2 segundos)
   Habitación 2: ████████░░  (2 segundos)
   Habitación 3: ████████░░  (2 segundos)
   Total: ~2 segundos (todas al mismo tiempo)
```

### ¿Dónde se usa Promise.all en este proyecto?

#### 1️⃣ Backend — `ReservationService.ts` → Batch Check-In

```typescript
async batchCheckIn(reservationIds: number[]) {
    // Promise.all ejecuta TODAS las operaciones en paralelo
    const results = await Promise.all(
        reservationIds.map(async (id) => {
            // Cada una de estas se ejecuta al mismo tiempo
            const reservation = await this.reservationRepository.findById(id);
            if (!reservation || reservation.status !== 'confirmed') return null;
            await this.reservationRepository.update(id, { status: 'checked_in' });
            return { id, status: 'checked_in' };
        })
    );
    // Filtra los null (reservas que no existían o no estaban confirmadas)
    return results.filter(r => r !== null);
}
```

**¿Qué hace?** Si le paso `[1, 2, 3, 4, 5]`, busca y actualiza las 5 reservas **al mismo tiempo** en vez de una por una.

#### 2️⃣ Backend — `ReservationService.ts` → Batch Check-Out (doble Promise.all)

```typescript
async batchCheckOut(reservationIds: number[]) {
    const results = await Promise.all(
        reservationIds.map(async (id) => {
            const reservation = await this.reservationRepository.findById(id);
            if (!reservation || reservation.status !== 'checked_in') return null;

            // ¡Promise.all DENTRO de otro Promise.all!
            // Actualiza la reserva Y libera la habitación AL MISMO TIEMPO
            await Promise.all([
                this.reservationRepository.update(id, { status: 'checked_out' }),
                this.roomRepository.update(reservation.roomId, { status: 'available' })
            ]);

            return { id, status: 'checked_out' };
        })
    );
    return results.filter(r => r !== null);
}
```

#### 3️⃣ Backend — `RoomService.ts` → Batch Update Status

```typescript
async batchUpdateStatus(roomIds: number[], status: string) {
    const results = await Promise.all(
        roomIds.map(async (id) => {
            const room = await this.roomRepository.findById(id);
            if (!room) return null;
            return await this.roomRepository.update(id, { status });
        })
    );
    return results.filter(r => r !== null);
}
```

**¿Qué hace?** Cambia el estado de múltiples habitaciones a "maintenance" o "available" todas al mismo tiempo.

#### 4️⃣ Backend — `sync.ts` → Seed de datos iniciales

```typescript
// Crea 6 habitaciones en paralelo
const rooms = await Promise.all([
    Room.create({ roomNumber: '101', type: 'single', pricePerNight: 80 }),
    Room.create({ roomNumber: '102', type: 'single', pricePerNight: 80 }),
    Room.create({ roomNumber: '201', type: 'double', pricePerNight: 120 }),
    // ... más habitaciones
]);

// Crea 3 huéspedes en paralelo
const guests = await Promise.all([
    Guest.create({ firstName: 'Juan', lastName: 'García', ... }),
    Guest.create({ firstName: 'María', lastName: 'López', ... }),
    Guest.create({ firstName: 'Carlos', lastName: 'Martínez', ... }),
]);
```

#### 5️⃣ Frontend — `dashboard.js` → Cargar estadísticas

```javascript
// Carga huéspedes, habitaciones y reservas AL MISMO TIEMPO
const [guestsRes, roomsRes, reservationsRes] = await Promise.all([
    fetch('/api/guests', { headers }),
    fetch('/api/rooms', { headers }),
    fetch('/api/reservations', { headers })
]);

// Convierte las 3 respuestas a JSON en paralelo
const [guests, rooms, reservations] = await Promise.all([
    guestsRes.json(),
    roomsRes.json(),
    reservationsRes.json()
]);
```

#### 6️⃣ Frontend — `new-reservation.js` → Cargar formulario

```javascript
// Carga huéspedes Y habitaciones disponibles al mismo tiempo
const [guestsRes, roomsRes] = await Promise.all([
    fetch('/api/guests', { headers }),
    fetch('/api/rooms/available', { headers })
]);
```

#### 7️⃣ Frontend — `reports.js` → Cargar datos de reportes

```javascript
// Carga reservas Y habitaciones en paralelo
const [reservationsRes, roomsRes] = await Promise.all([
    fetch('/api/reservations', { headers }),
    fetch('/api/rooms', { headers })
]);
```

---

## 9. Docker y Docker Compose

### ¿Qué es Docker?
Docker permite empaquetar una aplicación con **todo lo que necesita** (Node.js, dependencias, código) en un **contenedor** que funciona igual en cualquier computadora.

### ¿Qué es Docker Compose?
Permite definir y ejecutar **múltiples contenedores** con un solo comando. En nuestro caso:

| Servicio | Contenedor | Puerto | Qué es |
|----------|-----------|--------|--------|
| `db` | `hotel_db` | 5433:5432 | Base de datos PostgreSQL |
| `app` | `hotel_app` | 3000:3000 | Nuestra aplicación Node.js |

### `docker-compose.yml` explicado:

```yaml
services:
  db:                                    # Servicio 1: Base de datos
    image: postgres:15                   # Usa la imagen oficial de PostgreSQL 15
    container_name: hotel_db
    environment:
      POSTGRES_USER: admin               # Usuario de la BD
      POSTGRES_PASSWORD: password         # Contraseña
      POSTGRES_DB: hotel_db              # Nombre de la BD (se crea automáticamente)
    ports:
      - "5433:5432"                      # Puerto externo:interno
    volumes:
      - postgres_data:/var/lib/postgresql/data   # Persistir datos
    healthcheck:                         # Verifica que PostgreSQL esté listo
      test: ["CMD-SHELL", "pg_isready -U admin -d hotel_db"]
      interval: 10s

  app:                                   # Servicio 2: Nuestra app
    build: .                             # Construir desde el Dockerfile
    container_name: hotel_app
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db                        # ← "db" es el nombre del servicio de arriba
    depends_on:
      db:
        condition: service_healthy       # Espera a que la BD esté lista
```

### `Dockerfile` explicado:

```dockerfile
FROM node:18-alpine          # Imagen base: Node.js 18 (versión ligera)
WORKDIR /usr/src/app         # Directorio de trabajo dentro del contenedor
COPY package*.json ./        # Copia package.json primero (para cache de npm)
RUN npm install              # Instala dependencias
COPY . .                     # Copia todo el código
RUN npm run build            # Compila TypeScript a JavaScript
EXPOSE 3000                  # Documenta el puerto

# Al iniciar: sincroniza la BD (crea tablas + datos) y arranca el servidor
CMD ["sh", "-c", "npx ts-node src/sync.ts && node dist/index.js"]
```

### Comandos útiles:

```bash
docker-compose up --build    # Construye y arranca todo
docker-compose up -d         # Arranca en segundo plano
docker-compose down          # Detiene los contenedores
docker-compose down -v       # Detiene Y elimina los datos de la BD
docker-compose logs app      # Ver logs de la app
docker-compose logs db       # Ver logs de la BD
```

---

## 10. Frontend — Las 8 vistas

| # | Archivo | Qué hace | Conceptos que usa |
|---|---------|----------|-------------------|
| 1 | `index.html` | Página de login | `fetch()`, `localStorage`, JWT |
| 2 | `dashboard.html` | Vista general con estadísticas | **`Promise.all`** para cargar 3 APIs a la vez |
| 3 | `guests.html` | CRUD de huéspedes | Modales, fetch con CRUD completo |
| 4 | `rooms.html` | CRUD de habitaciones con filtros | Cards dinámicas, filtros en el frontend |
| 5 | `reservations.html` | Lista de reservas con filtro de estado | Query params (`?status=confirmed`) |
| 6 | `new-reservation.html` | Formulario para crear reserva | **`Promise.all`**, cálculo en tiempo real |
| 7 | `reservation-detail.html` | Detalle de una reserva | URL params (`?id=1`), acciones de estado |
| 8 | `reports.html` | Operaciones batch masivas | **`Promise.all`** para batch check-in/out |

### Patrón que siguen TODOS los archivos JS:

```javascript
// 1. Verificar autenticación
const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';  // Si no hay token, ir a login

// 2. Configurar URL base de la API
const API_URL = 'http://localhost:3000/api';

// 3. Headers con el token
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// 4. Funciones para cargar datos (GET)
async function fetchData() {
    const response = await fetch(`${API_URL}/recurso`, { headers });
    const data = await response.json();
    // Renderizar en el HTML
}

// 5. Funciones para enviar datos (POST/PUT/DELETE)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/recurso`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ campo1: valor1 })
    });
});

// 6. Cargar datos al iniciar la página
fetchData();
```

---

## 🎓 Resumen de Conceptos Clave

| Concepto | Dónde se usa | Para qué |
|----------|-------------|----------|
| **TypeScript** | Todo el backend (`src/`) | Tipos estáticos, mejor IDE, menos errores |
| **Express** | `index.ts`, `routes/` | Framework web para Node.js, maneja peticiones HTTP |
| **Sequelize** | `models/`, `repositories/` | ORM para trabajar con PostgreSQL sin SQL directo |
| **JWT** | `middleware/auth.ts`, `AuthService.ts` | Autenticación sin sesiones en el servidor |
| **Promise.all** | Services, sync.ts, frontend JS | Ejecutar operaciones asíncronas en paralelo |
| **CORS** | `index.ts` | Permitir peticiones cross-origin del frontend |
| **Docker** | `Dockerfile` | Empaquetar la app en un contenedor |
| **Docker Compose** | `docker-compose.yml` | Orquestar app + base de datos |
| **Repository Pattern** | `repositories/` | Separar el acceso a datos de la lógica de negocio |
| **MVC-like** | controllers → services → repositories | Separación de responsabilidades |
