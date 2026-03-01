import { ReservationRepository } from '../repositories/ReservationRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { GuestRepository } from '../repositories/GuestRepository';

export class ReservationService {
    private reservationRepository: ReservationRepository;
    private roomRepository: RoomRepository;
    private guestRepository: GuestRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.roomRepository = new RoomRepository();
        this.guestRepository = new GuestRepository();
    }

    async getAllReservations() {
        return await this.reservationRepository.findAll();
    }

    async getReservationById(id: number) {
        return await this.reservationRepository.findById(id);
    }

    async createReservation(data: any) {
        // Calculate total price based on room price and nights
        const room = await this.roomRepository.findById(data.roomId);
        if (!room) throw new Error('Room not found');
        if (room.status !== 'available') throw new Error('Room is not available');

        const checkIn = new Date(data.checkIn);
        const checkOut = new Date(data.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        if (nights <= 0) throw new Error('Check-out must be after check-in');

        const totalPrice = room.pricePerNight * nights;

        const reservation = await this.reservationRepository.create({
            ...data,
            totalPrice,
            status: 'confirmed'
        });

        // Mark room as occupied
        await this.roomRepository.update(data.roomId, { status: 'occupied' });

        return reservation;
    }

    async updateReservation(id: number, data: any) {
        return await this.reservationRepository.update(id, data);
    }

    async deleteReservation(id: number) {
        const reservation = await this.reservationRepository.findById(id);
        if (reservation) {
            // Free the room
            await this.roomRepository.update(reservation.roomId, { status: 'available' });
        }
        return await this.reservationRepository.delete(id);
    }

    // Batch check-in using Promise.all
    async batchCheckIn(reservationIds: number[]) {
        const results = await Promise.all(reservationIds.map(async (id) => {
            const reservation = await this.reservationRepository.findById(id);
            if (!reservation || reservation.status !== 'confirmed') return null;

            await this.reservationRepository.update(id, { status: 'checked_in' });
            return { id, status: 'checked_in' };
        }));
        return results.filter(r => r !== null);
    }

    // Batch check-out using Promise.all
    async batchCheckOut(reservationIds: number[]) {
        const results = await Promise.all(reservationIds.map(async (id) => {
            const reservation = await this.reservationRepository.findById(id);
            if (!reservation || reservation.status !== 'checked_in') return null;

            // Update reservation and free room concurrently
            await Promise.all([
                this.reservationRepository.update(id, { status: 'checked_out' }),
                this.roomRepository.update(reservation.roomId, { status: 'available' })
            ]);
            return { id, status: 'checked_out' };
        }));
        return results.filter(r => r !== null);
    }

    async getReservationsByStatus(status: string) {
        return await this.reservationRepository.findByStatus(status);
    }
}
