const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

const mockFriends = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', streak_days: 15 },
  { id: '2', name: 'Mike Rodriguez', email: 'mike@example.com', streak_days: 8 }
];

const mockPools = [];

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'PoolUp API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// API Routes
app.get('/api/users/:userId', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.userId) || mockUsers[0];
  res.json(user);
});

app.get('/api/users/:userId/pools', (req, res) => {
  res.json([]);
});

app.get('/api/users/:userId/transactions', (req, res) => {
  res.json([]);
});

app.post('/api/pools', (req, res) => {
  const newPool = {
    id: Date.now().toString(),
    ...req.body,
    saved_cents: 0,
    created_at: new Date().toISOString()
  };
  res.status(201).json(newPool);
});

app.get('/api/users/:userId/friends', (req, res) => {
  res.json(mockFriends);
});

app.post('/api/users/:userId/friend-requests', (req, res) => {
  res.json({ success: true, requestId: Date.now() });
});

app.put('/api/friend-requests/:requestId', (req, res) => {
  res.json({ success: true });
});

app.delete('/api/users/:userId/friends/:friendId', (req, res) => {
  res.json({ success: true });
});

app.get('/api/users/:userId/friend-requests', (req, res) => {
  res.json([]);
});

app.post('/api/milestones', (req, res) => {
  const milestone = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  res.status(201).json(milestone);
});

app.get('/api/pools/:poolId/milestones', (req, res) => {
  res.json([]);
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
// Force redeploy
