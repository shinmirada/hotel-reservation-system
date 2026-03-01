import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Guest extends Model {
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public phone!: string;
    public documentId!: string;
}

Guest.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        documentId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: 'guests',
    }
);

export default Guest;
