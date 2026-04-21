const express = require('express');
const router = express.Router();
const { getPrediction } = require('../controllers/predictController');

// We can add auth middleware here later, but keep it open for easy testing now
router.post('/', getPrediction);

module.exports = router;
