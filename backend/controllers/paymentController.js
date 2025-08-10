const Razorpay = require('razorpay');
const crypto = require('crypto');

const asyncHandler = require('../middleware/asyncHandler');

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

exports.createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR' } = req.body; // amount is in the smallest currency unit (e.g., paise)

    const options = {
        amount: Number(amount) * 100, // Convert rupees to paise
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };


    const order = await instance.orders.create(options);
    res.json(order);
});



  

// @desc    Verify a Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
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


    if (isDonation && donorName && patientId && amount) {
      // Save donation
      await Donation.create({
        donorName,
        patientId,
        amount,
        razorpayPaymentId: razorpay_payment_id,
      });

      // Update patient's careFundBalance
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

});

// @desc    Get logged-in user's payment history
// @route   GET /api/payment/my-history
// @access  Private
exports.getMyPaymentHistory = asyncHandler(async (req, res) => {

    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: transactions,
    });
});

// @desc    Get all donations for a patient
// @route   GET /api/payment/donations
// @access  Public
exports.getDonations = asyncHandler(async (req, res) => {

    const donations = await Donation.find({ patientId: req.query.patientId });
    return res.status(200).json(donations);
});
