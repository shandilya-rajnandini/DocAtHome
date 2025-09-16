// controllers/supportController.js
const SupportGroup = require('../models/SupportGroup');
const SupportMessage = require('../models/SupportMessage');
const GroupMembership = require('../models/GroupMembership');
const asyncHandler = require('../middleware/asyncHandler');

// Generate anonymous ID for user in a group
const generateAnonymousId = () => {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate display name for anonymous user
const generateDisplayName = () => {
  const adjectives = ['Hopeful', 'Strong', 'Caring', 'Brave', 'Kind', 'Wise', 'Gentle', 'Resilient'];
  const nouns = ['Warrior', 'Friend', 'Companion', 'Supporter', 'Journeyer', 'Healer', 'Listener', 'Guide'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};

// Get all active support groups
exports.getSupportGroups = asyncHandler(async (req, res) => {
  const { category, condition, search } = req.query;

  let query = { isActive: true };

  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { condition: { $regex: search, $options: 'i' } }
    ];
  }

  const groups = await SupportGroup.find(query)
    .populate('moderator', 'name')
    .sort({ memberCount: -1, createdAt: -1 });

  res.json(groups);
});

// Get single support group with membership status
exports.getSupportGroup = asyncHandler(async (req, res) => {
  const group = await SupportGroup.findById(req.params.id)
    .populate('moderator', 'name');

  if (!group || !group.isActive) {
    return res.status(404).json({ error: 'Support group not found' });
  }

  // Check if user is a member
  let membership = null;
  if (req.user) {
    membership = await GroupMembership.findOne({
      user: req.user.id,
      group: req.params.id,
      isActive: true
    });
  }

  res.json({
    group,
    isMember: !!membership,
    membership
  });
});

// Create new support group (nurse only)
exports.createSupportGroup = asyncHandler(async (req, res) => {
  const { name, description, category, condition, rules, tags } = req.body;

  // Verify user is a nurse
  if (req.user.role !== 'nurse') {
    return res.status(403).json({ error: 'Only nurses can create support groups' });
  }

  const group = new SupportGroup({
    name,
    description,
    category,
    condition,
    moderator: req.user.id,
    rules: rules || [],
    tags: tags || []
  });

  await group.save();

  const populatedGroup = await SupportGroup.findById(group._id)
    .populate('moderator', 'name');

  res.status(201).json(populatedGroup);
});

// Join support group
exports.joinSupportGroup = asyncHandler(async (req, res) => {
  const { displayName } = req.body;

  // Check if already a member
  const existingMembership = await GroupMembership.findOne({
    user: req.user.id,
    group: req.params.id,
    isActive: true
  });

  if (existingMembership) {
    return res.status(400).json({ error: 'Already a member of this group' });
  }

  // Create membership
  const membership = new GroupMembership({
    user: req.user.id,
    group: req.params.id,
    anonymousId: generateAnonymousId(),
    displayName: displayName || generateDisplayName()
  });

  await membership.save();

  // Update group member count
  await SupportGroup.findByIdAndUpdate(req.params.id, {
    $inc: { memberCount: 1 }
  });

  res.status(201).json({
    membership,
    message: 'Successfully joined the support group'
  });
});

// Leave support group
exports.leaveSupportGroup = asyncHandler(async (req, res) => {
  const membership = await GroupMembership.findOneAndUpdate(
    { user: req.user.id, group: req.params.id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!membership) {
    return res.status(404).json({ error: 'Membership not found' });
  }

  // Update group member count
  await SupportGroup.findByIdAndUpdate(req.params.id, {
    $inc: { memberCount: -1 }
  });

  res.json({ message: 'Successfully left the support group' });
});

// Get group messages
exports.getGroupMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Check if user is a member
  const membership = await GroupMembership.findOne({
    user: req.user.id,
    group: req.params.id,
    isActive: true
  });

  if (!membership) {
    return res.status(403).json({ error: 'You must be a member to view messages' });
  }

  const messages = await SupportMessage.find({
    group: req.params.id,
    isVisible: true
  })
  .populate('author', 'displayName')
  .populate('moderatedBy', 'name')
  .populate({
    path: 'replies',
    populate: {
      path: 'author',
      select: 'displayName'
    }
  })
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await SupportMessage.countDocuments({
    group: req.params.id,
    isVisible: true
  });

  res.json({
    messages,
    membership,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Post message to group
exports.postMessage = asyncHandler(async (req, res) => {
  const { content, messageType, parentMessage } = req.body;

  // Check if user is a member
  const membership = await GroupMembership.findOne({
    user: req.user.id,
    group: req.params.id,
    isActive: true
  });

  if (!membership) {
    return res.status(403).json({ error: 'You must be a member to post messages' });
  }

  const message = new SupportMessage({
    group: req.params.id,
    author: {
      anonymousId: membership.anonymousId,
      displayName: membership.displayName
    },
    content,
    messageType: messageType || 'text',
    parentMessage
  });

  await message.save();

  // Update membership last activity
  await GroupMembership.findByIdAndUpdate(membership._id, {
    lastActivity: new Date()
  });

  const populatedMessage = await SupportMessage.findById(message._id)
    .populate('author', 'displayName');

  res.status(201).json(populatedMessage);
});

// Like/unlike message
exports.toggleMessageLike = asyncHandler(async (req, res) => {
  const membership = await GroupMembership.findOne({
    user: req.user.id,
    group: req.params.id,
    isActive: true
  });

  if (!membership) {
    return res.status(403).json({ error: 'You must be a member to like messages' });
  }

  const message = await SupportMessage.findById(req.params.messageId);

  if (!message || !message.isVisible) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const existingLike = message.likes.find(
    like => like.anonymousId === membership.anonymousId
  );

  if (existingLike) {
    // Remove like
    message.likes = message.likes.filter(
      like => like.anonymousId !== membership.anonymousId
    );
  } else {
    // Add like
    message.likes.push({
      anonymousId: membership.anonymousId,
      likedAt: new Date()
    });
  }

  await message.save();

  res.json({
    liked: !existingLike,
    likeCount: message.likes.length
  });
});

// Moderate message (nurse only)
exports.moderateMessage = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // action: 'hide', 'show'

  // Check if user is the group moderator
  const group = await SupportGroup.findById(req.params.id);

  if (!group || group.moderator.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Only group moderators can moderate messages' });
  }

  const message = await SupportMessage.findById(req.params.messageId);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (action === 'hide') {
    message.isVisible = false;
    message.isModerated = true;
    message.moderatedBy = req.user.id;
    message.moderationReason = reason;
  } else if (action === 'show') {
    message.isVisible = true;
    message.isModerated = false;
    message.moderatedBy = null;
    message.moderationReason = null;
  }

  await message.save();

  res.json({
    message: 'Message moderated successfully',
    action,
    message: message
  });
});

// Get user's memberships
exports.getUserMemberships = asyncHandler(async (req, res) => {
  const memberships = await GroupMembership.find({
    user: req.user.id,
    isActive: true
  })
  .populate('group', 'name description category condition memberCount')
  .sort({ lastActivity: -1 });

  res.json(memberships);
});