require('dotenv').config();
require('./config/db');
const cors = require('cors');

const express = require('express');
const app = express();

const planRoutes = require('./routes/planRoutes');
const authRoutes = require('./routes/authRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const healthRoutes = require('./routes/healthRoutes');

app.use(express.json());
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['https://meateka.vercel.app'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'meateka-backend' });
});

app.use('/api/plan', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api/health', healthRoutes);



app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
