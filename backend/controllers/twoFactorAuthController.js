const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');

// @desc    Disable 2FA for a user
// @route   POST /api/profile/2fa/disable
// @access  Private
exports.disableTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clear 2FA data
    user.twoFactorSecret = undefined;
    user.isTwoFactorEnabled = false;
    await user.save();

    res.json({
      message: '2FA has been disabled successfully',
      isTwoFactorEnabled: false
    });

  } catch (error) {
    console.error('ERROR in disableTwoFactorAuth:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set up 2FA for a user
// @route   POST /api/profile/2fa/setup
// @access  Private
exports.setupTwoFactorAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({
      name: `DocAtHome (${user.email})`,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error('Error generating QR code:', err);
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.json({
        secret: secret.base32,
        qrCodeUrl: data_url,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify 2FA setup
// @route   POST /api/profile/2fa/verify
// @access  Private
exports.verifyTwoFactorAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
