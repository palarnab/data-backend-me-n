const express = require('express');
const router = express.Router();
const { geocode } = require('../controllers/geocode');

router.route('/').post(geocode);

module.exports = router;