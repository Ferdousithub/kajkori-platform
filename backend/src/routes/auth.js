const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post('/send-otp',
  [
    body('phoneNumber')
      .matches(/^\+880\d{10}$/)
      .withMessage('Invalid Bangladesh phone number format. Use +880XXXXXXXXXX')
  ],
  validateRequest,
  authController.sendOTP
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login/register user
 * @access  Public
 */
router.post('/verify-otp',
  [
    body('phoneNumber')
      .matches(/^\+880\d{10}$/)
      .withMessage('Invalid phone number'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
    body('userType')
      .isIn(['job_seeker', 'employer'])
      .withMessage('Invalid user type'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters')
  ],
  validateRequest,
  authController.verifyOTP
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Public
 */
router.post('/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  validateRequest,
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authController.logout);

module.exports = router;
