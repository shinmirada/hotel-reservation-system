import Reservation from '../models/Reservation';
import Guest from '../models/Guest';
import Room from '../models/Room';

export class ReservationRepository {
    async findAll() {
        return await Reservation.findAll({
            include: [
                { model: Guest, attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Room, attributes: ['id', 'roomNumber', 'type', 'pricePerNight'] }
            ]
        });
    }

    async findById(id: number) {
        return await Reservation.findByPk(id, {
            include: [
                { model: Guest, attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'documentId'] },
                { model: Room, attributes: ['id', 'roomNumber', 'type', 'pricePerNight', 'status'] }
            ]
        });
    }

    async create(reservation: any) {
        return await Reservation.create(reservation);
    }

    async update(id: number, data: any) {
        const reservation = await Reservation.findByPk(id);
        if (reservation) {
            return await reservation.update(data);
        }
        return null;
    }

    async delete(id: number) {
        const reservation = await Reservation.findByPk(id);
        if (reservation) {
            await reservation.destroy();
            return true;
        }
        return false;
    }

    async findByGuestId(guestId: number) {
        return await Reservation.findAll({ where: { guestId } });
    }

    async findByStatus(status: string) {
        return await Reservation.findAll({
            where: { status },
            include: [
                { model: Guest, attributes: ['id', 'firstName', 'lastName'] },
                { model: Room, attributes: ['id', 'roomNumber', 'type'] }
            ]
        });
    }
}
