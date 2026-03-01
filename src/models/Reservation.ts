import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Guest from './Guest';
import Room from './Room';

class Reservation extends Model {
    public id!: number;
    public guestId!: number;
    public roomId!: number;
    public checkIn!: Date;
    public checkOut!: Date;
    public totalPrice!: number;
    public status!: string;
}

Reservation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        guestId: {
            type: DataTypes.INTEGER,
            references: {
                model: Guest,
                key: 'id',
            },
            allowNull: false,
        },
        roomId: {
            type: DataTypes.INTEGER,
            references: {
                model: Room,
                key: 'id',
            },
            allowNull: false,
        },
        checkIn: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        checkOut: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled'),
            defaultValue: 'confirmed',
        },
    },
    {
        sequelize,
        tableName: 'reservations',
    }
);

// Define associations
Guest.hasMany(Reservation, { foreignKey: 'guestId' });
Reservation.belongsTo(Guest, { foreignKey: 'guestId' });

Room.hasMany(Reservation, { foreignKey: 'roomId' });
Reservation.belongsTo(Room, { foreignKey: 'roomId' });

export default Reservation;
