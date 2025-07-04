const express = require('express');
const router = express.Router();
const { getNurses, getNurseById } = require('../controllers/nurseController');

// Route to get all nurses (with potential filters)
router.get('/', getNurses);

// Route to get a single nurse by their ID
router.get('/:id', getNurseById);

module.exports = router;