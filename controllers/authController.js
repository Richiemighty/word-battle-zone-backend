// controllers/authController.js
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // ✅ Set online to true
    user.online = true;
    await user.save();
  
    // Send token + user data
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  };
  
// src/features/auth/authSlice.js
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { getState }) => {
      const token = getState().auth.user.token;
      await axios.post('http://localhost:5000/api/users/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return null;
    }
  );
  