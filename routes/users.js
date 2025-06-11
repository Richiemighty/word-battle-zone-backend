const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // ✅ now this works
const { fetchIncomingRequests } = require('../controllers/userController');

// 🔍 Search for users
router.get('/search', protect, async (req, res) => {
  try {
    const { username: searchQuery, page = 1, limit = 10 } = req.query;

    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(searchQuery, 'i');

    const total = await User.countDocuments({
      username: searchRegex,
      _id: { $ne: req.user.id }
    });

    const users = await User.find({
      username: searchRegex,
      _id: { $ne: req.user.id }
    })
      .select('username online lastSeen avatar')
      .sort({ online: -1, username: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      results: users.map(user => ({
        ...user.toObject(),
        online: user.online || false
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// ✅ Fetch incoming friend requests
router.get('/incoming-requests', protect, fetchIncomingRequests);

// ✅ Get current user's info including friendRequests
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friendRequests', 'username email');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
