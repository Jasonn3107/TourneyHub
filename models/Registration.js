const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamName: {
        type: String,
        trim: true,
        maxlength: [50, 'Nama tim tidak boleh lebih dari 50 karakter'],
        default: null
    },
    teamMembers: [{
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, 'Nama anggota tim tidak boleh lebih dari 50 karakter']
        },
        email: {
            type: String,
            trim: true,
            maxlength: [100, 'Email tidak boleh lebih dari 100 karakter']
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [20, 'Nomor telepon tidak boleh lebih dari 20 karakter']
        },
        gameId: {
            type: String,
            trim: true,
            maxlength: [50, 'Game ID tidak boleh lebih dari 50 karakter']
        },
        role: {
            type: String,
            trim: true,
            maxlength: [30, 'Role tidak boleh lebih dari 30 karakter']
        }
    }],
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected', 'cancelled'],
            message: 'Status harus salah satu dari: pending, approved, rejected, cancelled'
        },
        default: 'pending'
    },
    payment: {
        method: {
            type: String,
            enum: ['transfer', 'ewallet', 'cash', 'free']
        },
        amount: {
            type: Number
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded']
        },
        proof: {
            type: String,
            default: null
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    additionalInfo: {
        experience: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'professional']
        },
        previousTournaments: {
            type: String,
            trim: true,
            maxlength: [500, 'Informasi turnamen sebelumnya tidak boleh lebih dari 500 karakter']
        },
        achievements: {
            type: String,
            trim: true,
            maxlength: [500, 'Pencapaian tidak boleh lebih dari 500 karakter']
        },
        socialMedia: {
            instagram: {
                type: String,
                trim: true,
                maxlength: [100, 'Username Instagram tidak boleh lebih dari 100 karakter']
            },
            twitter: {
                type: String,
                trim: true,
                maxlength: [100, 'Username Twitter tidak boleh lebih dari 100 karakter']
            },
            youtube: {
                type: String,
                trim: true,
                maxlength: [100, 'Channel YouTube tidak boleh lebih dari 100 karakter']
            }
        }
    },
    notes: {
        fromHost: {
            type: String,
            trim: true,
            maxlength: [1000, 'Catatan dari host tidak boleh lebih dari 1000 karakter'],
            default: ''
        },
        fromParticipant: {
            type: String,
            trim: true,
            maxlength: [1000, 'Catatan dari peserta tidak boleh lebih dari 1000 karakter'],
            default: ''
        }
    },
    checkedIn: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date,
        default: null
    },
    finalRank: {
        type: Number,
        min: [1, 'Rank tidak boleh kurang dari 1'],
        default: null
    },
    prize: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual untuk isPaid
registrationSchema.virtual('isPaid').get(function() {
    if (!this.payment) return false;
    return this.payment.status === 'paid' || this.payment.method === 'free';
});

// Virtual untuk canParticipate
registrationSchema.virtual('canParticipate').get(function() {
    if (!this.payment) return this.status === 'approved';
    return this.status === 'approved' && this.isPaid;
});

// Index untuk optimasi query
registrationSchema.index({ tournament: 1, participant: 1 }, { unique: true });
registrationSchema.index({ tournament: 1, status: 1 });
registrationSchema.index({ participant: 1, status: 1 });
registrationSchema.index({ 'payment.status': 1 });
registrationSchema.index({ createdAt: -1 });

// Pre-save middleware untuk validasi
registrationSchema.pre('save', function(next) {
    // Validasi jumlah anggota tim jika ada
    if (this.teamMembers && this.teamMembers.length > 0) {
        // Maksimal 5 anggota tim
        if (this.teamMembers.length > 5) {
            return next(new Error('Maksimal 5 anggota tim'));
        }
    }
    
    // Validasi payment amount jika payment ada
    if (this.payment && this.payment.amount !== undefined && this.payment.amount < 0) {
        return next(new Error('Jumlah pembayaran tidak boleh negatif'));
    }
    
    next();
});

// Method untuk approve registration
registrationSchema.methods.approve = function(notes = '') {
    this.status = 'approved';
    if (notes) this.notes.fromHost = notes;
    return this.save();
};

// Method untuk reject registration
registrationSchema.methods.reject = function(notes = '') {
    this.status = 'rejected';
    if (notes) this.notes.fromHost = notes;
    return this.save();
};

// Method untuk cancel registration
registrationSchema.methods.cancel = function(notes = '') {
    this.status = 'cancelled';
    if (notes) this.notes.fromParticipant = notes;
    return this.save();
};

// Method untuk mark as paid
registrationSchema.methods.markAsPaid = function(proof = null) {
    this.payment.status = 'paid';
    this.payment.paidAt = new Date();
    if (proof) this.payment.proof = proof;
    return this.save();
};

// Method untuk check in
registrationSchema.methods.checkIn = function() {
    this.checkedIn = true;
    this.checkedInAt = new Date();
    return this.save();
};

// Static method untuk mengecek apakah user sudah terdaftar
registrationSchema.statics.isUserRegistered = function(tournamentId, userId) {
    return this.findOne({
        tournament: tournamentId,
        participant: userId,
        status: { $in: ['pending', 'approved'] }
    });
};

// Static method untuk mendapatkan statistik registrasi
registrationSchema.statics.getRegistrationStats = function(tournamentId) {
    return this.aggregate([
        { $match: { tournament: mongoose.Types.ObjectId(tournamentId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

module.exports = mongoose.model('Registration', registrationSchema); 