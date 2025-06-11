const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Required for DB operations
const { authenticateToken } = require('../middleware/auth'); // Your correct middleware

// GET all incoming friend requests for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests', 'username email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.friendRequests);
  } catch (err) {
    console.error('Error fetching friend requests:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST to respond to a friend request (accept or reject)
router.post('/respond', authenticateToken, async (req, res) => {
  const { requestId, action } = req.body;
  const currentUserId = req.user.id;

  try {
    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(requestId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the sender from current user's friendRequests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== requestId
    );

    if (action === 'accept') {
      if (!currentUser.friends.includes(requestId)) {
        currentUser.friends.push(requestId);
      }
      if (!senderUser.friends.includes(currentUserId)) {
        senderUser.friends.push(currentUserId);
      }
    }

    await currentUser.save();
    await senderUser.save();

    res.json({ success: true, requestId });
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
