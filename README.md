# SkillSwap

A skill-exchange platform where users can offer skills to teach and list skills they want to learn, with real-time chat, intelligent matching, and Docker support.

## Features

- 🔐 **Authentication**: JWT-based auth with secure password hashing
- 🎯 **Skills Management**: Add, edit, and delete skills you can teach or want to learn
- 🔍 **Smart Matching**: Intelligent algorithm matches users based on complementary skills
- 💬 **Real-time Chat**: Socket.IO powered messaging with typing indicators
- 📨 **Learning Requests**: Send, receive, accept, reject, or cancel skill-learning requests
- 🔔 **Notifications**: Real-time notifications for matches and messages
- 🌍 **Timezone Aware**: Filter matches by timezone for better scheduling
- 📱 **Responsive Design**: Beautiful UI that works on desktop and mobile

## Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Socket.IO Client** for real-time updates
- **Axios** for API calls
- **Tailwind CSS** for styling

### DevOps
- **Docker** & **Docker Compose** for containerization
- **MongoDB** container for database

## Getting Started

### Prerequisites
- Node.js (LTS version)
- Docker and Docker Compose (for containerized setup)
- MongoDB (if running locally without Docker)

### Option 1: Docker Setup (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd SkillSwap
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:5177
- Backend API: http://localhost:4000
- MongoDB: localhost:27017

### Option 2: Local Development

#### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI (if not using Docker):
```
MONGO_URI=mongodb://localhost:27017/skillswap
```

5. Start the server:
```bash
npm run dev
```

Server will run on http://localhost:4000

If you see `Port 4000 is already in use`, the server `predev` script will clear the old listener automatically before starting. If a different process is using the port, stop it first and rerun `npm run dev`.

#### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Client will run on http://localhost:5177

## Project Structure

```
SkillSwap/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service modules
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── sockets/      # Socket.IO handlers
│   │   ├── utils/        # Utility functions
│   │   ├── app.js        # Express app setup
│   │   └── server.js     # Server entry point
│   └── package.json
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile.client      # Client Dockerfile
├── Dockerfile.server      # Server Dockerfile
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Skills
- `GET /api/skills/mine` - Get user's skills
- `POST /api/skills` - Create new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Search & Matching
- `GET /api/search/skills` - Search skills with filters
- `GET /api/search/suggestions` - Get personalized match suggestions

### Chat
- `GET /api/chat/conversations` - Get user's conversations
- `POST /api/chat/conversations` - Create or get conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message

### Learning Requests
- `POST /api/requests` - Create a learning request
- `GET /api/requests/incoming` - View incoming requests for a teacher
- `GET /api/requests/outgoing` - View outgoing requests for a learner
- `PATCH /api/requests/:id` - Accept, reject, or cancel a request

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## Socket.IO Events

### Client → Server
- `chat:join` - Join conversation room
- `chat:leave` - Leave conversation room
- `chat:message` - Send message
- `chat:typing` - Start typing indicator
- `chat:typing:stop` - Stop typing indicator

### Server → Client
- `chat:message:new` - New message received
- `chat:typing` - User is typing
- `chat:typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline
- `notification:new` - New notification

## Environment Variables

### Server (.env)
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_ORIGIN=http://localhost:5177
NODE_ENV=development
```

## Quick Verification

Run the production client build:
```bash
cd client
npm run build
```

Run the end-to-end smoke test for signup/login, request creation, and acceptance:
```bash
cd ..
node e2e_test.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@skillswap.com or open an issue in the repository.
