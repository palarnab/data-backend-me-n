const Bootcamp = require('../models/bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const path = require('path');

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res
        .status(200)
        .json(res.advancedResults); 
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        next(new ErrorResponse(`Cannot get bootcamp with id ${req.params.id}`, 400));
    } else {
        res
            .status(200)
            .json({ success: true, data: bootcamp });   
    } 
});

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;

    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    if (publishedBootcamp && req.user.role !== 'admin') {
        next(new ErrorResponse(`The user with ID ${req.user.id} has already published`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);
    res
        .status(201)
        .json({ success: true, data: bootcamp }); 
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!bootcamp) {
        next(new ErrorResponse(`Cannot update bootcamp with id ${req.params.id}`, 400));
    } else if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User ${req.params.id} is not authorised`, 400));
    } else {
        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res
            .status(200)
            .json({ success: true, data: bootcamp });   
    }  
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        next(new ErrorResponse(`Cannot delete bootcamp with id ${req.params.id}`, 400));
    } else if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User ${req.params.id} is not authorised`, 400));
    } else {
        bootcamp.remove();
        res
            .status(200)
            .json({ success: true, data: {} });   
    }  
});

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipCode, distance } = req.params;

    const loc = await geocoder.geocode(zipCode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // earth's radius is 3963miles/6378km
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: {$centerSphere: [[lng, lat], radius]} },
    });

    res
        .status(200)
        .json({ success: true, data: bootcamps, count: bootcamps.length }); 
});

exports.uploadPhoto = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        next(new ErrorResponse(`Cannot fine bootcamp with id ${req.params.id}`, 400));
    } else if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        next(new ErrorResponse(`User ${req.params.id} is not authorised`, 400));
    } else {
        if (!req.files) {
            next(new ErrorResponse(`Please upload photo to bootcamp with id ${req.params.id}`, 400));
        }

        const file = req.files.file;
        if (!file.mimetype.startsWith('image')) {
            next(new ErrorResponse(`Please upload photo to bootcamp with id ${req.params.id}`, 400));
        }

        if (file.size > process.env.FILE_UPLOAD_SIZELIMIT) {
            next(new ErrorResponse(`Please upload photo < ${process.env.FILE_UPLOAD_SIZELIMIT}
                to bootcamp with id ${req.params.id}`, 400));
        }

        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if (err) {
                console.error(err);
                next(new ErrorResponse(err.message, 500));
            }

            await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name} );

            res.status(200).json({
                success: true,
                data: file.name
            });
        });
    }  
});