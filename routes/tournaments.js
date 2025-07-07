const express = require('express');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const { authenticateToken, requireHost, requireParticipant, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tournaments
// @desc    Get all public tournaments with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            game,
            status,
            format,
            maxEntryFee,
            location,
            dateFrom,
            dateTo,
            search,
            type
        } = req.query;

        const filters = {};
        if (category) filters.category = category;
        if (game) filters.game = game;
        if (status) filters.status = status;
        if (format) filters.format = format;
        if (maxEntryFee) filters.maxEntryFee = parseInt(maxEntryFee);
        if (location) filters.location = location;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        if (type) filters.type = type;

        let query = { visibility: 'public' };

        // Apply filters
        if (filters.category) query.category = filters.category;
        if (filters.game) query.game = { $regex: filters.game, $options: 'i' };
        if (filters.status) query.status = filters.status;
        if (filters.format) query.format = filters.format;
        if (filters.maxEntryFee !== undefined) query.entryFee = { $lte: filters.maxEntryFee };
        if (filters.location) query['location.type'] = filters.location;
        if (filters.type) query.type = filters.type;

        // Date filters
        if (filters.dateFrom) {
            query['schedule.startDate'] = { $gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
            query['schedule.endDate'] = { $lte: new Date(filters.dateTo) };
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const tournaments = await Tournament.find(query)
            .populate('host', 'firstName lastName username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Tournament.countDocuments(query);

        res.json({
            success: true,
            data: {
                tournaments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get tournaments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengambil data turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   GET /api/tournaments/my-registrations
// @desc    Get all tournaments the current participant has registered for
// @access  Private
router.get('/my-registrations', authenticateToken, requireParticipant, async (req, res) => {
    try {
        const registrations = await Registration.find({ participant: req.user._id })
            .populate('tournament');
        res.json({
            success: true,
            data: {
                registrations
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data', error });
    }
});

// @route   GET /api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('host', 'firstName lastName username profile');

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Turnamen tidak ditemukan'
            });
        }

        // Increment views
        await tournament.incrementViews();

        res.json({
            success: true,
            data: {
                tournament
            }
        });

    } catch (error) {
        console.error('Get tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengambil data turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   POST /api/tournaments
// @desc    Create new tournament (Host only)
// @access  Private
router.post('/', authenticateToken, requireHost, async (req, res) => {
    try {
        const tournamentData = {
            ...req.body,
            host: req.user._id
        };

        const tournament = new Tournament(tournamentData);
        await tournament.save();

        const populatedTournament = await Tournament.findById(tournament._id)
            .populate('host', 'firstName lastName username');

        res.status(201).json({
            success: true,
            message: 'Turnamen berhasil dibuat',
            data: {
                tournament: populatedTournament
            }
        });

    } catch (error) {
        console.error('Create tournament error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Data turnamen tidak valid',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error saat membuat turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   PUT /api/tournaments/:id
// @desc    Update tournament (Host only)
// @access  Private
router.put('/:id', authenticateToken, requireHost, requireOwnership(Tournament), async (req, res) => {
    try {
        console.log('Update tournament request body:', req.body);
        
        const updatedTournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('host', 'firstName lastName username');

        console.log('Updated tournament:', updatedTournament);

        res.json({
            success: true,
            message: 'Turnamen berhasil diperbarui',
            data: {
                tournament: updatedTournament
            }
        });

    } catch (error) {
        console.error('Update tournament error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Data turnamen tidak valid',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error saat memperbarui turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   DELETE /api/tournaments/:id
// @desc    Delete tournament (Host only)
// @access  Private
router.delete('/:id', authenticateToken, requireHost, requireOwnership(Tournament), async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Turnamen berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete tournament error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat menghapus turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   GET /api/tournaments/host/my-tournaments
// @desc    Get tournaments created by current host
// @access  Private
router.get('/host/my-tournaments', authenticateToken, requireHost, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { host: req.user._id };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const tournaments = await Tournament.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Tournament.countDocuments(query);

        res.json({
            success: true,
            data: {
                tournaments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get my tournaments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengambil data turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   POST /api/tournaments/:id/register
// @desc    Register for tournament (Participant only)
// @access  Private
router.post('/:id/register', authenticateToken, requireParticipant, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        
        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Turnamen tidak ditemukan'
            });
        }

        // Check if tournament is open for registration
        if (tournament.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Turnamen tidak menerima pendaftaran saat ini'
            });
        }

        // Check if registration deadline has passed
        if (new Date() > tournament.schedule.registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Deadline pendaftaran telah berakhir'
            });
        }

        // Check if tournament is full
        if (tournament.currentParticipants >= tournament.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Turnamen sudah penuh'
            });
        }

        // Check if user is already registered
        const existingRegistration = await Registration.isUserRegistered(req.params.id, req.user._id);
        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah terdaftar di turnamen ini'
            });
        }

        // Transform frontend data to backend format
        const frontendData = req.body;
        const registrationData = {
            tournament: req.params.id,
            participant: req.user._id,
            teamName: frontendData.teamName,
            teamMembers: []
        };

        // Add main team members (member1-member5)
        for (let i = 1; i <= 5; i++) {
            if (frontendData[`member${i}`] && frontendData[`member${i}`].trim()) {
                registrationData.teamMembers.push({
                    name: frontendData[`member${i}`].trim(),
                    email: frontendData.teamEmail || '',
                    phone: '', // Tidak menggunakan whatsappNumber untuk setiap member
                    gameId: '',
                    role: i === 1 ? 'Captain' : 'Player'
                });
            }
        }

        // Add substitutes as notes if provided
        const substitutes = [];
        for (let i = 1; i <= 2; i++) {
            if (frontendData[`substitute${i}`] && frontendData[`substitute${i}`].trim()) {
                substitutes.push(frontendData[`substitute${i}`].trim());
            }
        }

        // Add notes if substitutes exist
        if (substitutes.length > 0) {
            registrationData.notes = {
                fromHost: '',
                fromParticipant: `Substitute players: ${substitutes.join(', ')}`
            };
        }

        const registration = new Registration(registrationData);
        await registration.save();

        // Increment tournament registrations
        await tournament.incrementRegistrations();

        const populatedRegistration = await Registration.findById(registration._id)
            .populate('participant', 'firstName lastName username')
            .populate('tournament', 'title game');

        res.status(201).json({
            success: true,
            message: 'Pendaftaran berhasil',
            data: {
                registration: populatedRegistration
            }
        });

    } catch (error) {
        console.error('Register tournament error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Data pendaftaran tidak valid',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error saat mendaftar turnamen',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// @route   GET /api/tournaments/:id/registrations
// @desc    Get tournament registrations (Host only)
// @access  Private
router.get('/:id/registrations', authenticateToken, requireHost, requireOwnership(Tournament), async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { tournament: req.params.id };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const registrations = await Registration.find(query)
            .populate('participant', 'firstName lastName username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Registration.countDocuments(query);

        res.json({
            success: true,
            data: {
                registrations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat mengambil data pendaftaran',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router; 