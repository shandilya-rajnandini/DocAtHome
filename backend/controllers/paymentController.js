const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
exports.createOrder = async (req, res) => {
    const { amount, currency = 'INR' } = req.body; // amount is in the smallest currency unit (e.g., paise)

    const options = {
        amount: Number(amount) * 100, // Convert rupees to paise
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('RAZORPAY ORDER CREATION ERROR:', error);
        res.status(500).send('Something went wrong');
    }
};


// @desc    Verify a Razorpay payment
// @route   POST /api/payment/verify
const Donation = require('../models/Donation');
const User = require('../models/User');

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isDonation, donorName, patientId, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        if (isDonation && donorName && patientId && amount) {
            try {
                // Save donation
                await Donation.create({
                    donorName,
                    patientId,
                    amount,
                    razorpayPaymentId: razorpay_payment_id,
                });
                // Update patient's careFundBalance
                await User.findByIdAndUpdate(patientId, { $inc: { careFundBalance: amount } });
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Donation processing failed.',
                });
            }
        }
        res.json({
            success: true,
            message: 'Payment verified successfully.',
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Payment verification failed.',
        });
    }
};

// @desc    Get all donations for a patient
// @route   GET /api/payment/donations
exports.getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ patientId: req.query.patientId });
        res.json(donations);
    } catch (error) {
        console.error('FETCH DONATIONS ERROR:', error);
        res.status(500).send('Something went wrong');
    }
};
