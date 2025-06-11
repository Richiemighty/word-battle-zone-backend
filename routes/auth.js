const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// const User = require('../models/User');


// Register
router.post('/register', async (req, res) => {
    console.log('Register endpoint hit'); // <--- this line
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email, password });
      await user.save();
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.status(201).json({ 
        token,
        user: { 
          id: user._id, 
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    // ✅ Set user online here
    user.online = true;
    await user.save(); // Don't forget to save!

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout Route
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, { online: false });

    res.status(200).json({ message: 'User logged out and marked offline' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});


// // Logout
// router.post('/logout', async (req, res) => {
//   try {
//     const { userId } = req.body; // or extract from token

//     await User.findByIdAndUpdate(userId, { online: false });

//     res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({ error: 'Logout failed' });
//   }
// });



// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends', 'username email'); // ✅ Make sure you populate friends here

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user); // ✅ This response must contain populated `friends`
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/test', (req, res) => {
    res.send('Auth route is working!');
  });
  
module.exports = router;