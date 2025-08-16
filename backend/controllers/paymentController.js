const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Donation = require('../models/Donation');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// SECURITY: All payment amounts are fetched from Razorpay API to prevent
// client-side manipulation. We never trust client-provided amounts.
// This ensures data integrity and prevents financial fraud.

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  // API expects amount in rupees, convert to paise for storage
  // This ensures all monetary amounts are stored consistently as integer paise
  const options = {
    amount: Number(amount) * 100, // Convert rupees to paise
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };
    const order = await instance.orders.create(options);
    return res.status(200).json(order);

});

// @desc    Verify a Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount, // Note: This is no longer used - we fetch canonical amount from Razorpay
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

  if (isDonation && donorName && patientId) {
    try {
      // Fetch canonical payment details from Razorpay to get the actual amount
      const payment = await instance.payments.fetch(razorpay_payment_id);
      
      if (!payment || !payment.amount) {
        return res.status(400).json({
          success: false,
          message: 'Unable to fetch payment details from Razorpay',
        });
      }

      // Use the canonical amount from Razorpay (already in paise)
      const canonicalAmount = payment.amount;
      
      // Create donation with canonical amount from Razorpay
      await Donation.create({
        donorName,
        patientId,
        amount: canonicalAmount, // Use Razorpay amount in paise
        razorpayPaymentId: razorpay_payment_id,
      });

      // Update patient's careFundBalance using canonical amount
      await User.findByIdAndUpdate(patientId, { $inc: { careFundBalance: canonicalAmount } });

      return res.status(200).json({
        success: true,
        message: 'Donation verified and processed successfully.',
      });
    } catch (error) {
      // Handle duplicate donation (MongoDB duplicate key error code 11000)
      if (error.code === 11000) {
        return res.status(200).json({
          success: true,
          message: 'Donation already processed (idempotent operation).',
        });
      }
      
      // Handle Razorpay API errors specifically
      if (error.error && error.error.description) {
        console.error('Razorpay API error:', error.error);
        return res.status(400).json({
          success: false,
          message: `Razorpay API error: ${error.error.description}`,
        });
      }
      
      // Log other errors for debugging
      console.error('Donation processing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing donation. Please try again.',
      });
    }
  }

  // Else store as a normal transaction
  try {
    // Fetch canonical payment details from Razorpay to get the actual amount
    const payment = await instance.payments.fetch(razorpay_payment_id);
    
    if (!payment || !payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Unable to fetch payment details from Razorpay',
      });
    }

    // Use the canonical amount from Razorpay (already in paise)
    const canonicalAmount = payment.amount;
    
    const savedTransaction = await Transaction.create({
      userId: req.user.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: canonicalAmount, // Use Razorpay amount in paise
      currency: 'INR',
      description: description || 'No description provided',
      status: 'paid',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and transaction stored.',
      data: savedTransaction,
    });
  } catch (error) {
    // Handle duplicate transaction (MongoDB duplicate key error code 11000)
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Transaction already processed (idempotent operation).',
      });
    }
    
    // Handle Razorpay API errors specifically
    if (error.error && error.error.description) {
      console.error('Razorpay API error:', error.error);
      return res.status(400).json({
        success: false,
        message: `Razorpay API error: ${error.error.description}`,
      });
    }
    
    // Log other errors for debugging
    console.error('Transaction processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing transaction. Please try again.',
    });
  }
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
