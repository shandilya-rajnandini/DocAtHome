const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');


// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {

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
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

    // Find user by email, and explicitly include the password for comparison
    let user = await User.findOne({ email }).select('+password');

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

});

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {

    // req.user is attached by our 'protect' middleware

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
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
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
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
});
