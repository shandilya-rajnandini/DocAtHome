const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const MedicationLog = require('../models/MedicationLog');
const { protect } = require('../middleware/authMiddleware');
const { getMyPrescriptions } = require('../controllers/prescriptionController');

router.get('/my-prescriptions', protect, getMyPrescriptions);

// GET all prescriptions for current user
router.get('/', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id });
    res.json(prescriptions);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// POST create new prescription
router.post('/', protect, async (req, res) => {
  try {
    if (!req.body.diagnosis || !req.body.medicines || !req.body.doctor?.name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const enhancedMedicines = req.body.medicines.map(med => ({
      name: med.name,
      dosage: med.dosage,
      duration: med.duration,
      pillCount: med.initialCount || 0,
      isSmartStockEnabled: med.isSmartStockEnabled || false,
      threshold: med.threshold || Math.floor((med.initialCount || 0) * 0.2)
    }));

    const prescription = new Prescription({
      patient: req.user.id,
      doctor: req.body.doctor,
      diagnosis: req.body.diagnosis,
      medicines: enhancedMedicines
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST take dose endpoint
router.post('/:id/take-dose', protect, async (req, res) => { // ✅ FIXED
  try {
    const { medicineIndex } = req.body;
    
    if (typeof medicineIndex !== 'number') {
      return res.status(400).json({ error: 'Medicine index must be a number' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user.id
    });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

    const medicine = prescription.medicines[medicineIndex];
    if (!medicine) return res.status(400).json({ error: 'Invalid medicine index' });

    if (!medicine.isSmartStockEnabled) {
      return res.status(400).json({ error: 'Smart Stock not enabled' });
    }
    if (medicine.pillCount <= 0) {
      return res.status(400).json({ error: 'No doses remaining' });
    }

    medicine.pillCount -= 1;
    medicine.lastTaken = new Date();

    const shouldNotify = medicine.pillCount <= medicine.threshold;
    if (shouldNotify) {
      console.log(`Low stock alert for ${medicine.name}`);
    }

    await prescription.save();
    res.json({ success: true, pillCount: medicine.pillCount, shouldNotify });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to process dose' });
  }
});

// POST log medication intake
router.post('/:id/log-dose', protect, async (req, res) => {
  try {
    const { medicineIndex, scheduledDate, notes } = req.body;
    
    if (typeof medicineIndex !== 'number') {
      return res.status(400).json({ error: 'Medicine index must be a number' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patient: req.user.id
    });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

    const medicine = prescription.medicines[medicineIndex];
    if (!medicine) return res.status(400).json({ error: 'Invalid medicine index' });

    // Validate date and prevent duplicate logs for the same day
    const sd = new Date(scheduledDate);
    if (Number.isNaN(sd.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduledDate' });
    }
    const dayStart = new Date(sd); dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(sd); dayEnd.setHours(23,59,59,999);
    const existingLog = await MedicationLog.findOne({
      patient: req.user.id,
      prescription: req.params.id,
      medicineName: medicine.name,
      // also persist medicineIndex to disambiguate renamed meds
      scheduledDate: { $gte: dayStart, $lte: dayEnd }
    });

    if (existingLog) {
      return res.status(400).json({ error: 'Dose already logged for this date' });
    }

    const log = new MedicationLog({
      patient: req.user.id,
      prescription: req.params.id,
      medicineName: medicine.name,
      medicineIndex,
      dosage: medicine.dosage,
      scheduledDate: sd,
      takenAt: new Date(),
      isTaken: true,
      notes: notes || ''
    });

    await log.save();
    res.status(201).json({ success: true, log });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to log dose' });
  }
});

// GET medication adherence data
router.get('/adherence', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await MedicationLog.find({
      patient: req.user.id,
      scheduledDate: { $gte: startDate }
    }).sort({ scheduledDate: 1 });

    const totalScheduled = logs.length;
    const totalTaken = logs.filter(log => log.isTaken).length;
    const adherenceScore = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayKey = d => {
      const x = new Date(d); x.setHours(0,0,0,0); return x.getTime();
    };
    const takenDays = new Set(
      logs.filter(l => l.isTaken).map(l => dayKey(l.scheduledDate))
    );
    let cursor = new Date(today);
    while (takenDays.has(cursor.getTime())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
      cursor.setHours(0,0,0,0);
    }

    res.json({
      adherenceScore,
      totalTaken,
      totalScheduled,
      streak,
      logs: logs.slice(-10) // Last 10 logs
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch adherence data' });
  }
});

module.exports = router;