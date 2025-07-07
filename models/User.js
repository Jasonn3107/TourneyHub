const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Nama wajib diisi'],
        trim: true,
        maxlength: [50, 'Nama tidak boleh lebih dari 50 karakter']
    },
    username: {
        type: String,
        required: [true, 'Username wajib diisi'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username minimal 3 karakter'],
        maxlength: [30, 'Username tidak boleh lebih dari 30 karakter'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore']
    },
    email: {
        type: String,
        required: [true, 'Email wajib diisi'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Format email tidak valid']
    },
    password: {
        type: String,
        required: [true, 'Password wajib diisi'],
        minlength: [8, 'Password minimal 8 karakter'],
        select: false // Password tidak akan dikembalikan dalam query
    },
    accountType: {
        type: String,
        required: [true, 'Tipe akun wajib dipilih'],
        enum: {
            values: ['participant', 'host'],
            message: 'Tipe akun harus participant atau host'
        }
    },
    profile: {
        avatar: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio tidak boleh lebih dari 500 karakter'],
            default: ''
        },
        phone: {
            type: String,
            match: [/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'],
            default: null
        },
        dateOfBirth: {
            type: Date,
            default: null
        },
        location: {
            type: String,
            maxlength: [100, 'Lokasi tidak boleh lebih dari 100 karakter'],
            default: ''
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // Menambahkan createdAt dan updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual untuk full name
userSchema.virtual('fullName').get(function() {
    return this.firstName;
});

// Index untuk optimasi query
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ accountType: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware untuk enkripsi password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Method untuk membandingkan password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing password');
    }
};

// Static method untuk mencari user berdasarkan email atau username
userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier.toLowerCase() }
        ]
    }).select('+password');
};

// Static method untuk mengecek ketersediaan username
userSchema.statics.isUsernameAvailable = function(username) {
    return this.findOne({ username: username.toLowerCase() })
        .then(user => !user);
};

// Static method untuk mengecek ketersediaan email
userSchema.statics.isEmailAvailable = function(email) {
    return this.findOne({ email: email.toLowerCase() })
        .then(user => !user);
};

module.exports = mongoose.model('User', userSchema); 