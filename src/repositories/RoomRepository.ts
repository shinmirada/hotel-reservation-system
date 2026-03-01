import Room from '../models/Room';

export class RoomRepository {
    async findAll() {
        return await Room.findAll();
    }

    async findById(id: number) {
        return await Room.findByPk(id);
    }

    async findAvailable() {
        return await Room.findAll({ where: { status: 'available' } });
    }

    async create(room: any) {
        return await Room.create(room);
    }

    async update(id: number, data: any) {
        const room = await this.findById(id);
        if (room) {
            return await room.update(data);
        }
        return null;
    }

    async delete(id: number) {
        const room = await this.findById(id);
        if (room) {
            await room.destroy();
            return true;
        }
        return false;
    }
}
