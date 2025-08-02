const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// (The 'register' and 'getMe' functions can remain as they are)
// ...

exports.login = async (req, res) => {
  console.log("\n--- LOGIN ATTEMPT INITIATED ---");

  try {
    const { email, password } = req.body;
    
    // --- DEBUG PROBE 1 ---
    // Let's see what the frontend is sending us.
    console.log("1. Received from frontend - Email:", email);
    console.log("1. Received from frontend - Password:", password);

    if (!email || !password) {
        console.log("ERROR: Email or password was not received from the frontend.");
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // --- DEBUG PROBE 2 ---
    // Let's find the user in the database and see what we get.
    console.log("2. Searching database for user with email:", email);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log("3. RESULT: User NOT found in the database. Login failed.");
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    
    console.log("3. RESULT: User FOUND in the database. User's name:", user.name);
    
    // --- DEBUG PROBE 3 ---
    // Let's look at the hashed password stored in the database.
    // It should be a very long string of random characters.
    console.log("4. Hashed password stored in DB:", user.password);

    // --- DEBUG PROBE 4 ---
    // Now, let's compare the password from the form with the one from the DB.
    console.log("5. Comparing form password with hashed password...");
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("6. RESULT: Passwords DO NOT MATCH. Login failed.");
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log("6. RESULT: Passwords MATCH! Login successful.");
    
    // If we reach here, the login is successful. Now create and send the token.
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        console.log("7. JWT token created and sent to user.");
        console.log("--- LOGIN ATTEMPT FINISHED ---\n");
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('FATAL LOGIN ERROR:', err.message);
    res.status(500).send('Server error');
  }
};


// ... Make sure your other functions (register, getMe) are also in this file
exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const newUser = new User(req.body);
    await newUser.save();
    const payload = { user: { id: newUser.id, role: newUser.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err.message);
    res.status(500).send('Server error');
  }
};
exports.getMe = async (req, res) => {
  try {
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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to user
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time to 10 minutes
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error('EMAIL ERROR:', err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).send('Email could not be sent');
    }
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).send('Server error');
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, data: 'Password updated' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).send('Server error');
  }
};
