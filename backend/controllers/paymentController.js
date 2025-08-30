const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Donation = require('../models/Donation');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// SECURITY: All payment amounts are fetched from Razorpay API to prevent
// client-side manipulation. We never trust client-provided amounts.
// This ensures data integrity and prevents financial fraud.
//
// INTEGRITY CHECKS:
// - Payment status must be 'captured'
// - Order ID must match between payment and request
// - Currency must be 'INR'
// - Patient must exist in database
// - Order context must match donation intent (via notes verification)
// - Prevents replay attacks, cross-context crediting, and order mismatches

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', isDonation, patientId, donorName } = req.body;

  // Amount validation: Must be a valid number between ₹1 and ₹1,00,00,000
  // Will be converted to paise and rounded to nearest integer

  // Validate required environment variables before making Razorpay API calls
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({
      success: false,
      message: 'Payment configuration error: missing RAZORPAY_KEY_ID',
    });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Payment configuration error: missing RAZORPAY_KEY_SECRET',
    });
  }

  // Validate and sanitize the incoming amount
  if (!amount || amount === '') {
    return res.status(400).json({
      success: false,
      message: 'Amount is required and cannot be empty',
    });
  }

  // Parse and validate the amount
  const parsedAmount = parseFloat(amount);
  
  if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a valid number',
    });
  }

  if (parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than zero',
    });
  }

  // Validate reasonable bounds (e.g., minimum 1 rupee, maximum 1 crore rupees)
  if (parsedAmount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be at least ₹1',
    });
  }

  if (parsedAmount > 10000000) { // 1 crore rupees
    return res.status(400).json({
      success: false,
      message: 'Amount cannot exceed ₹1,00,00,000',
    });
  }

  // Convert to paise by rounding to the nearest integer
  const amountInPaise = Math.round(parsedAmount * 100);

  // API expects amount in paise, convert from rupees to paise for storage
  // This ensures all monetary amounts are stored consistently as integer paise
  const options = {
    amount: amountInPaise, // Use validated and rounded paise amount
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  // Add context information to order notes for stronger binding
  if (isDonation && patientId) {
    options.notes = {
      isDonation: 'true',
      patientId: patientId.toString(),
      donorName: donorName || 'Anonymous',
      context: 'donation'
    };
  } else {
    options.notes = {
      context: 'subscription',
      userId: req.user.id.toString()
    };
  }

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
    // amount is no longer used - we fetch canonical amount from Razorpay
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

  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({
      success: false,
      message: 'Payment verification configuration error: missing RAZORPAY_KEY_ID',
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

      // Integrity checks
      if (payment.status !== 'captured') {
        return res.status(400).json({
          success: false,
          message: `Payment status is ${payment.status}, not captured`,
        });
      }
      if (payment.order_id !== razorpay_order_id) {
        return res.status(400).json({
          success: false,
          message: 'Payment does not correspond to the provided order',
        });
      }
      if (payment.currency !== 'INR') {
        return res.status(400).json({
          success: false,
          message: `Unsupported currency: ${payment.currency}`,
        });
      }

      // Verify order context matches donation intent
      try {
        const order = await instance.orders.fetch(razorpay_order_id);
        if (order.notes && order.notes.isDonation === 'true') {
          if (order.notes.patientId !== patientId.toString()) {
            return res.status(400).json({
              success: false,
              message: 'Order was created for a different patient',
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: 'Order was not created for donation purposes',
          });
        }
      } catch (orderError) {
        console.error('Error fetching order for context verification:', orderError);
        return res.status(400).json({
          success: false,
          message: 'Unable to verify order context',
        });
      }

      // Use the canonical amount from Razorpay (already in paise)
      const canonicalAmount = payment.amount;
      
      // Ensure patient exists
      const patient = await User.findById(patientId).select('_id');
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

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

    // Integrity checks for regular transactions
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: `Payment status is ${payment.status}, not captured`,
      });
    }
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment does not correspond to the provided order',
      });
    }
    if (payment.currency !== 'INR') {
      return res.status(400).json({
        success: false,
        message: `Unsupported currency: ${payment.currency}`,
      });
    }

    // Use the canonical amount from Razorpay (already in paise)
    const canonicalAmount = payment.amount;
    
    // const savedTransaction = await Transaction.create({
    //   userId: req.user.id,
    //   razorpayOrderId: razorpay_order_id,
    //   razorpayPaymentId: razorpay_payment_id,
    //   amount: canonicalAmount, // Use Razorpay amount in paise
    //   currency: 'INR',
    //   description: description || 'No description provided',
    //   status: 'paid',
    // });
    const savedTransaction = await Transaction.create({
      patientId: req.user.id, // whoever is paying (the patient)
      professionalId: req.body.professionalId, // should come from request or session context
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: canonicalAmount,
      currency: "INR",
      description: description || "No description provided",
      status: "success",
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
// exports.getMyPaymentHistory = asyncHandler(async (req, res) => {
//     const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       data: transactions,
//     });
// });

// @desc    Get logged-in user's payment history
exports.getMyPaymentHistory = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ patientId: req.user.id }) 
    .sort({ createdAt: -1 });

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