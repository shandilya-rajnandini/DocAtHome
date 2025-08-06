const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create a new user with all data from the form
    user = new User(req.body);

    // Hashing is handled by the pre-save hook in User.js model
    await user.save();

    // Create token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    // This is the most important part for debugging.
    // Check your backend terminal for this message.
    console.error('REGISTRATION ERROR:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email, and explicitly include the password for comparison
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Use the matchPassword method from our User model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check if the professional account is verified
    if ((user.role === 'doctor' || user.role === 'nurse') && !user.isVerified) {
      return res.status(401).json({ msg: 'Your account is pending admin approval.' });
    }

    // Create token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    // req.user is attached by our 'protect' middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('GETME ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};