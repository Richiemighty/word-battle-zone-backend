const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Get user's friends
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username online lastSeen');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a friend request
router.post('/request/:targetUserId', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.targetUserId;

    console.log('🔹 Current user:', currentUserId);
    console.log('🔹 Target user:', targetUserId);

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser) {
      console.log('❌ Current user not found in DB');
      return res.status(404).json({ error: 'Current user not found' });
    }

    if (!targetUser) {
      console.log('❌ Target user not found in DB');
      return res.status(404).json({ error: 'Target user not found' });
    }

    if (currentUser.friends.includes(targetUser._id)) {
      console.log('❌ Already friends');
      return res.status(400).json({ error: 'Already friends' });
    }

    if (targetUser.friendRequests.includes(currentUser._id)) {
      console.log('❌ Friend request already sent');
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    targetUser.friendRequests.push(currentUser._id);
    await targetUser.save();

    console.log('✅ Friend request successfully sent');
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('🔥 Internal Server Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});




// Accept friend request
router.post('/accept/:requesterId', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requester = await User.findById(req.params.requesterId);

    if (!currentUser.friendRequests.includes(requester._id)) {
      return res.status(400).json({ error: 'No request from this user' });
    }

    currentUser.friends.push(requester._id);
    requester.friends.push(currentUser._id);
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== requester._id.toString()
    );

    await currentUser.save();
    await requester.save();
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject friend request
router.post('/reject/:requesterId', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== req.params.requesterId
    );
    await currentUser.save();
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get incoming friend requests
router.get('/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests', 'username online');
    res.json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add/remove friend manually
router.post('/:friendId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendIndex = user.friends.indexOf(req.params.friendId);
    
    if (friendIndex === -1) {
      user.friends.push(req.params.friendId);
    } else {
      user.friends.splice(friendIndex, 1);
    }

    await user.save();
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/friends/requests/incoming
router.get('/requests/incoming', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests', 'username email'); // populates sender details
    res.json(user.friendRequests);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


// GET /api/friends
router.get('/friends', async (req, res) => {
  try {
    const userId = req.user.id; // assuming req.user is populated by auth middleware
    const user = await User.findById(userId).populate('friends', 'username _id'); // 👈 Populate usernames

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.friends); // 👈 Return full friend objects, not just ObjectIds
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
