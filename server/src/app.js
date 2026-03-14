const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
