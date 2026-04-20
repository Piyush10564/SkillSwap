import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import skillsRoutes from './routes/skills.js';
import searchRoutes from './routes/search.js';
import chatRoutes from './routes/chat.js';
import notificationsRoutes from './routes/notifications.js';
import profileRoutes from './routes/profile.js';
import reviewRoutes from './routes/reviews.js';
import goalRoutes from './routes/goals.js';
import badgeRoutes from './routes/badges.js';
import creditRoutes from './routes/credits.js';
import noteRoutes from './routes/notes.js';
import progressRoutes from './routes/progress.js';

const app = express();

// CORS configuration - allow multiple localhost ports for development
const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// In production, use the configured origin only
if (process.env.NODE_ENV === 'production') {
  corsOrigins.length = 0; // Clear and use only production origin
  corsOrigins.push(config.clientOrigin);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, allow requests without origin (like mobile apps)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillSwap API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
