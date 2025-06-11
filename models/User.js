const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Current friends
  // friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User',  }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  

  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },

  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
