# SkillSwap - Troubleshooting Guide

## Server Port Conflicts (EADDRINUSE Error)

### Problem
When starting the server, you get an error like:
```
Error: listen EADDRINUSE: address already in use :::4000
```

### Root Cause
Another Node.js process is still running on port 4000. This usually happens when:
- A previous server instance wasn't properly shut down
- You restarted the server too quickly
- The process got hung or crashed

### Solutions

#### Quick Fix (One-Time)
Run this command to kill all Node processes:

**PowerShell:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

**Command Prompt:**
```cmd
taskkill /F /IM node.exe
```

Then restart the server:
```powershell
npm start
```

#### Permanent Solution (Recommended)

**Option 1: Use the startup scripts**

PowerShell (Recommended):
```powershell
.\start-server.ps1
```

Command Prompt:
```cmd
start-server.bat
```

These scripts automatically kill any existing Node processes before starting the server.

**Option 2: Use npm shortcut**

```powershell
npm run restart
```

This runs the custom npm script that kills processes and starts the server.

**Option 3: Add to development workflow**

When using nodemon for development:
```powershell
npm run dev
```

The updated nodemon.json configuration includes better error handling and will automatically handle crashes.

---

## Server Error Handling

### Features Added (v2.0)
The server now includes:

1. **Automatic Port Recovery**: If port 4000 is in use, the server will wait 3 seconds and retry up to 3 times
2. **Better Error Messages**: Clear console output indicating what went wrong
3. **Graceful Shutdown**: Proper cleanup on process termination

### Server Output Examples

**Successful Start:**
```
✅ MongoDB Connected: localhost
🚀 Server running on port 4000
📡 Environment: development
🌐 Client origin: http://localhost:5173
```

**Retry on Port Conflict:**
```
❌ Port 4000 is already in use
⏳ Waiting 3 seconds before retrying... (Attempt 1/3)
🚀 Server running on port 4000
```

---

## Prevention Tips

### 1. Always Shut Down Properly
- Press `Ctrl + C` in the terminal to gracefully stop the server
- Wait for the process to fully exit before restarting

### 2. Use the Startup Scripts
- Instead of `npm start`, use `npm run restart` on Windows
- Or use the provided `.bat` or `.ps1` scripts

### 3. Monitor Running Processes
Check what Node processes are running:

**PowerShell:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, CPU, Memory
```

**Command Prompt:**
```cmd
tasklist | find "node"
```

### 4. Set a Different Port (If Needed)
Edit `.env` in the server folder:
```
PORT=4001
```

Then restart the server.

---

## Development vs Production

### Development (npm run dev)
- Uses `nodemon` for auto-restart on file changes
- Watches for errors and restarts automatically
- Provides better debugging information

### Production (npm start)
- Single server instance
- No file watching
- Better performance
- Use process managers like PM2 for production:
  ```
  npm install -g pm2
  pm2 start src/server.js --name "skillswap-api"
  ```

---

## Additional Resources

- **Main Server File**: `src/server.js`
- **Configuration**: `src/config/env.js`
- **Error Handling**: `src/middlewares/errorHandler.js`
- **Nodemon Config**: `nodemon.json` (for development)

---

## Still Having Issues?

1. Check if MongoDB is running: `mongosh` or MongoDB Compass
2. Check environment variables in `.env` file
3. Look at server logs for specific error messages
4. Try using a different port via `.env`
5. Ensure no firewall is blocking port 4000
