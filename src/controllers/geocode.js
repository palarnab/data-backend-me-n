const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');

exports.geocode = asyncHandler(async (req, res, next) => {
    const locations = await geocoder.geocode(req.body.address);

    const result = [];

    locations.forEach(location => {
        result.push({
            city: location.city,
            country: location.countryCode,
            address: location.formattedAddress,
            latitude: location.latitude,
            longitude: location.longitude,
            state: location.stateCode,
            zipcode: location.zipcode,
            confidence: Math.random() * 100
        });
    });

    res.status(200).json({ data: result });
});