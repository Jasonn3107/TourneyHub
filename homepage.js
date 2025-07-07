// Slider functionality
let currentSlide = {
    featuredSlider: 0,
    esportSlider: 0,
    sportSlider: 0
};

function slideLeft(sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const cards = slider.querySelectorAll('.event-card');
    if (currentSlide[sliderId] > 0) {
        currentSlide[sliderId]--;
        slider.style.transform = `translateX(-${currentSlide[sliderId] * (cards[0].offsetWidth + 20)}px)`;
    }
}

function slideRight(sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const cards = slider.querySelectorAll('.event-card');
    const visibleCards = Math.floor(slider.parentElement.offsetWidth / (cards[0].offsetWidth + 20));
    if (currentSlide[sliderId] < cards.length - visibleCards) {
        currentSlide[sliderId]++;
        slider.style.transform = `translateX(-${currentSlide[sliderId] * (cards[0].offsetWidth + 20)}px)`;
    }
}

// Load tournament cards from backend
async function loadTournamentCards() {
    const featuredSlider = document.getElementById('featuredSlider');
    const esportSlider = document.getElementById('esportSlider');
    const sportSlider = document.getElementById('sportSlider');

    // Show loading state
    if (featuredSlider) featuredSlider.innerHTML = '<div class="event-card"><h3>Loading...</h3></div>';
    if (esportSlider) esportSlider.innerHTML = '<div class="event-card"><h3>Loading...</h3></div>';
    if (sportSlider) sportSlider.innerHTML = '<div class="event-card"><h3>Loading...</h3></div>';

    try {
        const response = await fetch('/api/tournaments?limit=100');
        if (!response.ok) throw new Error('Gagal mengambil data turnamen');
        const data = await response.json();
        const tournaments = data.data.tournaments || [];

        // Helper: format statusText
        function getStatusText(status) {
            switch (status) {
                case 'live': return 'Live Now';
                case 'open': return 'Registration Open';
                case 'soon': return 'Coming Soon';
                case 'ongoing': return 'Live Now';
                case 'completed': return 'Completed';
                case 'registration_closed': return 'Registration Closed';
                default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
            }
        }

        // Mapping for homepage
        const esport = tournaments.filter(t => t.type === 'esport').map(t => ({
            id: t._id,
            title: t.title,
            game: t.game,
            status: t.status === 'ongoing' ? 'live' : t.status,
            statusText: getStatusText(t.status),
            date: t.schedule ? `${new Date(t.schedule.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.schedule.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
            participants: (t.currentParticipants || 0) + ' Peserta',
            platform: t.location && t.location.type ? t.location.type.charAt(0).toUpperCase() + t.location.type.slice(1) : '',
            prize: t.prizePool ? 'Rp ' + (t.prizePool.first || 0).toLocaleString('id-ID') : '',
            icon: 'fas fa-gamepad',
        }));
        const sport = tournaments.filter(t => t.type === 'sport').map(t => ({
            id: t._id,
            title: t.title,
            sport: t.game,
            status: t.status === 'ongoing' ? 'live' : t.status,
            statusText: getStatusText(t.status),
            date: t.schedule ? `${new Date(t.schedule.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.schedule.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
            participants: (t.currentParticipants || 0) + ' Peserta',
            location: t.location && t.location.address ? t.location.address : '',
            prize: t.prizePool ? 'Rp ' + (t.prizePool.first || 0).toLocaleString('id-ID') : '',
            icon: 'fas fa-futbol',
        }));
        // Featured: ambil 4 turnamen dengan registrations/views terbanyak atau status live
        let featured = tournaments
            .filter(t => t.status === 'ongoing' || t.status === 'live' || t.status === 'open')
            .sort((a, b) => (b.statistics?.registrations || 0) - (a.statistics?.registrations || 0))
            .slice(0, 4)
            .map(t => ({
                id: t._id,
                title: t.title,
                game: t.game,
                sport: t.game,
                type: t.type,
                status: t.status === 'ongoing' ? 'live' : t.status,
                statusText: getStatusText(t.status),
                date: t.schedule ? `${new Date(t.schedule.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.schedule.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
                participants: (t.currentParticipants || 0) + ' Peserta',
                category: t.category,
                prize: t.prizePool ? 'Rp ' + (t.prizePool.first || 0).toLocaleString('id-ID') : '',
                icon: t.type === 'esport' ? 'fas fa-gamepad' : 'fas fa-futbol',
            }));
        if (featured.length < 4) {
            // Tambah dari turnamen lain jika kurang dari 4
            const extra = tournaments.filter(t => !featured.find(f => f.id === t._id)).slice(0, 4 - featured.length);
            featured = featured.concat(extra.map(t => ({
                id: t._id,
                title: t.title,
                game: t.game,
                sport: t.game,
                type: t.type,
                status: t.status === 'ongoing' ? 'live' : t.status,
                statusText: getStatusText(t.status),
                date: t.schedule ? `${new Date(t.schedule.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(t.schedule.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
                participants: (t.currentParticipants || 0) + ' Peserta',
                category: t.category,
                prize: t.prizePool ? 'Rp ' + (t.prizePool.first || 0).toLocaleString('id-ID') : '',
                icon: t.type === 'esport' ? 'fas fa-gamepad' : 'fas fa-futbol',
            })));
        }
        // Render
        if (featuredSlider) featuredSlider.innerHTML = featured.map(t => renderTournamentCard(t, 'featured')).join('');
        if (esportSlider) esportSlider.innerHTML = esport.slice(0, 4).map(t => renderTournamentCard(t, 'homepage')).join('');
        if (sportSlider) sportSlider.innerHTML = sport.slice(0, 4).map(t => renderTournamentCard(t, 'homepage')).join('');
    } catch (error) {
        // Fallback ke data lama jika gagal
        console.error('Gagal memuat turnamen dari backend:', error);
        if (typeof tournamentData !== 'undefined') {
            // Panggil loader lama
            window.loadTournamentCards = undefined; // Hindari infinite loop
            setTimeout(() => { loadTournamentCardsLegacy(); }, 100);
        }
    }
}

// Fallback loader lama
function loadTournamentCardsLegacy() {
    if (typeof tournamentData !== 'undefined') {
        // ... kode lama ...
        const featuredSlider = document.getElementById('featuredSlider');
        if (featuredSlider) {
            featuredSlider.innerHTML = tournamentData.featured.map(tournament => 
                renderTournamentCard(tournament, 'featured')
            ).join('');
        }
        const esportSlider = document.getElementById('esportSlider');
        if (esportSlider) {
            esportSlider.innerHTML = tournamentData.esport.slice(0, 4).map(tournament => 
                renderTournamentCard(tournament, 'homepage')
            ).join('');
        }
        const sportSlider = document.getElementById('sportSlider');
        if (sportSlider) {
            sportSlider.innerHTML = tournamentData.sport.slice(0, 4).map(tournament => 
                renderTournamentCard(tournament, 'homepage')
            ).join('');
        }
    }
}

// Logout functionality
function handleLogout() {
    // Simple logout - just clear data and redirect
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Initialize user profile
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Wait a bit for tournament-data.js to load
    setTimeout(() => {
        // Load tournament cards
        loadTournamentCards();
        
        // Display user information if available
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
                } else if (userName) {
                    const userNameElement = document.querySelector('.user-name');
                    if (userNameElement) {
                        userNameElement.textContent = formatUsername(userName);
                    }
                } else {
                    // Default fallback
                    const userNameElement = document.querySelector('.user-name');
                    if (userNameElement) {
                        userNameElement.textContent = 'User01';
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = 'User01';
            }
        }
    }, 100);
});

// Optional: Reset slider on window resize
window.addEventListener('resize', () => {
    Object.keys(currentSlide).forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        slider.style.transform = 'translateX(0)';
        currentSlide[sliderId] = 0;
    });
});

// Function to view tournament detail (imported from tournament-data.js, but ensure global)
if (typeof viewTournamentDetail === 'function') {
    window.viewTournamentDetail = viewTournamentDetail;
}

// Utility function to get user data with session isolation
function getUserData() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
        // Try sessionStorage first
        const sessionPrefix = sessionId + '_';
        const userData = sessionStorage.getItem(sessionPrefix + 'userData');
        const userName = sessionStorage.getItem(sessionPrefix + 'userName');
        const accountType = sessionStorage.getItem(sessionPrefix + 'accountType');
        const token = sessionStorage.getItem(sessionPrefix + 'token');
        
        if (userData && userName && accountType && token) {
            return {
                userData: JSON.parse(userData),
                userName: userName,
                accountType: accountType,
                token: token
            };
        }
    }
    
    // Fallback to localStorage (backward compatibility)
    const userData = localStorage.getItem('userData');
    const userName = localStorage.getItem('userName');
    const accountType = localStorage.getItem('accountType');
    const token = localStorage.getItem('token');
    
    if (userData && userName && accountType && token) {
        return {
            userData: JSON.parse(userData),
            userName: userName,
            accountType: accountType,
            token: token
        };
    }
    
    return null;
}

// Utility function to clear user data with session isolation
function clearUserData() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
        const sessionPrefix = sessionId + '_';
        sessionStorage.removeItem(sessionPrefix + 'token');
        sessionStorage.removeItem(sessionPrefix + 'userData');
        sessionStorage.removeItem(sessionPrefix + 'userName');
        sessionStorage.removeItem(sessionPrefix + 'accountType');
        sessionStorage.removeItem(sessionPrefix + 'loggedInUser');
        
        // Also clear from localStorage
        localStorage.removeItem(sessionPrefix + 'token');
        localStorage.removeItem(sessionPrefix + 'userData');
        localStorage.removeItem(sessionPrefix + 'userName');
        localStorage.removeItem(sessionPrefix + 'accountType');
        localStorage.removeItem(sessionPrefix + 'loggedInUser');
    }
    
    // Clear legacy localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('userName');
    localStorage.removeItem('accountType');
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    sessionStorage.clear();
}

// Function to format username with proper capitalization
function formatUsername(username) {
    if (!username) return 'User01';
    
    // Convert to title case (first letter uppercase, rest lowercase)
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
} 