const { body, validationResult } = require('express-validator');

// Middleware untuk menangani hasil validasi
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Data tidak valid',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

// Validasi untuk signup
const validateSignup = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('Nama wajib diisi')
        .isLength({ max: 50 }).withMessage('Nama tidak boleh lebih dari 50 karakter')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Nama hanya boleh berisi huruf dan spasi'),
    
    body('username')
        .trim()
        .notEmpty().withMessage('Username wajib diisi')
        .isLength({ min: 3, max: 30 }).withMessage('Username harus 3-30 karakter')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username hanya boleh berisi huruf, angka, dan underscore')
        .toLowerCase(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email wajib diisi')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail()
        .toLowerCase(),
    
    body('password')
        .notEmpty().withMessage('Password wajib diisi')
        .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
    
    body('accountType')
        .notEmpty().withMessage('Tipe akun wajib dipilih')
        .isIn(['participant', 'host']).withMessage('Tipe akun harus participant atau host'),
    
    handleValidationErrors
];

// Validasi untuk login
const validateLogin = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Email atau username wajib diisi'),
    
    body('password')
        .notEmpty().withMessage('Password wajib diisi'),
    
    handleValidationErrors
];

// Validasi untuk update profile
const validateUpdateProfile = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Nama depan tidak boleh lebih dari 50 karakter')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Nama depan hanya boleh berisi huruf dan spasi'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Nama belakang tidak boleh lebih dari 50 karakter')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Nama belakang hanya boleh berisi huruf dan spasi'),
    
    body('profile.bio')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Bio tidak boleh lebih dari 500 karakter'),
    
    body('profile.phone')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Format nomor telepon tidak valid'),
    
    body('profile.dateOfBirth')
        .optional()
        .isISO8601().withMessage('Format tanggal lahir tidak valid'),
    
    body('profile.location')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Lokasi tidak boleh lebih dari 100 karakter'),
    
    handleValidationErrors
];

// Validasi untuk change password
const validateChangePassword = [
    body('currentPassword')
        .notEmpty().withMessage('Password saat ini wajib diisi'),
    
    body('newPassword')
        .notEmpty().withMessage('Password baru wajib diisi')
        .isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password baru harus mengandung huruf besar, huruf kecil, dan angka'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Konfirmasi password wajib diisi')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Konfirmasi password tidak cocok');
            }
            return true;
        }),
    
    handleValidationErrors
];

module.exports = {
    validateSignup,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword,
    handleValidationErrors
}; 