// My Tournaments functionality
let myTournaments = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('My Tournaments page loaded');
    
    // Initialize user profile
    initializeUserProfile();
    
    // Load user's tournaments
    loadMyTournaments();
    
    // Setup filter functionality
    setupFilters();
});

// Initialize user profile
function initializeUserProfile() {
    try {
        const userInfo = getUserData();
        
        if (userInfo) {
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                const username = userInfo.userName || userInfo.userData.username || userInfo.userData.firstName || 'User01';
                userNameElement.textContent = formatUsername(username);
            }
        } else {
            // Fallback to legacy localStorage
            const userData = localStorage.getItem('userData');
            const userName = localStorage.getItem('userName');
            
            if (userData) {
                const user = JSON.parse(userData);
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    const username = user.username || user.firstName || 'User01';
                    userNameElement.textContent = formatUsername(username);
                }
            }
        }
    } catch (error) {
        console.error('Error initializing user profile:', error);
    }
}

// Load user's tournaments
async function loadMyTournaments() {
    const container = document.getElementById('tournamentsContainer');
    
    try {
        // Show loading state
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Memuat turnamen...</h3>
                <p>Mengambil data turnamen Anda</p>
            </div>
        `;
        
        // Ambil token jika ada
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User data not found');
        }
        
        // Fetch user's tournaments from backend (registrations)
        const response = await fetch('/api/tournaments/my-registrations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user tournaments');
        }
        
        const data = await response.json();
        // registrations: array of {tournament, ...}
        myTournaments = (data.data.registrations || [])
            .map(reg => {
                // Gabungkan info registration dan tournament
                const t = reg.tournament;
                if (!t) return null;
                return {
                    id: t._id,
                    title: t.title,
                    game: t.game,
                    sport: t.sport,
                    type: t.type,
                    status: t.status,
                    statusText: t.status === 'live' || t.status === 'ongoing' ? 'Sedang Berlangsung' :
                        t.status === 'open' ? 'Akan Datang' :
                        t.status === 'completed' ? 'Selesai' :
                        t.status,
                    date: t.schedule ? `${new Date(t.schedule.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.schedule.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
                    participants: (t.currentParticipants || 0) + ' Peserta',
                    location: t.location && t.location.address ? t.location.address : '',
                    platform: t.location && t.location.type ? t.location.type.charAt(0).toUpperCase() + t.location.type.slice(1) : '',
                    prize: t.prizePool ? 'Rp ' + (t.prizePool.first || 0).toLocaleString('id-ID') : '',
                    isRegistered: true,
                    result: reg.finalRank ? `Peringkat ${reg.finalRank}` : undefined
                };
            })
            .filter(Boolean);
        
        renderTournaments();
        
    } catch (error) {
        console.error('Error loading tournaments:', error);
        
        // Show fallback data or empty state
        if (error.message.includes('User data not found')) {
            showEmptyState('Silakan login terlebih dahulu untuk melihat turnamen Anda');
        } else {
            // Load fallback data for demo purposes
            loadFallbackData();
        }
    }
}

// Load fallback data for demo
function loadFallbackData() {
    myTournaments = [
        {
            id: 1,
            title: "Mobile Legends Professional League 2025",
            game: "Mobile Legends",
            type: "esport",
            status: "ongoing",
            statusText: "Sedang Berlangsung",
            date: "1 Juni - 30 Juni 2025",
            participants: "16 Tim",
            platform: "Mobile",
            prize: "Rp 500.000.000",
            registrationDate: "2025-05-15",
            isRegistered: true
        },
        {
            id: 2,
            title: "Liga Futsal Nusantara",
            sport: "Futsal",
            type: "sport",
            status: "upcoming",
            statusText: "Akan Datang",
            date: "5 Juni - 20 Juli 2025",
            participants: "32 Tim",
            location: "Surabaya, Indonesia",
            prize: "Rp 200.000.000",
            registrationDate: "2025-05-20",
            isRegistered: true
        },
        {
            id: 3,
            title: "PUBG Mobile Tournament",
            game: "PUBG Mobile",
            type: "esport",
            status: "completed",
            statusText: "Selesai",
            date: "1 Mei - 15 Mei 2025",
            participants: "64 Tim",
            platform: "Mobile",
            prize: "Rp 300.000.000",
            registrationDate: "2025-04-10",
            isRegistered: true,
            result: "Runner-up"
        },
        {
            id: 4,
            title: "Basketball Championship",
            sport: "Basketball",
            type: "sport",
            status: "registered",
            statusText: "Terdaftar",
            date: "10 Juli - 25 Juli 2025",
            participants: "24 Tim",
            location: "Jakarta, Indonesia",
            prize: "Rp 150.000.000",
            registrationDate: "2025-06-01",
            isRegistered: true
        }
    ];
    
    renderTournaments();
}

// Render tournaments based on current filter
function renderTournaments() {
    const container = document.getElementById('tournamentsContainer');
    
    if (myTournaments.length === 0) {
        showEmptyState('Anda belum mengikuti turnamen apapun');
        return;
    }
    
    // Filter tournaments based on current filter
    let filteredTournaments = myTournaments;
    
    if (currentFilter !== 'all') {
        filteredTournaments = myTournaments.filter(tournament => {
            switch (currentFilter) {
                case 'ongoing':
                    return tournament.status === 'ongoing' || tournament.status === 'live';
                case 'completed':
                    return tournament.status === 'completed';
                case 'registered':
                    return tournament.isRegistered && (tournament.status === 'upcoming' || tournament.status === 'open');
                default:
                    return true;
            }
        });
    }
    
    if (filteredTournaments.length === 0) {
        showEmptyState(`Tidak ada turnamen dengan status "${getFilterDisplayName(currentFilter)}"`);
        return;
    }
    
    // Render tournament cards
    const tournamentsHTML = filteredTournaments.map(tournament => 
        renderTournamentCard(tournament)
    ).join('');
    
    container.innerHTML = `
        <div class="tournaments-grid">
            ${tournamentsHTML}
        </div>
    `;
}

// Render individual tournament card
function renderTournamentCard(tournament) {
    const statusClass = getStatusClass(tournament.status);
    const icon = tournament.type === 'esport' ? 'fas fa-gamepad' : 'fas fa-futbol';
    const gameOrSport = tournament.game || tournament.sport;
    
    // Mapping statusText ke bahasa Inggris seperti homepage
    let statusText = '';
    switch (tournament.status) {
        case 'live':
        case 'ongoing':
            statusText = 'Live Now'; break;
        case 'open':
        case 'upcoming':
            statusText = 'Registration Open'; break;
        case 'completed':
            statusText = 'Completed'; break;
        case 'registration_closed':
            statusText = 'Registration Closed'; break;
        case 'cancelled':
            statusText = 'Cancelled'; break;
        case 'soon':
            statusText = 'Coming Soon'; break;
        default:
            statusText = tournament.statusText || '';
    }

    return `
        <div class="event-card" onclick="viewTournamentDetail('${tournament.id}')">
            <div class="tournament-status ${statusClass}">
                <span class="status-dot"></span>
                ${statusText}
            </div>
            <div class="card-header">
                <span class="event-badge ${tournament.type}">${tournament.type === 'esport' ? 'E-Sport' : 'Sport'}</span>
            </div>
            <h3 class="event-title">${tournament.title}</h3>
            <p class="event-game">${gameOrSport}</p>
            <div class="event-info">
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${tournament.date}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${tournament.participants}</span>
                </div>
                ${tournament.location ? `
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${tournament.location}</span>
                    </div>
                ` : ''}
                ${tournament.platform ? `
                    <div class="info-item">
                        <i class="fas fa-mobile-alt"></i>
                        <span>${tournament.platform}</span>
                    </div>
                ` : ''}
                ${tournament.result ? `
                    <div class="info-item">
                        <i class="fas fa-trophy"></i>
                        <span>${tournament.result}</span>
                    </div>
                ` : ''}
            </div>
            <div class="event-prize">
                <div class="prize-label">Total Prize Pool</div>
                <div class="prize-amount">${tournament.prize}</div>
            </div>
        </div>
    `;
}

// Get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'ongoing':
        case 'live':
            return 'status-ongoing';
        case 'completed':
            return 'status-completed';
        case 'upcoming':
        case 'open':
            return 'status-upcoming';
        case 'registered':
            return 'status-registered';
        default:
            return 'status-upcoming';
    }
}

// Get filter display name
function getFilterDisplayName(filter) {
    switch (filter) {
        case 'ongoing': return 'Ongoing';
        case 'completed': return 'Completed';
        case 'registered': return 'Registered';
        default: return 'All';
    }
}

// Show empty state
function showEmptyState(message) {
    const container = document.getElementById('tournamentsContainer');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-trophy"></i>
            <h3>Belum Ada Turnamen</h3>
            <p>${message}</p>
            <a href="homepage.html" class="browse-btn">
                <i class="fas fa-search"></i>
                Jelajahi Turnamen
            </a>
        </div>
    `;
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            
            // Re-render tournaments
            renderTournaments();
        });
    });
}

// View tournament detail
function viewTournamentDetail(tournamentId) {
    // Navigate to tournament detail page
    window.location.href = `tournament-detail 2.html?id=${tournamentId}`;
}

// Logout functionality
function handleLogout() {
    // Clear user data
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Helper functions (copied from homepage.js)
function getUserData() {
    try {
        // Try to get from sessionStorage first
        const sessionData = sessionStorage.getItem('userData');
        if (sessionData) {
            return JSON.parse(sessionData);
        }
        
        // Fallback to localStorage
        const localData = localStorage.getItem('userData');
        if (localData) {
            return { userData: JSON.parse(localData) };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

function clearUserData() {
    try {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('userData');
        localStorage.removeItem('userName');
    } catch (error) {
        console.error('Error clearing user data:', error);
    }
}

function formatUsername(username) {
    if (!username) return 'User01';
    
    // Remove special characters and limit length
    const cleanName = username.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    if (cleanName.length <= 10) {
        return cleanName;
    }
    
    // Truncate and add ellipsis
    return cleanName.substring(0, 8) + '...';
} 