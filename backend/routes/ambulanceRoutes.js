const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.post('/book', protect, (req, res) => res.status(201).json({ message: 'Ambulance booking received.' }));
router.post('/respond', protect, (req, res) => res.status(200).json({ message: 'Response received.' }));

module.exports = router;