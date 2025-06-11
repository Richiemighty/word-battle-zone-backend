const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');

exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the logged-in user's friend requests
    const user = await User.findById(userId).populate('friendRequests', 'username email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return populated friend request users
    res.json(user.friendRequests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// exports.getFriendRequests = async (req, res) => {
//   try {
//     const requests = await FriendRequest.find({ recipient: req.user.id, status: 'pending' })
//       .populate('sender', 'username email'); // ✅ populate sender details
//     res.status(200).json(requests);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

exports.respondToFriendRequest = async (req, res) => {
  const { requestId, action } = req.body;

  try {
    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.recipient.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized' });

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    await request.save();

    res.status(200).json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
