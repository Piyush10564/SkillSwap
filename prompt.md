You are working in a monorepo for a project called SkillSwap, a skill‑exchange platform where users can offer skills to teach and list skills they want to learn. The frontend UI is already generated with React + Vite and lives in a client folder. Your job is to turn this into a complete, production‑ready MERN application with a Node.js/Express backend, MongoDB, WebSocket‑based real‑time chat/notifications, and Docker support for local development and deployment.
​

High‑level goals
Keep the existing React + Vite UI intact; do not rewrite or delete the client code unless explicitly required for integration.

Create a clean, well‑structured backend in a server folder using Node.js, Express, Mongoose, and Socket.IO (or native WebSocket + adapter).

Implement authentication (login/signup with JWT), skills CRUD, skill search/matching, and real‑time chat between users.

Wire the frontend to the backend APIs and WebSocket events so the full SkillSwap experience works end‑to‑end.

Add Docker support so the whole stack can run with a single docker-compose up command.
​

Project structure
Create/ensure the following structure at the project root:

client/ – existing React + Vite UI from Aura.

server/

src/

config/ (env, DB connection)

models/ (User, Skill, Conversation, Message, Notification)

routes/ (auth, skills, search, chat, notifications, user profile)

controllers/

middlewares/ (auth, error handler)

sockets/ (socket entry + handlers)

utils/ (JWT, validation helpers)

app.js

server.js

package.json

docker-compose.yml

Dockerfile.client

Dockerfile.server

.env.example

.antigravity (this file).
​

If any of these files or directories are missing, create them with sensible defaults.

Backend requirements (Express + MongoDB)
Tech choices
Runtime: Node.js (LTS).

Framework: Express.

DB: MongoDB with Mongoose ODM.

Auth: JWT (access + optional refresh), bcrypt for password hashing.

WebSockets: Socket.IO server integrated into the Express server.js.

Validation: Express middleware with either Joi/Zod or lightweight custom validation.

Logging: Minimal console logging plus a basic error‑handling middleware.
​

Environment variables
Create .env.example with keys like:

PORT

MONGO_URI

JWT_ACCESS_SECRET

JWT_REFRESH_SECRET

CLIENT_ORIGIN

NODE_ENV

Use these in config and ensure CORS + cookies are correctly configured for local dev (http://localhost:5173 by default for Vite).

Data models
Implement Mongoose models with timestamps:

User

name

email (unique, required)

password (hashed)

avatarUrl (optional)

bio (optional)

location

timezone

roles (e.g., ["user"])

skillsOffer (array of embedded skill refs or objects)

skillsLearn (same structure as offer)

preferences:

learningStyle (text, call, async)

availability (simple structure for now)

lastOnlineAt

Skill

name

category (Programming, Design, Language, etc.)

level (Beginner/Intermediate/Expert)

type ("offer" or "learn")

owner (User ref)

description

Conversation

participants (array of User refs, usually length 2)

lastMessage (Message ref)

unreadCounts per user

Message

conversation (Conversation ref)

sender (User ref)

content (text)

seenBy (array of User refs)

createdAt/updatedAt

Notification

user (User ref)

type ("match", "message", "request", etc.)

data (generic payload)

isRead

createdAt.

Use indexes where useful (e.g., email, skill name/category).
​

API routes
Under server/src/routes/ and controllers/, build REST endpoints:

Auth

POST /api/auth/signup

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me (returns current user profile)

Use JWT in HTTP‑only cookies or Authorization header.

Skills

GET /api/skills/mine – skills I offer and want to learn.

POST /api/skills – create skill (offer or learn).

PUT /api/skills/:id

DELETE /api/skills/:id.

Search & matches

GET /api/search/skills with query params:

q, category, level, type, timezone, mode.

GET /api/matches/suggestions – return suggested users based on:

Skills I want to learn vs others’ skillsOffer.

Skills I offer vs others’ skillsLearn.

Keep logic simple but extensible.

Chat

GET /api/chat/conversations

GET /api/chat/conversations/:id/messages

POST /api/chat/conversations/:id/messages – create message (for non‑socket fallback/SEO).

Notifications

GET /api/notifications

POST /api/notifications/:id/read (mark as read).
​

Add authentication middleware to protect all non‑public routes.

WebSockets (real‑time chat & notifications)
Server‑side socket behavior
Inside server/src/sockets:

Initialize Socket.IO in server.js, using the existing HTTP server.

Use JWT from the client (e.g., via auth token in connection params or cookie) to authenticate the socket connection.

Track which users are online (in memory map keyed by userId or using a simple adapter).

Events (names are suggestions, feel free to refine but keep them consistent across client and server):

connection / disconnect

user:online / user:offline

chat:join (join conversation room)

chat:leave

chat:message (sender sends a message)

chat:message:new (server emits to participants)

chat:typing / chat:typing:stop

notification:new (for new matches, chat requests, etc.).
​

Whenever a message is created:

Persist it in MongoDB.

Update the Conversation lastMessage and unread counts.

Emit chat:message:new to the relevant room and notification:new to the recipient.

Frontend integration (React + Vite)
You already have a UI from Aura under client/. Connect it to the backend as follows without radically changing the visual layout:

Auth flows

Wire login/signup forms to /api/auth/signup and /api/auth/login.

Store auth token securely (prefer HTTP‑only cookie; if using local storage, encapsulate in a small auth utility).

On app load, call /api/auth/me to hydrate the current user context.

Skills screens

Connect “My Skills” UI to:

GET /api/skills/mine

POST, PUT, DELETE /api/skills/...

Use the existing chips/cards UI to display offer vs learn skills.

Discover/search

Hook the search bar and filters to /api/search/skills.

Bind “Request swap” / “Start chat” buttons:

“Start chat” should either open an existing conversation or create one, then navigate to the Messages page.

Chat UI

Integrate Socket.IO client in a central socketClient module.

On login, connect the socket with the user’s token.

In the chat page:

Subscribe to conversation list via REST.

Subscribe to chat:message:new, chat:typing, and online‑status events to update the UI in real time.

Show typing indicators, seen status, and new message toasts using the existing card and toast components from the Aura UI where possible.

Notifications

Subscribe to notification:new for real‑time toasts.

Use REST to fetch notifications and mark them as read.
​

Keep components idiomatic React, with hooks for data fetching (useEffect, useState / useReducer) and a simple context or state manager (React Context or lightweight store) for auth and socket state. Avoid introducing heavy global state libraries unless necessary.

Docker setup
Create:

Dockerfile.server

Base: node:lts-alpine

Workdir: /app

Copy server/package*.json, install dependencies, then copy source.

Expose backend port (e.g., 5000).

Start with npm run dev or npm start depending on your script.

Dockerfile.client

Base: node:lts-alpine

Build phase: install deps and build Vite app.

Serve phase: use nginx or caddy to serve built static files OR run npm run dev in dev mode.

docker-compose.yml

Services:

client (depends on server)

server

mongo (official MongoDB image with mapped volume)

Environment variables are wired from a .env file.

Map ports:

client: 5173 → host

server: 5000 → host

mongo: 27017 → host (optional for local tools).
​

Ensure docker-compose up --build starts all services so that the React app can call the API via http://server:5000 inside Docker, and via http://localhost:5000 from the host.

Quality, testing, and constraints
Follow clean code practices, descriptive naming, and consistent formatting (add Prettier/ESLint configs if missing).

Add at least a few basic tests (unit or integration) for core backend routes (auth, skills, chat).

Do not store plaintext passwords.

Do not commit real secrets; only .env.example.

Keep the implementation incremental and self‑documenting with clear comments only where logic is non‑obvious.
​

Task:
Apply all of the above to the current repository, wiring the existing Aura‑generated UI to a fully functional MERN backend with real‑time chat and notifications, plus Dockerized local development.