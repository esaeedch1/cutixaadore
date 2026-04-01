import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export const getDb = () => {
    if (!pool) {
        // These will be configured in your Hostinger .env file
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cutixa_adore',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        pool = mysql.createPool(config);
    }
    return pool;
};
