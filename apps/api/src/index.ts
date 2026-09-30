import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './swagger.js';

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

// Rate limiting — general API: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { data: null, message: 'Too many requests, please try again later' },
});

// Stricter rate limit for AI endpoints: 20 requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { data: null, message: 'AI request limit exceeded, please try again later' },
});

app.use('/api/v1/ai', aiLimiter);
app.use('/api/v1', generalLimiter);

// API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

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
