const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

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

// @desc    Verify a Razorpay payment and store transaction
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    description,
  } = req.body;

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
    console.error('Transaction save error:', err);
    return res.status(500).json({
      success: false,
      message: 'Payment verified, but storing transaction failed.',
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
