const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'utc',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  insecureAuth: true
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('--- DATABASE CONNECTED SUCCESSFULLY ---');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database Name:', process.env.DB_NAME);
    console.log('---------------------------------------');
    connection.release(); // Return connection back to pool
  } catch (err) {
    console.error('--- DATABASE CONNECTION FAILED ---');
    console.error(err.message);
    console.error('----------------------------------');
  }
})();


module.exports = pool;

