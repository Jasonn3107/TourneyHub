const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { firstName, username, email, password, accountType } = req.body;

        // Cek apakah username sudah ada
        const existingUsername = await User.isUsernameAvailable(username);
        if (!existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        // Cek apakah email sudah ada
        const existingEmail = await User.isEmailAvailable(email);
        if (!existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar'
            });
        }

        // Buat user baru
        const newUser = new User({
            firstName,
            username,
            email,
            password,
            accountType
        });

        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id);

        // Response tanpa password
        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            username: newUser.username,
            email: newUser.email,
            accountType: newUser.accountType,
            profile: newUser.profile,
            isActive: newUser.isActive,
            isVerified: newUser.isVerified,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Akun berhasil dibuat',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = field === 'username' ? 'Username sudah digunakan' : 'Email sudah terdaftar';
            
            return res.status(400).json({
                success: false,
                message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error saat membuat akun',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Cari user berdasarkan email atau username
        const user = await User.findByEmailOrUsername(identifier);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email/username atau password salah'
            });
        }

        // Verifikasi password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email/username atau password salah'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Response tanpa password
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            accountType: user.accountType,
            profile: user.profile,
            isActive: user.isActive,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat login',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logout berhasil'
    });
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, (req, res) => {
    const userResponse = {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
        email: req.user.email,
        accountType: req.user.accountType,
        profile: req.user.profile,
        isActive: req.user.isActive,
        isVerified: req.user.isVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
    };

    res.json({
        success: true,
        data: {
            user: userResponse
        }
    });
});

// @route   POST /api/auth/check-username
// @desc    Check username availability
// @access  Public
router.post('/check-username', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username wajib diisi'
            });
        }

        const isAvailable = await User.isUsernameAvailable(username);

        res.json({
            success: true,
            data: {
                username,
                isAvailable
            }
        });

    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengecek username',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   POST /api/auth/check-email
// @desc    Check email availability
// @access  Public
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email wajib diisi'
            });
        }

        const isAvailable = await User.isEmailAvailable(email);

        res.json({
            success: true,
            data: {
                email,
                isAvailable
            }
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengecek email',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router; 