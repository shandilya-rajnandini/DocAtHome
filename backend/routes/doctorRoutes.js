const express = require('express');
const router = express.Router();

// Import the entire controller object
const doctorController = require('../controllers/doctorController');

// Define the route for fetching all doctors
// Now calls the function from the imported object
router.get('/', doctorController.getDoctors);

router.get('/search', doctorController.searchDoctors);

// Define the route for fetching a single doctor by their ID
router.get('/:id', doctorController.getDoctorById);

module.exports = router;
