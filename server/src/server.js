const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { updatePresenceFromToken } = require('./controllers/chatController');

dotenv.config();
connectDB();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', process.env.CLIENT_URL],
    credentials: true,
  },
});

io.on('connection', async (socket) => {
  const token = socket.handshake.auth?.token;
  await updatePresenceFromToken(token, 'online');

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

  socket.on('disconnect', async () => {
    await updatePresenceFromToken(token, 'offline');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
