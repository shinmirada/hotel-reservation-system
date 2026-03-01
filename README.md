# Hotel Reservation Manager 🏨

Sistema de gestión de reservas de hotel construido con Node.js, TypeScript, Express, Sequelize y PostgreSQL.

## Estructura del Proyecto

```
src/
├── config/          # Configuración de base de datos
│   └── database.ts
├── models/          # Modelos Sequelize
│   ├── User.ts
│   ├── Guest.ts
│   ├── Room.ts
│   └── Reservation.ts
├── repositories/    # Capa de acceso a datos
│   ├── UserRepository.ts
│   ├── GuestRepository.ts
│   ├── RoomRepository.ts
│   └── ReservationRepository.ts
├── services/        # Lógica de negocio
│   ├── AuthService.ts
│   ├── GuestService.ts
│   ├── RoomService.ts
│   └── ReservationService.ts
├── controllers/     # Controladores HTTP
│   ├── AuthController.ts
│   ├── GuestController.ts
│   ├── RoomController.ts
│   └── ReservationController.ts
├── routes/          # Definición de rutas
│   └── index.ts
├── middleware/      # Middleware (JWT Auth)
│   └── auth.ts
├── index.ts         # Punto de entrada del servidor
└── sync.ts          # Script de sincronización de BD

frontend/
├── index.html              # Login
├── dashboard.html          # Dashboard con estadísticas
├── guests.html             # Gestión de huéspedes
├── rooms.html              # Gestión de habitaciones
├── reservations.html       # Lista de reservas
├── new-reservation.html    # Crear nueva reserva
├── reservation-detail.html # Detalle de reserva
├── reports.html            # Reportes y operaciones batch
├── css/style.css           # Estilos compartidos
└── js/                     # Scripts por vista
```

## Tecnologías

- **Backend:** Node.js, TypeScript, Express, Sequelize, PostgreSQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Frontend:** HTML, CSS, JavaScript plano
- **Infraestructura:** Docker, Docker Compose
- **Asincronicidad:** Promise.all para operaciones batch

## Cómo Ejecutar

### Con Docker Compose (Recomendado)
```bash
docker-compose up --build
```
Acceder a: `http://localhost:3000/frontend/index.html`

### Desarrollo Local
```bash
npm install
npm run dev
```

## Credenciales por Defecto
- **Usuario:** admin
- **Contraseña:** password123

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/login | Iniciar sesión |
| GET/POST | /api/guests | Listar/Crear huéspedes |
| GET/PUT/DELETE | /api/guests/:id | CRUD huésped |
| GET/POST | /api/rooms | Listar/Crear habitaciones |
| GET/PUT/DELETE | /api/rooms/:id | CRUD habitación |
| POST | /api/rooms/batch-status | Cambio masivo de estado |
| GET/POST | /api/reservations | Listar/Crear reservas |
| GET/PUT/DELETE | /api/reservations/:id | CRUD reserva |
| POST | /api/reservations/batch-checkin | Check-in masivo |
| POST | /api/reservations/batch-checkout | Check-out masivo |

## CORS
Configurado únicamente para `http://localhost:3000` con métodos `GET, POST, PUT, DELETE`.
