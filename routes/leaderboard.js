const express = require('express');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = {};
    if (type === 'friends') {
      const user = await User.findById(req.user.id);
      query = { _id: { $in: user.friends } };
    }

    const leaderboard = await User.find(query)
      .sort({ 'stats.points': -1, 'stats.wins': -1 })
      .limit(50)
      .select('username stats');

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;