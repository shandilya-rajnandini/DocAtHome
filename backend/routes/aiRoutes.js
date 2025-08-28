const express = require('express');
const suggestSpecialty = require('../controllers/aiController.js').suggestSpecialty;

const router = express.Router();

router.route('/suggest-specialty').post(suggestSpecialty);

module.exports = router;
