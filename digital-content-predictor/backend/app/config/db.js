const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },  // Supabase requires SSL
});

pool.on('connect', () => {
  console.log('--- DATABASE CONNECTED SUCCESSFULLY ---');
  console.log('Host:', process.env.DB_HOST);
  console.log('Database:', process.env.DB_NAME);
  console.log('---------------------------------------');
});

pool.on('error', (err) => {
  console.error('--- DATABASE CONNECTION FAILED ---');
  console.error(err.message);
  console.error('----------------------------------');
});

module.exports = pool;
