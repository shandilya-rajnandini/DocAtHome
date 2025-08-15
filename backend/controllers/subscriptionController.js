const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { 
  catchAsync, 
  AppError, 
  ValidationError, 
  NotFoundError 
} = require('../middleware/errorHandler');

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Pro subscription plan
// @route   POST /api/subscription/create-plan
// @access  Private (Professionals only)
exports.createProSubscription = catchAsync(async (req, res, next) => {
  const user = req.user;

  // Check if user is a professional
  if (!['doctor', 'nurse'].includes(user.role)) {
    return next(new ValidationError('Only doctors and nurses can subscribe to Pro'));
  }

  // Check if user already has an active Pro subscription
  if (user.subscriptionTier === 'pro') {
    return next(new ValidationError('You already have an active Pro subscription'));
  }

  // For development/testing, bypass Razorpay if test mode is enabled
  if (process.env.NODE_ENV === 'production' && req.query.test === 'true') {
    // Create a mock subscription for testing
    const mockSubscriptionId = `test_sub_${Date.now()}`;
    const mockPlanId = `test_plan_${Date.now()}`;
    
    res.status(201).json({
      success: true,
      data: {
        subscriptionId: mockSubscriptionId,
        planId: mockPlanId,
        shortUrl: `https://test.razorpay.com/subscription/${mockSubscriptionId}`,
        status: 'created',
        testMode: true
      }
    });
    return;
  }

  // Create Razorpay subscription plan (monthly recurring)
  const planData = {
    period: 'monthly',
    interval: 1,
    item: {
      name: 'Doc@Home Pro Subscription',
      amount: 99900, // ₹999 per month in paise
      currency: 'INR',
      description: 'Monthly Pro subscription for healthcare professionals'
    }
  };

  try {
    // Create plan in Razorpay
    const plan = await instance.plans.create(planData);

    // Create subscription in Razorpay
    const subscriptionData = {
      plan_id: plan.id,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
      addons: [],
      notes: {
        userId: user.id,
        userEmail: user.email,
        tier: 'pro'
      }
    };

    const subscription = await instance.subscriptions.create(subscriptionData);

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        planId: plan.id,
        shortUrl: subscription.short_url,
        status: subscription.status
      }
    });

  } catch (error) {
    console.error('Razorpay subscription creation error:', error);
    return next(new AppError('Failed to create subscription', 500));
  }
});

// @desc    Verify subscription payment and activate Pro features
// @route   POST /api/subscription/verify
// @access  Private
exports.verifySubscription = catchAsync(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature
  } = req.body;

  // For development/testing, bypass verification if test mode
  if (process.env.NODE_ENV === 'production' && razorpay_subscription_id.startsWith('test_sub_')) {
    // Mock verification for test mode
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Update user subscription status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        subscriptionTier: 'pro',
        subscriptionExpiry: endDate,
        razorpaySubscriptionId: razorpay_subscription_id
      },
      { new: true }
    ).select('-password');

    // Create subscription record
    await Subscription.create({
      user: req.user.id,
      tier: 'pro',
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPlanId: 'test_plan',
      status: 'active',
      endDate: endDate,
      monthlyAmount: 99900,
      nextBillingDate: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Pro subscription activated successfully! (Test Mode)',
      user: updatedUser
    });
    return;
  }

  // Verify signature
  const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return next(new ValidationError('Payment verification failed'));
  }

  try {
    // Fetch subscription details from Razorpay
    const subscriptionDetails = await instance.subscriptions.fetch(razorpay_subscription_id);
    
    // Calculate subscription end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Update user subscription status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        subscriptionTier: 'pro',
        subscriptionExpiry: endDate,
        razorpaySubscriptionId: razorpay_subscription_id
      },
      { new: true }
    ).select('-password');

    // Create subscription record
    await Subscription.create({
      user: req.user.id,
      tier: 'pro',
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayPlanId: subscriptionDetails.plan_id,
      status: 'active',
      endDate: endDate,
      monthlyAmount: 99900, // ₹999 in paise
      nextBillingDate: endDate
    });

    res.status(200).json({
      success: true,
      message: 'Pro subscription activated successfully!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Subscription verification error:', error);
    return next(new AppError('Failed to verify subscription', 500));
  }
});

// @desc    Get current user's subscription status
// @route   GET /api/subscription/status
// @access  Private
exports.getSubscriptionStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('subscriptionTier subscriptionExpiry razorpaySubscriptionId');
  
  if (!user) {
    return next(new NotFoundError('User not found'));
  }

  let subscription = null;
  if (user.subscriptionTier === 'pro') {
    subscription = await Subscription.findOne({ 
      user: req.user.id, 
      status: 'active' 
    }).sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    data: {
      tier: user.subscriptionTier,
      expiry: user.subscriptionExpiry,
      subscription: subscription
    }
  });
});

// @desc    Cancel Pro subscription
// @route   POST /api/subscription/cancel
// @access  Private
exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (user.subscriptionTier !== 'pro') {
    return next(new ValidationError('No active Pro subscription found'));
  }

  try {
    // Cancel subscription in Razorpay
    await instance.subscriptions.cancel(user.razorpaySubscriptionId);

    // Update user and subscription records
    await User.findByIdAndUpdate(user.id, {
      subscriptionTier: 'free',
      subscriptionExpiry: null,
      razorpaySubscriptionId: null
    });

    await Subscription.findOneAndUpdate(
      { user: user.id, status: 'active' },
      { status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return next(new AppError('Failed to cancel subscription', 500));
  }
});

// @desc    Handle Razorpay webhook for payment events (subscriptions)
// @route   POST /api/subscription/webhook
// @access  Public (Razorpay webhook)
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  try {
    switch (event.event) {
      case 'payment.captured':
        // Handle successful subscription payment
        await handleSubscriptionPayment(event.payload.payment.entity);
        break;

      case 'payment.failed':
        // Handle failed subscription payment
        await handleFailedSubscriptionPayment(event.payload.payment.entity);
        break;

      case 'payment.authorized':
        // Handle authorized payment (usually followed by capture)
        console.log('Payment authorized:', event.payload.payment.entity.id);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for webhook processing
const handleSubscriptionPayment = async (payment) => {
  // For subscription payments, we need to check if this is a recurring payment
  if (payment.description && payment.description.includes('subscription')) {
    console.log('Processing subscription payment:', payment.id);
    
    // You can extract user info from payment notes or description
    // and extend their subscription period
    
    // For now, just log the successful payment
    console.log('Subscription payment successful:', {
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status
    });
  }
};

const handleFailedSubscriptionPayment = async (payment) => {
  console.log('Subscription payment failed:', {
    paymentId: payment.id,
    amount: payment.amount,
    errorCode: payment.error_code,
    errorDescription: payment.error_description
  });
  
  // Here you might want to:
  // 1. Mark subscription as inactive
  // 2. Send notification to user
  // 3. Provide grace period
};
