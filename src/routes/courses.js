const express = require('express');
const router = express.Router({ mergeParams: true });
const { createCourse, getCourse, getCourses, updateCourse, deleteCourse } = require('../controllers/courses');;

const Course = require('../models/course');
const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(advancedResults(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, createCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;