const Course = require('../models/course');
const Bootcamp = require('../models/bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId});

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
    
});

exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
;
    if (!course) {
        next(new ErrorResponse(`Cannot get course with id ${req.params.id}`, 400));
    } else {
        res
            .status(200)
            .json({ success: true, data: course });   
    } 
});

exports.createCourse = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamps with id of ${req.params.bootcampId}`), 404);
    }

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User ${req.user.id} is not authorised`, 400));
    }

    const course = await Course.create(req.body);
    res
        .status(201)
        .json({ success: true, data: course }); 
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!course) {
        next(new ErrorResponse(`Cannot update course with id ${req.params.id}`, 400));
    } else if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User ${req.user.id} is not authorised`, 400));
    } else {
        res
            .status(200)
            .json({ success: true, data: course });   
    }  
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        next(new ErrorResponse(`Cannot delete course with id ${req.params.id}`, 400));
    } else if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User ${req.user.id} is not authorised`, 400));
    } else {
        await course.remove();
        res
            .status(200)
            .json({ success: true, data: {} });   
    }  
});