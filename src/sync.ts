import sequelize from './config/database';
import User from './models/User';
import Guest from './models/Guest';
import Room from './models/Room';
import Reservation from './models/Reservation';

const syncDatabase = async () => {
    try {
        // Force models to be loaded
        console.log('📦 Loading models:', User.name, Guest.name, Room.name, Reservation.name);

        await sequelize.authenticate();
        console.log('✅ Database connected!');
        // Alter sync: creates tables if they don't exist, updates columns if needed, preserves data
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced!');

        // Seed admin user (findOrCreate to avoid duplicates on restart)
        const [adminUser, adminCreated] = await User.findOrCreate({
            where: { username: 'admin' },
            defaults: { password: 'password123', role: 'admin' }
        });
        console.log(adminCreated ? '👤 Admin user created' : '👤 Admin user already exists');

        // Seed sample rooms
        const roomData = [
            { roomNumber: '101', type: 'single', pricePerNight: 80, status: 'available' },
            { roomNumber: '102', type: 'single', pricePerNight: 80, status: 'available' },
            { roomNumber: '201', type: 'double', pricePerNight: 120, status: 'available' },
            { roomNumber: '202', type: 'double', pricePerNight: 120, status: 'available' },
            { roomNumber: '301', type: 'suite', pricePerNight: 250, status: 'available' },
            { roomNumber: '302', type: 'suite', pricePerNight: 300, status: 'maintenance' },
        ];
        const rooms = await Promise.all(
            roomData.map(r => Room.findOrCreate({ where: { roomNumber: r.roomNumber }, defaults: r }))
        );
        console.log(`🏨 Rooms ready (${rooms.filter(([, created]) => created).length} new)`);

        // Seed sample guests
        const guestData = [
            { firstName: 'Juan', lastName: 'García', email: 'juan@email.com', phone: '3001234567', documentId: 'CC1001' },
            { firstName: 'María', lastName: 'López', email: 'maria@email.com', phone: '3009876543', documentId: 'CC1002' },
            { firstName: 'Carlos', lastName: 'Martínez', email: 'carlos@email.com', phone: '3005551234', documentId: 'CC1003' },
        ];
        const guests = await Promise.all(
            guestData.map(g => Guest.findOrCreate({ where: { documentId: g.documentId }, defaults: g }))
        );
        console.log(`👥 Guests ready (${guests.filter(([, created]) => created).length} new)`);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

syncDatabase();
