import { RoomRepository } from '../repositories/RoomRepository';

export class RoomService {
    private roomRepository: RoomRepository;

    constructor() {
        this.roomRepository = new RoomRepository();
    }

    async getAllRooms() {
        return await this.roomRepository.findAll();
    }

    async getAvailableRooms() {
        return await this.roomRepository.findAvailable();
    }

    async getRoomById(id: number) {
        return await this.roomRepository.findById(id);
    }

    async createRoom(data: any) {
        return await this.roomRepository.create(data);
    }

    async updateRoom(id: number, data: any) {
        return await this.roomRepository.update(id, data);
    }

    async deleteRoom(id: number) {
        return await this.roomRepository.delete(id);
    }

    // Batch status update using Promise.all
    async batchUpdateStatus(roomIds: number[], status: string) {
        const results = await Promise.all(roomIds.map(async (id) => {
            const room = await this.roomRepository.findById(id);
            if (!room) return null;
            return await this.roomRepository.update(id, { status });
        }));
        return results.filter(r => r !== null);
    }
}
