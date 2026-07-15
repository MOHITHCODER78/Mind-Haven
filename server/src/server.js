const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
// Trust proxy is handled in rateLimiter.js via ipKeyGenerator with trustProxy: 1
// This securely handles rate limiting behind Render's single proxy
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { updatePresenceFromToken } = require('./controllers/chatController');
const validateEnv = require('./utils/validateEnv');
const { authenticateSocket } = require('./utils/socketAuth');

validateEnv();
connectDB();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.set('io', io);

io.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token;
  const user = await authenticateSocket(token);

  if (!user) {
    socket.disconnect();
    return;
  }

  updatePresenceFromToken(token, 'online').catch(() => {
    // Do not block presence update.
  });

  socket.on('join-support-room', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('join-support-global', () => {
    socket.join('support-global');
  });

  socket.on('send-support-message', ({ conversationId, message }) => {
    // Emit to specific conversation room
    io.to(conversationId).emit('receive-support-message', {
      conversationId,
      message,
      createdAt: new Date().toISOString(),
    });
    // Also emit to global support room for inbox updates
    io.to('support-global').emit('receive-support-message', {
      conversationId,
      message,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    updatePresenceFromToken(token, 'offline').catch(() => {
      // Do not block disconnect if presence update fails.
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
