import { Router } from 'express';
import { login } from '../controllers/AuthController';
import { getGuests, getGuest, createGuest, updateGuest, deleteGuest } from '../controllers/GuestController';
import { getRooms, getAvailableRooms, getRoom, createRoom, updateRoom, deleteRoom, batchUpdateRoomStatus } from '../controllers/RoomController';
import { getReservations, getReservation, createReservation, updateReservation, deleteReservation, batchCheckIn, batchCheckOut } from '../controllers/ReservationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Auth
router.post('/login', login);

// Guests
router.get('/guests', authMiddleware, getGuests);
router.get('/guests/:id', authMiddleware, getGuest);
router.post('/guests', authMiddleware, createGuest);
router.put('/guests/:id', authMiddleware, updateGuest);
router.delete('/guests/:id', authMiddleware, deleteGuest);

// Rooms
router.get('/rooms', authMiddleware, getRooms);
router.get('/rooms/available', authMiddleware, getAvailableRooms);
router.get('/rooms/:id', authMiddleware, getRoom);
router.post('/rooms', authMiddleware, createRoom);
router.put('/rooms/:id', authMiddleware, updateRoom);
router.delete('/rooms/:id', authMiddleware, deleteRoom);
router.post('/rooms/batch-status', authMiddleware, batchUpdateRoomStatus);

// Reservations
router.get('/reservations', authMiddleware, getReservations);
router.get('/reservations/:id', authMiddleware, getReservation);
router.post('/reservations', authMiddleware, createReservation);
router.put('/reservations/:id', authMiddleware, updateReservation);
router.delete('/reservations/:id', authMiddleware, deleteReservation);
router.post('/reservations/batch-checkin', authMiddleware, batchCheckIn);
router.post('/reservations/batch-checkout', authMiddleware, batchCheckOut);

export default router;
