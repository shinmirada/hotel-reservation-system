import Guest from '../models/Guest';

export class GuestRepository {
    async findAll() {
        return await Guest.findAll();
    }

    async findById(id: number) {
        return await Guest.findByPk(id);
    }

    async create(guest: any) {
        return await Guest.create(guest);
    }

    async update(id: number, data: any) {
        const guest = await this.findById(id);
        if (guest) {
            return await guest.update(data);
        }
        return null;
    }

    async delete(id: number) {
        const guest = await this.findById(id);
        if (guest) {
            await guest.destroy();
            return true;
        }
        return false;
    }
}
