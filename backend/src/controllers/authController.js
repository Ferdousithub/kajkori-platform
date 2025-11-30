const jwt = require('jsonwebtoken');
const { cache } = require('../config/redis');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { sendSMS } = require('../services/smsService');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'kajkori-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

class AuthController {
  /**
   * Send OTP to phone number
   */
  async sendOTP(req, res) {
    try {
      const { phoneNumber } = req.body;
      
      // Generate 6-digit OTP
      const otp = process.env.NODE_ENV === 'development' 
        ? '123456' // Fixed OTP for development
        : Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in Redis with 5 minute expiry
      await cache.set(`otp:${phoneNumber}`, otp, 300);
      
      // Send SMS (skip in development)
      if (process.env.NODE_ENV !== 'development') {
        await sendSMS(phoneNumber, `Your KajKori verification code is: ${otp}. Valid for 5 minutes.`);
      }
      
      logger.info(`OTP sent to ${phoneNumber}: ${otp}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully',
        ...(process.env.NODE_ENV === 'development' && { otp }) // Include OTP in dev mode
      });
      
    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP',
        error: error.message 
      });
    }
  }

  /**
   * Verify OTP and login/register user
   */
  async verifyOTP(req, res) {
    try {
      const { phoneNumber, otp, userType, name, deviceToken } = req.body;
      
      // Verify OTP
      const storedOTP = await cache.get(`otp:${phoneNumber}`);
      
      if (!storedOTP || storedOTP !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }
      
      // Delete used OTP
      await cache.del(`otp:${phoneNumber}`);
      
      // Find or create user
      let user = await User.findOne({ where: { phoneNumber } });
      let isNewUser = false;
      
      if (!user) {
        // Create new user
        user = await User.create({
          phoneNumber,
          userType,
          name: name || 'User',
          deviceToken,
          lastLoginAt: new Date()
        });
        
        // Create profile based on user type
        if (userType === 'job_seeker') {
          await WorkerProfile.create({ userId: user.id });
        } else if (userType === 'employer') {
          await EmployerProfile.create({ userId: user.id });
        }
        
        isNewUser = true;
        logger.info(`New user registered: ${phoneNumber} (${userType})`);
      } else {
        // Update existing user
        user.lastLoginAt = new Date();
        if (deviceToken) {
          user.deviceToken = deviceToken;
        }
        await user.save();
        logger.info(`User logged in: ${phoneNumber}`);
      }
      
      // Generate tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          userType: user.userType 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      const refreshToken = jwt.sign(
        { 
          userId: user.id,
          tokenType: 'refresh'
        },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      );
      
      // Store refresh token in Redis
      await cache.set(
        `refresh_token:${user.id}`,
        refreshToken,
        30 * 24 * 60 * 60 // 30 days in seconds
      );
      
      res.json({
        success: true,
        message: isNewUser ? 'Registration successful' : 'Login successful',
        isNewUser,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          userType: user.userType,
          email: user.email,
          profilePhoto: user.profilePhoto,
          isVerified: user.isVerified,
          language: user.language
        },
        accessToken,
        refreshToken
      });
      
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify OTP',
        error: error.message 
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      if (decoded.tokenType !== 'refresh') {
        return res.status(400).json({
          success: false,
          message: 'Invalid token type'
        });
      }
      
      // Check if refresh token exists in Redis
      const storedToken = await cache.get(`refresh_token:${decoded.userId}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      
      // Get user
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }
      
      // Generate new access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          userType: user.userType 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({
        success: true,
        accessToken: newAccessToken
      });
      
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token',
        error: error.message 
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        // Delete refresh token from Redis
        await cache.del(`refresh_token:${userId}`);
      }
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to logout',
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();
