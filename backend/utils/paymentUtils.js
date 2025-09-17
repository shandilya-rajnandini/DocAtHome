const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Buffer } = require('buffer');

// Initialize Razorpay only if keys are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create Razorpay order
const createRazorpayOrder = async (orderData) => {
  try {
    if (!razorpay) {
      // Fallback to mock for development
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        status: 'created'
      };
      console.log('Using mock payment (Razorpay keys not configured):', mockOrder);
      return mockOrder;
    }

    const options = {
      amount: orderData.amount * 100, // Razorpay expects amount in paisa
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (paymentData) => {
  try {
    if (!razorpay) {
      // Mock verification for development
      console.log('Using mock payment verification (Razorpay keys not configured)');
      return true;
    }

    const { orderId, paymentId, signature } = paymentData;

    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Verify signature
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return false;
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    if (!razorpay) {
      // Mock payment details
      const mockPayment = {
        id: paymentId,
        amount: 299900, // ₹2999 in paisa
        currency: 'INR',
        status: 'captured',
        method: 'card'
      };
      console.log('Using mock payment details (Razorpay keys not configured)');
      return mockPayment;
    }

    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null) => {
  try {
    if (!razorpay) {
      // Mock refund
      const mockRefund = {
        id: `refund_mock_${Date.now()}`,
        payment_id: paymentId,
        amount: amount ? amount * 100 : 299900,
        status: 'processed'
      };
      console.log('Using mock refund (Razorpay keys not configured)');
      return mockRefund;
    }

    const refundOptions = {
      payment_id: paymentId,
    };

    if (amount) {
      refundOptions.amount = amount * 100; // Convert to paisa
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentDetails,
  refundPayment,
};