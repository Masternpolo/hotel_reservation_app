import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import { Pool } from 'pg';

let pool;

if (process.env.NODE_ENV === 'production') {
  console.log('Using external database connection');
  
  pool = new Pool({
    connectionString: process.env.EXTERNAL_DB_URL,
    ssl: {
      rejectUnauthorized: false, 
    },
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
})

export default pool;