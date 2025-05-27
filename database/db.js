const { Pool } = require('pg');


if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  pool.on('error', (err, client) => {
    console.error('Unexpected error in the db', err);
    process.exit(1);
  });
}


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


//test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.stack);
    process.exit(1);
  } else {
    console.log('Connected to PostgreSQL at', res.rows[0].now);
  }
});

module.exports = pool;