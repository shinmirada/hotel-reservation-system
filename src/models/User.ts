import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;
    public role!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'receptionist'),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User;
