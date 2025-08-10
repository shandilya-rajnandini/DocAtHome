const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/authMiddleware');
const { getMyPrescriptions } = require('../controllers/prescriptionController');

router.get('/my-prescriptions', protect, getMyPrescriptions);

// GET all prescriptions for current user
router.get('/', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id });
    res.json(prescriptions);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to process dose' });
  }
});

module.exports = router;