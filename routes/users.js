const express = require('express');
const User = require('../models/User');
const { validateUpdateProfile, validateChangePassword } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, (req, res) => {
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

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validateUpdateProfile, async (req, res) => {
    try {
        const { firstName, lastName, profile } = req.body;
        
        const updateData = {};
        
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (profile) {
            updateData.profile = { ...req.user.profile, ...profile };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        const userResponse = {
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            username: updatedUser.username,
            email: updatedUser.email,
            accountType: updatedUser.accountType,
            profile: updatedUser.profile,
            isActive: updatedUser.isActive,
            isVerified: updatedUser.isVerified,
            lastLogin: updatedUser.lastLogin,
            createdAt: updatedUser.createdAt
        };

        res.json({
            success: true,
            message: 'Profile berhasil diperbarui',
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat memperbarui profile',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, validateChangePassword, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verifikasi password saat ini
        const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Password saat ini salah'
            });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengubah password',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isActive: false });

        res.json({
            success: true,
            message: 'Akun berhasil dinonaktifkan'
        });

    } catch (error) {
        console.error('Deactivate account error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat menonaktifkan akun',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   GET /api/users/:username
// @desc    Get public user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ 
            username: username.toLowerCase(),
            isActive: true 
        }).select('firstName lastName username profile accountType createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    accountType: user.accountType,
                    profile: user.profile,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get user by username error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengambil data user',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router; 