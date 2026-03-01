import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Room extends Model {
    public id!: number;
    public roomNumber!: string;
    public type!: string;
    public pricePerNight!: number;
    public status!: string;
}

Room.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        roomNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM('single', 'double', 'suite'),
            allowNull: false,
        },
        pricePerNight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
            defaultValue: 'available',
        },
    },
    {
        sequelize,
        tableName: 'rooms',
    }
);

export default Room;
