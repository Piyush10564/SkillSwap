import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { initializeSocket } from './sockets/index.js';

let server = null;
let io = null;
let dbConnected = false;

const startServer = async (attemptNumber = 1) => {
  try {
    // Connect to MongoDB only once
    if (!dbConnected) {
      await connectDatabase();
      dbConnected = true;
    }

    // Close existing server if any
    if (server) {
      // Close socket.io first to release connections
      if (io) {
        try {
          io.close();
        } catch (e) {
          console.error('Error closing Socket.IO:', e.message);
        }
        io = null;
      }

      await new Promise((resolve) => {
        server.close(resolve);
      });
    }

    // Create fresh HTTP server
    server = http.createServer(app);
    io = initializeSocket(server, config);

    // Set max listeners
    server.setMaxListeners(20);
    if (io) io.setMaxListeners(20);

    // Listen on port
    await new Promise((resolve, reject) => {
      server.listen(config.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${config.port}`);
        console.log(`📡 Environment: ${config.nodeEnv}`);
        console.log(`🌐 Client origin: ${config.clientOrigin}`);
        resolve();
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`EADDRINUSE`));
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    if (error.message === 'EADDRINUSE') {
      console.error(`❌ Port ${config.port} is already in use`);
      if (attemptNumber < 3) {
        console.log(`⏳ Waiting 3 seconds before retrying... (Attempt ${attemptNumber}/3)`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await startServer(attemptNumber + 1);
      } else {
        console.error('❌ Failed to start server after 3 attempts');
        console.error('💡 Run: netstat -ano | findstr :4000 | taskkill /PID <pid> /F');
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', error.message);
      if (io) try { io.close(); } catch (e) {}
      process.exit(1);
    }
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  if (server) {
    if (io) {
      try { io.close(); } catch (e) {}
      io = null;
    }

    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  if (server) {
    if (io) {
      try { io.close(); } catch (e) {}
      io = null;
    }

    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle nodemon restarts (SIGUSR2)
process.once('SIGUSR2', () => {
  console.log('👋 SIGUSR2 received (nodemon restart), shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('✅ Process terminated for restart');
      process.kill(process.pid, 'SIGUSR2');
    });
  } else {
    process.kill(process.pid, 'SIGUSR2');
  }
});

// Catch uncaught exceptions to avoid leaving the port open
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Start the server
startServer();
