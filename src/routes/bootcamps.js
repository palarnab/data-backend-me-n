const express = require('express');
const router = express.Router();
const { getBootcamp, getBootcamps, updateBootcamp, deleteBootcamp, 
    createBootcamp, getBootcampsInRadius, uploadPhoto } = require('../controllers/bootcamps');

const Bootcamp = require('../models/bootcamp');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

const courseRouter = require('./courses');
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/radius/:zipCode/:distance')
    .get(getBootcampsInRadius);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), uploadPhoto);

module.exports = router;