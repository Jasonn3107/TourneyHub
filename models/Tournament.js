const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['esport', 'sport'],
        required: [true, 'Jenis turnamen (esport/sport) wajib diisi']
    },
    title: {
        type: String,
        required: [true, 'Judul turnamen wajib diisi'],
        trim: true,
        maxlength: [100, 'Judul turnamen tidak boleh lebih dari 100 karakter']
    },
    description: {
        type: String,
        required: [true, 'Deskripsi turnamen wajib diisi'],
        trim: true,
        maxlength: [2000, 'Deskripsi turnamen tidak boleh lebih dari 2000 karakter']
    },
    game: {
        type: String,
        required: [true, 'Game wajib diisi'],
        trim: true,
        maxlength: [50, 'Nama game tidak boleh lebih dari 50 karakter']
    },
    category: {
        type: String,
        enum: {
            values: ['MOBA', 'FPS', 'Battle Royale', 'Strategy', 'Sports', 'Fighting', 'Racing', 'Other'],
            message: 'Kategori harus salah satu dari: MOBA, FPS, Battle Royale, Strategy, Sports, Fighting, Racing, Other'
        }
    },
    format: {
        type: String,
        enum: {
            values: ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss System', 'League'],
            message: 'Format harus salah satu dari: Single Elimination, Double Elimination, Round Robin, Swiss System, League'
        }
    },
    maxParticipants: {
        type: Number,
        required: [true, 'Jumlah maksimal peserta wajib diisi'],
        min: [2, 'Minimal 2 peserta'],
        max: [1000, 'Maksimal 1000 peserta']
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    entryFee: {
        type: Number,
        default: 0,
        min: [0, 'Entry fee tidak boleh negatif']
    },
    prizePool: {
        first: {
            type: Number,
            min: [0, 'Hadiah tidak boleh negatif']
        },
        second: {
            type: Number,
            default: 0,
            min: [0, 'Hadiah tidak boleh negatif']
        },
        third: {
            type: Number,
            default: 0,
            min: [0, 'Hadiah tidak boleh negatif']
        }
    },
    schedule: {
        registrationDeadline: {
            type: Date,
            required: [true, 'Deadline pendaftaran wajib diisi']
        },
        startDate: {
            type: Date,
            required: [true, 'Tanggal mulai wajib diisi']
        },
        endDate: {
            type: Date,
            required: [true, 'Tanggal selesai wajib diisi']
        }
    },
    rules: {
        type: String,
        trim: true,
        maxlength: [5000, 'Peraturan tidak boleh lebih dari 5000 karakter']
    },
    requirements: {
        type: String,
        trim: true,
        maxlength: [1000, 'Persyaratan tidak boleh lebih dari 1000 karakter'],
        default: ''
    },
    termsConditions: {
        type: [{
            title: {
                type: String,
                trim: true,
                required: true
            },
            content: {
                type: String,
                trim: true,
                required: true
            }
        }],
        default: []
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'open', 'registration_closed', 'ongoing', 'completed', 'cancelled', 'soon'],
            message: 'Status harus salah satu dari: draft, open, registration_closed, ongoing, completed, cancelled, soon'
        },
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: {
            values: ['public', 'private'],
            message: 'Visibility harus public atau private'
        },
        default: 'public'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Tag tidak boleh lebih dari 20 karakter']
    }],
    images: {
        banner: {
            type: String,
            default: null
        },
        logo: {
            type: String,
            default: null
        }
    },
    location: {
        type: {
            type: String,
            enum: ['online', 'offline', 'hybrid'],
            default: 'online'
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200, 'Alamat tidak boleh lebih dari 200 karakter'],
            default: ''
        },
        city: {
            type: String,
            trim: true,
            maxlength: [50, 'Kota tidak boleh lebih dari 50 karakter'],
            default: ''
        }
    },
    contact: {
        email: {
            type: String,
            trim: true,
            maxlength: [100, 'Email tidak boleh lebih dari 100 karakter'],
            default: ''
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [20, 'Nomor telepon tidak boleh lebih dari 20 karakter'],
            default: ''
        },
        whatsapp: {
            type: String,
            trim: true,
            maxlength: [20, 'Nomor WhatsApp tidak boleh lebih dari 20 karakter'],
            default: ''
        }
    },
    organizer: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Nama penyelenggara tidak boleh lebih dari 100 karakter'],
            default: ''
        },
        role: {
            type: String,
            trim: true,
            maxlength: [100, 'Peran penyelenggara tidak boleh lebih dari 100 karakter'],
            default: ''
        },
        email: {
            type: String,
            trim: true,
            maxlength: [100, 'Email penyelenggara tidak boleh lebih dari 100 karakter'],
            default: ''
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [20, 'Nomor telepon penyelenggara tidak boleh lebih dari 20 karakter'],
            default: ''
        }
    },
    statistics: {
        views: {
            type: Number,
            default: 0
        },
        registrations: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual untuk total prize pool
tournamentSchema.virtual('totalPrizePool').get(function() {
    return this.prizePool.first + this.prizePool.second + this.prizePool.third;
});

// Virtual untuk registration status
tournamentSchema.virtual('registrationStatus').get(function() {
    if (this.status === 'draft') return 'draft';
    if (this.status === 'cancelled') return 'cancelled';
    if (this.currentParticipants >= this.maxParticipants) return 'full';
    if (new Date() > this.schedule.registrationDeadline) return 'closed';
    return 'open';
});

// Virtual untuk tournament progress
tournamentSchema.virtual('progress').get(function() {
    const now = new Date();
    const start = this.schedule.startDate;
    const end = this.schedule.endDate;
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'completed';
});

// Index untuk optimasi query
tournamentSchema.index({ host: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ category: 1 });
tournamentSchema.index({ game: 1 });
tournamentSchema.index({ 'schedule.startDate': 1 });
tournamentSchema.index({ visibility: 1 });
tournamentSchema.index({ createdAt: -1 });

// Text index untuk pencarian
tournamentSchema.index({
    title: 'text',
    description: 'text',
    game: 'text',
    tags: 'text'
});

// Pre-save middleware untuk validasi tanggal
tournamentSchema.pre('save', function(next) {
    // Validasi tanggal
    if (this.schedule.registrationDeadline >= this.schedule.startDate) {
        return next(new Error('Deadline pendaftaran harus sebelum tanggal mulai'));
    }
    
    if (this.schedule.startDate >= this.schedule.endDate) {
        return next(new Error('Tanggal mulai harus sebelum tanggal selesai'));
    }
    
    // Validasi prize pool
    if (this.prizePool.first < this.prizePool.second || this.prizePool.second < this.prizePool.third) {
        return next(new Error('Hadiah harus berurutan dari terbesar ke terkecil'));
    }
    
    next();
});

// Method untuk increment views
tournamentSchema.methods.incrementViews = function() {
    this.statistics.views += 1;
    return this.save();
};

// Method untuk increment registrations
tournamentSchema.methods.incrementRegistrations = function() {
    this.statistics.registrations += 1;
    this.currentParticipants += 1;
    return this.save();
};

// Method untuk decrement registrations
tournamentSchema.methods.decrementRegistrations = function() {
    if (this.currentParticipants > 0) {
        this.currentParticipants -= 1;
    }
    return this.save();
};

// Static method untuk mencari tournament berdasarkan filter
tournamentSchema.statics.findByFilters = function(filters = {}) {
    const query = { visibility: 'public' };
    
    if (filters.category) query.category = filters.category;
    if (filters.game) query.game = { $regex: filters.game, $options: 'i' };
    if (filters.status) query.status = filters.status;
    if (filters.format) query.format = filters.format;
    if (filters.maxEntryFee !== undefined) query.entryFee = { $lte: filters.maxEntryFee };
    if (filters.location) query['location.type'] = filters.location;
    
    // Filter berdasarkan tanggal
    if (filters.dateFrom) {
        query['schedule.startDate'] = { $gte: new Date(filters.dateFrom) };
    }
    if (filters.dateTo) {
        query['schedule.endDate'] = { $lte: new Date(filters.dateTo) };
    }
    
    return this.find(query).populate('host', 'firstName lastName username');
};

module.exports = mongoose.model('Tournament', tournamentSchema); 