// controllers/userController.js
const User = require('../models/User');

exports.fetchIncomingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests', 'username email');
    res.json(user.friendRequests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/userController.js or friendsController.js
exports.getFriends = async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate('friends', 'username _id') // populate only needed fields
        .exec();
  
      res.status(200).json(user.friends); // send populated array
    } catch (error) {
      res.status(500).json({ message: 'Error fetching friends', error });
    }
  };

// GET /api/friends
exports.getFriends = async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate('friends', 'username _id') // ✅ populate friend details
        .exec();
  
      res.status(200).json(user.friends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      res.status(500).json({ message: 'Error fetching friends' });
    }
  };
  
  
// controllers/userController.js
const logoutUser = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        user.online = false;
        await user.save();
      }
      res.status(200).json({ message: 'User logged out' });
    } catch (err) {
      res.status(500).json({ message: 'Logout failed' });
    }
  };
  