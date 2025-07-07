const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware untuk memverifikasi JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }
        
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Cari user berdasarkan ID dari token
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }
        
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Akun telah dinonaktifkan'
            });
        }
        
        // Tambahkan user ke request object
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token telah expired'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Error autentikasi'
            });
        }
    }
};

// Middleware untuk memverifikasi role (host only)
const requireHost = (req, res, next) => {
    console.log('requireHost middleware - User data:', {
        userId: req.user._id,
        username: req.user.username,
        accountType: req.user.accountType,
        isActive: req.user.isActive
    });
    
    if (req.user.accountType !== 'host') {
        console.log('Access denied - User accountType:', req.user.accountType);
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya host yang dapat mengakses fitur ini'
        });
    }
    
    console.log('Host access granted for user:', req.user.username);
    next();
};

// Middleware untuk memverifikasi role (participant only)
const requireParticipant = (req, res, next) => {
    if (req.user.accountType !== 'participant') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya participant yang dapat mengakses fitur ini'
        });
    }
    next();
};

// Middleware untuk memverifikasi kepemilikan resource
const requireOwnership = (resourceModel) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            const resource = await resourceModel.findById(resourceId);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource tidak ditemukan'
                });
            }
            
            // Cek apakah user adalah pemilik resource
            if ((resource.host || resource.userId).toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Anda tidak memiliki akses ke resource ini'
                });
            }
            
            req.resource = resource;
            next();
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error memverifikasi kepemilikan resource'
            });
        }
    };
};

// Middleware untuk optional authentication (tidak wajib login)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
        
    } catch (error) {
        // Jika token tidak valid, lanjutkan tanpa user
        next();
    }
};

module.exports = {
    authenticateToken,
    requireHost,
    requireParticipant,
    requireOwnership,
    optionalAuth
}; 