const express = require('express');
const { register, login, getMe, forgotPassword, updateDetails, updatePassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
    .post('/register', register)
    .post('/login', login)
    .post('/forgotPassword', forgotPassword)
    .put('/resetPassword/:resettoken', protect, getMe)
    .put('/updateDetails', protect, updateDetails)
    .put('/updatePassword', protect, updatePassword)
    .get('/me', protect, getMe);

module.exports = router;