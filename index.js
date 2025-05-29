require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const columnRoutes = require('./routes/columnRoutes');
const cardRoutes = require('./routes/cardRoutes');
const { createServer } = require('http');
const { Server } = require('socket.io');
const listEndpoints = require('express-list-endpoints');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api', columnRoutes);
app.use('/api/cards', cardRoutes);

// Socket.io setup
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join-board', (boardId) => {
    socket.join(boardId);
  });
  
  socket.on('card-moved', (data) => {
    socket.to(data.boardId).emit('card-updated', data);
  });
});

// Start server
connectDB().then(() => {
  const server = httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
      server.close();
      httpServer.listen(PORT + 1, () => {
        console.log(`Server is running on port ${PORT + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
});

app.post('/test', (req, res) => {
    res.json({ message: 'Test route is working!' });
  });


