const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Donation = require('../models/Donation');
const User = require('../models/User');

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  // API expects amount in rupees, convert to paise for storage
  // This ensures all monetary amounts are stored consistently as integer paise
  const options = {
    amount: Number(amount) * 100, // Convert rupees to paise
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await instance.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('RAZORPAY ORDER CREATION ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the order.',
    });
  }
};

// @desc    Verify a Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    description,
    isDonation,
    donorName,
    patientId,
  } = req.body;

  // Validate required inputs before cryptographic operations
  if (!razorpay_order_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: razorpay_order_id',
    });
  }
  
  if (!razorpay_payment_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: razorpay_payment_id',
    });
  }
  
  if (!razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: razorpay_signature',
    });
  }
  
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Payment verification configuration error',
    });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return res.status(400).json({
      success: false,
      message: 'Payment verification failed.',
    });
  }

  try {
    if (isDonation && donorName && patientId && amount) {
      // Note: amount is already in paise from Razorpay webhook
      // Save donation with amount in paise
      await Donation.create({
        donorName,
        patientId,
        amount, // Already in paise
        razorpayPaymentId: razorpay_payment_id,
      });

      // Update patient's careFundBalance (amount is already in paise)
      await User.findByIdAndUpdate(patientId, { $inc: { careFundBalance: amount } });

      return res.status(200).json({
        success: true,
        message: 'Donation verified and processed successfully.',
      });
    }

    // Else store as a normal transaction
    const savedTransaction = await Transaction.create({
      userId: req.user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount,
      currency: 'INR',
      description: description || 'No description provided',
      status: 'paid',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and transaction stored.',
      data: savedTransaction,
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Payment verified, but storing details failed.',
    });
  }
};

// @desc    Get logged-in user's payment history
// @route   GET /api/payment/my-history
// @access  Private
exports.getMyPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching payment history.',
    });
  }
};

// @desc    Get all donations for a patient
// @route   GET /api/payment/donations
// @access  Public
exports.getDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ patientId: req.query.patientId });
    return res.status(200).json(donations);
  } catch (error) {
    console.error('FETCH DONATIONS ERROR:', error);
    return res.status(500).send('Something went wrong');
  }
};
