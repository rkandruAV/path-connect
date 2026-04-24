import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : 'http://localhost:3000' },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1', apiRouter);

// Socket.io
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handler (must be after all routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || process.env.API_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`PathConnect API running on port ${PORT}`);
});

export { app, io };
