const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users pending verification
// @route   GET /api/admin/pending
exports.getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ isVerified: false, role: { $in: ['doctor', 'nurse'] } });
  res.json(pendingUsers);
});

// @desc    Approve a user by ID
// @route   PUT /api/admin/approve/:id
exports.approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  user.isVerified = true;
  await user.save();
  res.json({ msg: 'User approved successfully' });
});

// @desc    List intake form generation logs
// @route   GET /api/admin/intake-form-logs
exports.getIntakeFormLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const { generatedBy, appointmentId, q, startDate, endDate } = req.query;

  const IntakeFormLog = require('../models/IntakeFormLog');
  const filter = {};
  if (generatedBy) filter.generatedBy = generatedBy;
  if (appointmentId) filter.appointment = appointmentId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const total = await IntakeFormLog.countDocuments(filter);
  let logs = await IntakeFormLog.find(filter)
    .populate('appointment', 'appointmentDate appointmentTime')
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // simple text search across generatedBy.name/email and appointment id
  if (q) {
    const ql = q.toLowerCase();
    logs = logs.filter((l) => {
      const name = (l.generatedBy && l.generatedBy.name) || '';
      const email = (l.generatedBy && l.generatedBy.email) || '';
      const apptId = (l.appointment && (l.appointment._id || '') ).toString();
      return (
        name.toLowerCase().includes(ql) ||
        email.toLowerCase().includes(ql) ||
        apptId.includes(ql) ||
        (l.fileUrl || '').toLowerCase().includes(ql)
      );
    });
  }

  res.json({ total, page, limit, data: logs });
});

// @desc    Export intake form logs as CSV
// @route   GET /api/admin/intake-form-logs/export
exports.exportIntakeFormLogs = asyncHandler(async (req, res) => {
  const { generatedBy, appointmentId, q, startDate, endDate } = req.query;
  const filter = {};
  if (generatedBy) filter.generatedBy = generatedBy;
  if (appointmentId) filter.appointment = appointmentId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const IntakeFormLog = require('../models/IntakeFormLog');
  const logs = await IntakeFormLog.find(filter)
    .populate('appointment', 'appointmentDate appointmentTime')
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Apply simple q text filter client-side similar to listing
  let out = logs;
  if (q) {
    const ql = q.toLowerCase();
    out = out.filter((l) => {
      const name = (l.generatedBy && l.generatedBy.name) || '';
      const email = (l.generatedBy && l.generatedBy.email) || '';
      const apptId = (l.appointment && (l.appointment._id || '') ).toString();
      return (
        name.toLowerCase().includes(ql) ||
        email.toLowerCase().includes(ql) ||
        apptId.includes(ql) ||
        (l.fileUrl || '').toLowerCase().includes(ql)
      );
    });
  }

  // Build CSV
  const headers = ['timestamp', 'generatedById', 'generatedByName', 'generatedByEmail', 'appointmentId', 'appointmentDate', 'appointmentTime', 'fileUrl', 'ip', 'userAgent'];
  const escape = (v) => '"' + (v === undefined || v === null ? '' : String(v).replace(/"/g, '""')) + '"';
  const rows = out.map((l) => [
    l.createdAt,
    l.generatedBy?._id || '',
    l.generatedBy?.name || '',
    l.generatedBy?.email || '',
    l.appointment?._id || '',
    l.appointment?.appointmentDate || '',
    l.appointment?.appointmentTime || '',
    l.fileUrl || '',
    l.ip || '',
    l.userAgent || ''
  ].map(escape).join(','));

  const csv = headers.map(escape).join(',') + '\n' + rows.join('\n');

  const filename = `intake-form-logs-${new Date().toISOString().slice(0,10)}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

