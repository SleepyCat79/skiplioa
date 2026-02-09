# Real-Time Board Management Tool (Mini Trello App)

🎥 **Video Demo**: [https://youtu.be/EybNPfCEutM](https://youtu.be/EybNPfCEutM)

## Overview

So this is how i solve the problem for the coding challenge. Im building a real-time board management application that allow teams to collaborate on cards, track tasks and monitor progress. The app support multiple users with drag-and-drop feature and real-time updates using WebSocket.

## Technologies Used

### Frontend

- React.js with Vite
- TypeScript
- Ant Design (UI components)
- Zustand (state management)
- React Router (routing)
- Socket.io-client (real-time updates)
- Axios (HTTP requests)
- @dnd-kit/core (drag and drop functionality)

### Backend

- Node.js with Express
- Firebase Firestore (database)
- Socket.io (WebSocket for real-time)
- JWT (authentication)
- Nodemailer (email verification)
- GitHub OAuth integration

## Project Structure

So basically the project got 2 main part - frontend and backend. Frontend is React app with Vite setup, pretty standard stuff. I put all the components in `src/components/` like TaskCard, TaskDrawer, GitHubPanel and all that. The pages go in `src/pages/` - Login, Signup, Dashboard, BoardDetail and some profile pages.

For state management im using Zustand, all stores are in `src/stores/` folder. Got authStore for login stuff, boardStore for board data, and taskStore for tasks. API calls using axios are in `src/services/api.ts` and socket connection in `src/services/socket.ts`.

Backend is Express server in the `server/` folder. I organize it like this - controllers handle the logic, routes define endpoints, middleware for JWT auth, services for email and websocket. Config folder got firebase setup and github oauth stuff. Pretty straightforward node backend really.

## How I Solved The Problem

### 1. Authentication System

First i implement the authentication without password. When user signup or signin, they need to:

- Enter their email
- Receive a 6-digit verification code via email
- Enter the code to verify
- Get JWT token for authenticated requests

I use nodemailer to send emails and Firebase to store verification codes temporarily (expires in 10 minutes). The code also support GitHub OAuth as alternate signin method.

### 2. Real-Time Updates

For real-time feature, i use Socket.io. When any user make changes (create/update/delete tasks or cards), all connected users receive updates immediately through WebSocket connection. This make the collaboration feel instant.

### 3. Board & Card Management

Users can:

- Create multiple boards
- Each board contains cards
- Invite other members to boards via email
- View all boards they own or been invited to

### 4. Task Management with Drag & Drop

This is the main feature. I use @dnd-kit/core library for drag and drop. Tasks can be moved between different status columns:

- Icebox
- Backlog
- In Progress
- In Review
- Done

When you drag a task, it update in database and broadcast to all users in real-time.

### 5. GitHub Integration

Users can connect thier GitHub account and:

- View repositories
- See branches, pull requests, issues, commits
- Attach PR/commits/issues to specific tasks
- Track development progress directly in the board

### 6. User Management

Admin or board owners can:

- View list of all users
- Update user information
- Manage board members

## API Endpoints

### Authentication

- `POST /api/auth/send-code` - Send verification code to email
- `POST /api/auth/signup` - Create new account with verification code
- `POST /api/auth/signin` - Sign in with verification code
- `POST /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user profile

### Boards

- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/invite` - Invite member to board

### Cards

- `GET /api/boards/:boardId/cards` - Get all cards in board
- `POST /api/boards/:boardId/cards` - Create new card
- `GET /api/boards/:boardId/cards/:id` - Get card details
- `PUT /api/boards/:boardId/cards/:id` - Update card
- `DELETE /api/boards/:boardId/cards/:id` - Delete card

### Tasks

- `GET /api/boards/:boardId/cards/:cardId/tasks` - Get all tasks
- `POST /api/boards/:boardId/cards/:cardId/tasks` - Create task
- `GET /api/boards/:boardId/cards/:cardId/tasks/:taskId` - Get task details
- `PUT /api/boards/:boardId/cards/:cardId/tasks/:taskId` - Update task
- `DELETE /api/boards/:boardId/cards/:cardId/tasks/:taskId` - Delete task
- `POST /api/boards/:boardId/cards/:cardId/tasks/:taskId/assign` - Assign member to task

### GitHub

- `GET /api/github/repos` - Get user repositories
- `GET /api/github/repos/:owner/:repo/branches` - Get branches
- `GET /api/github/repos/:owner/:repo/pulls` - Get pull requests
- `GET /api/github/repos/:owner/:repo/commits` - Get commits
- `GET /api/github/repos/:owner/:repo/issues` - Get issues

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Features Implemented

✅ Email-based authentication (no password)
✅ GitHub OAuth integration  
✅ Real-time updates using WebSocket
✅ Board creation and management
✅ Card creation within boards
✅ Task management with status columns
✅ Drag and drop tasks between columns
✅ Invite members to boards
✅ Assign tasks to members
✅ User profile management
✅ GitHub repository integration
✅ Attach GitHub PR/issues/commits to tasks
✅ Responsive design
✅ Real-time notifications

## Known Issues & Improvements

Some things i notice during development:

- Email sending might be slow depending on SMTP provider
- Could add more validation on frontend forms
- GitHub integration could show more details
- Need to add pagination for large datasets

## Screenshots

All screenshots are located in the `image/` folder.

### 1. Login/Signup Page

![Login/Signup Page](image/login.png)

### 2. Dashboard with Boards

![Dashboard](image/dashboard.png)

### 3. Board Detail with Task Columns

![Board Detail](image/board-detail.png)

### 4. Task Drawer with Details

![Task Drawer](image/task-drawer.png)

### 5. GitHub Integration Panel

![GitHub Integration](image/github-panel.png)

### 6. User Management Page

![User Management](image/users.png)

---
