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

        // Seed admin user
        await User.create({
            username: 'admin',
            password: 'password123',
            role: 'admin'
        });
        console.log('👤 Admin user created');

        // Seed sample rooms
        const rooms = await Promise.all([
            Room.create({ roomNumber: '101', type: 'single', pricePerNight: 80, status: 'available' }),
            Room.create({ roomNumber: '102', type: 'single', pricePerNight: 80, status: 'available' }),
            Room.create({ roomNumber: '201', type: 'double', pricePerNight: 120, status: 'available' }),
            Room.create({ roomNumber: '202', type: 'double', pricePerNight: 120, status: 'available' }),
            Room.create({ roomNumber: '301', type: 'suite', pricePerNight: 250, status: 'available' }),
            Room.create({ roomNumber: '302', type: 'suite', pricePerNight: 300, status: 'maintenance' }),
        ]);
        console.log(`🏨 ${rooms.length} sample rooms created`);

        // Seed sample guests
        const guests = await Promise.all([
            Guest.create({ firstName: 'Juan', lastName: 'García', email: 'juan@email.com', phone: '3001234567', documentId: 'CC1001' }),
            Guest.create({ firstName: 'María', lastName: 'López', email: 'maria@email.com', phone: '3009876543', documentId: 'CC1002' }),
            Guest.create({ firstName: 'Carlos', lastName: 'Martínez', email: 'carlos@email.com', phone: '3005551234', documentId: 'CC1003' }),
        ]);
        console.log(`👥 ${guests.length} sample guests created`);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

syncDatabase();
