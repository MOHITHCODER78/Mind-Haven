const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
  'https://mind-haven-f2t4.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview deployment
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed for this origin'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(generalLimiter);

app.get('/', (_req, res) => {
  res.json({
    name: 'Mental Health Support Platform API',
    version: '0.1.0',
    docs: '/api/health',
  });
});

app.use('/api', apiRoutes);
app.use(errorHandler);

module.exports = app;
