require('dotenv').config();
require('./config/db');
const cors = require('cors');

const express = require('express');
const app = express();

const planRoutes = require('./routes/planRoutes');
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'meateka-backend' });
});

app.use('/api/plan', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recommendation', recommendationRoutes);



app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
