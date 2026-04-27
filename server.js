import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Servir la aplicación React compilada
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const matches = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('host_match', (data) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    matches.set(roomId, { state: data.state, host: socket.id });
    socket.join(roomId);
    socket.emit('match_hosted', { roomId });
    console.log(`Match ${roomId} hosted by ${socket.id}`);
  });

  socket.on('update_match', (data) => {
    const { roomId, state } = data;
    if (matches.has(roomId)) {
      matches.set(roomId, { ...matches.get(roomId), state });
      socket.to(roomId).emit('match_updated', { state });
    }
  });

  socket.on('join_match', (data) => {
    const { roomId } = data;
    if (matches.has(roomId)) {
      socket.join(roomId);
      socket.emit('match_joined', { state: matches.get(roomId).state });
      console.log(`User ${socket.id} joined match ${roomId}`);
    } else {
      socket.emit('error', { message: 'Match not found' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO and Web server running on port ${PORT}`);
});
