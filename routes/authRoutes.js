const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, signOut } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/signout', protect, signOut);

module.exports = router;