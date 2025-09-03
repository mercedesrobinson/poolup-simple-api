# PoolUp Simple API

A lightweight Express.js backend for the PoolUp mobile app with mock data endpoints.

## Features

- User management
- Friends system (add/remove friends, friend requests)
- Savings pools
- Milestone tracking
- CORS enabled for mobile app integration

## API Endpoints

- `GET /` - Health check
- `GET /api/users/:userId` - Get user info
- `GET /api/users/:userId/pools` - Get user's pools
- `POST /api/pools` - Create new pool
- `GET /api/users/:userId/friends` - Get user's friends
- `POST /api/users/:userId/friend-requests` - Send friend request
- `PUT /api/friend-requests/:requestId` - Accept/decline friend request
- `DELETE /api/users/:userId/friends/:friendId` - Remove friend
- `GET /api/users/:userId/friend-requests` - Get pending requests
- `POST /api/milestones` - Create milestone
- `GET /api/pools/:poolId/milestones` - Get pool milestones

## Deployment

Deploy to Render.com:
1. Build Command: `npm install`
2. Start Command: `npm start`
3. Environment: Node.js

## Local Development

```bash
npm install
npm start
```

Server runs on port 3000 (or PORT environment variable).
