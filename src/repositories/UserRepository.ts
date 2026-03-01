import User from '../models/User';

export class UserRepository {
    async findByUsername(username: string) {
        return await User.findOne({ where: { username } });
    }

    async create(user: any) {
        return await User.create(user);
    }
}
