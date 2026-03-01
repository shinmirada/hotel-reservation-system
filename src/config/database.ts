import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Si existe DATABASE_URL (Render), usar esa; si no, usar variables individuales (local)
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    })
    : new Sequelize(
        process.env.DB_NAME as string,
        process.env.DB_USER as string,
        process.env.DB_PASSWORD as string,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false,
        }
    );

export default sequelize;
