import { GuestRepository } from '../repositories/GuestRepository';

export class GuestService {
    private guestRepository: GuestRepository;

    constructor() {
        this.guestRepository = new GuestRepository();
    }

    async getAllGuests() {
        return await this.guestRepository.findAll();
    }

    async getGuestById(id: number) {
        return await this.guestRepository.findById(id);
    }

    async createGuest(data: any) {
        return await this.guestRepository.create(data);
    }

    async updateGuest(id: number, data: any) {
        return await this.guestRepository.update(id, data);
    }

    async deleteGuest(id: number) {
        return await this.guestRepository.delete(id);
    }
}
