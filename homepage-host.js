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
    if (!username) return 'Host01';
    
    // Convert to title case (first letter uppercase, rest lowercase)
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
}

// Username display
function displayHostUsername() {
    const userInfo = getUserData();
    let username = 'Host01';
    
    if (userInfo) {
        username = userInfo.userName || userInfo.userData.username || userInfo.userData.firstName || 'Host01';
    } else {
        // Fallback to legacy localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                username = user.username || user.firstName || 'Host01';
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
    
    document.getElementById('host-username').textContent = formatUsername(username);
}

// Logout function
function handleLogout() {
    clearUserData();
    window.location.href = 'login.html';
}

// Tournament data storage
let tournaments = JSON.parse(localStorage.getItem('hostTournaments')) || [
    {
        id: 1,
        name: "Mobile Legends Pro League",
        game: "Mobile Legends: Bang Bang",
        category: "esport",
        startDate: "2025-06-10",
        endDate: "2025-06-25",
        maxParticipants: 16,
        currentParticipants: 12,
        prizePool: 800000000,
        location: "Online",
        description: "Professional league for Mobile Legends players.",
        status: "Live Now"
    },
    {
        id: 2,
        name: "Liga Futsal Nusantara",
        game: "Futsal",
        category: "sport",
        startDate: "2025-06-05",
        endDate: "2025-07-20",
        maxParticipants: 32,
        currentParticipants: 28,
        prizePool: 200000000,
        location: "Surabaya, Indonesia",
        description: "National futsal championship.",
        status: "Registration Open"
    },
    {
        id: 3,
        name: "Valorant Champions Tour",
        game: "Valorant",
        category: "esport",
        startDate: "2025-07-05",
        endDate: "2025-07-20",
        maxParticipants: 32,
        currentParticipants: 8,
        prizePool: 1200000000,
        location: "International",
        description: "International Valorant championship.",
        status: "Registration Open"
    }
];

let editingTournamentId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Generate unique session ID for this tab if not exists
    if (!sessionStorage.getItem('sessionId')) {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    
    // Check if user is logged in and is a host
    const userInfo = getUserData();
    
    if (!userInfo || !userInfo.token) {
        alert('Silakan login terlebih dahulu.');
        window.location.href = 'login.html';
        return;
    }
    
    if (userInfo.accountType !== 'host') {
        alert('Halaman ini hanya untuk host. Silakan login sebagai host.');
        window.location.href = 'login.html';
        return;
    }
    
    displayHostUsername();
    renderTournaments();
    // updateStats();
});

// Render tournaments
async function renderTournaments() {
    const grid = document.getElementById('tournamentGrid');
    grid.innerHTML = '';
    const userInfo = getUserData();

    if (!userInfo || !userInfo.token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/tournaments/host/my-tournaments', {
            headers: { 'Authorization': `Bearer ${userInfo.token}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                window.location.href = 'login.html';
                return;
            } else if (response.status === 403) {
                alert('Akses ditolak. Pastikan Anda login sebagai host.');
                window.location.href = 'login.html';
                return;
            } else {
                throw new Error(data.message || 'Gagal mengambil data turnamen');
            }
        }
        
        // Ambil array turnamen dari lokasi yang benar
        const tournaments = data.data.tournaments || [];
        tournaments.forEach(tournament => {
            const card = createTournamentCard(tournament);
            grid.appendChild(card);
        });
        updateStatsFromList(tournaments);
    } catch (error) {
        console.error('Error loading tournaments:', error);
        grid.innerHTML = '<p style="color:red">Gagal memuat turnamen: ' + error.message + '</p>';
    }
}

function updateStatsFromList(tournaments) {
    const totalTournaments = tournaments.length;
    const totalParticipants = tournaments.reduce((sum, t) => sum + (t.currentParticipants || 0), 0);
    const activeTournaments = tournaments.filter(t => t.status === 'open' || t.status === 'ongoing' || t.status === 'Live Now').length;
    const totalPrizePool = tournaments.reduce((sum, t) => {
        if (t.prizePool && typeof t.prizePool === 'object') {
            return sum + (t.prizePool.first || 0) + (t.prizePool.second || 0) + (t.prizePool.third || 0);
        }
        return sum;
    }, 0);

    document.getElementById('totalTournaments').textContent = totalTournaments;
    document.getElementById('totalParticipants').textContent = formatNumber(totalParticipants);
    document.getElementById('activeTournaments').textContent = activeTournaments;
    document.getElementById('totalPrizePool').textContent = formatNumber(totalPrizePool);
}

// Create tournament card
function createTournamentCard(tournament) {
    const card = document.createElement('div');
    card.className = 'tournament-card';
    
    const statusColor = (tournament.status === 'Live Now' || tournament.status === 'open' || tournament.status === 'ongoing') ? '#4CAF50' : 
                       (tournament.status === 'Registration Open' ? '#FF9800' : '#F44336');
    
    card.innerHTML = `
        <div class="card-header">
            <span class="tournament-badge ${tournament.category ? tournament.category.toLowerCase() : ''}">${(tournament.category || '').toUpperCase()}</span>
            <div class="tournament-status">
                <div class="status-dot" style="background: ${statusColor}"></div>
                <span>${tournament.status || ''}</span>
            </div>
        </div>
        <h3 class="tournament-title">${tournament.title || tournament.name || ''}</h3>
        <p class="tournament-game">${tournament.game || ''}</p>
        <div class="tournament-info">
            <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>${tournament.schedule ? formatDate(tournament.schedule.startDate) : ''} - ${tournament.schedule ? formatDate(tournament.schedule.endDate) : ''}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-users"></i>
                <span>${tournament.currentParticipants || 0}/${tournament.maxParticipants || 0} Participants</span>
            </div>
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${tournament.location && tournament.location.address ? tournament.location.address : (tournament.location || '')}</span>
            </div>
        </div>
        <div class="tournament-prize">
            <div class="prize-label">Total Prize Pool</div>
            <div class="prize-amount">Rp ${tournament.prizePool && typeof tournament.prizePool === 'object' ? formatNumber((tournament.prizePool.first || 0) + (tournament.prizePool.second || 0) + (tournament.prizePool.third || 0)) : '0'}</div>
        </div>
        <div class="card-actions">
            <button class="action-btn btn-view" onclick="viewTournament('${tournament._id || tournament.id}')">
                <i class="fas fa-eye"></i>
                View
            </button>
            <button class="action-btn btn-edit" onclick="editTournament('${tournament._id || tournament.id}')">
                <i class="fas fa-edit"></i>
                Edit
            </button>
            <button class="action-btn btn-delete" onclick="deleteTournament('${tournament._id || tournament.id}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `;
    
    return card;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Format number
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

// Update statistics
function updateStats() {
    const totalTournaments = tournaments.length;
    const totalParticipants = tournaments.reduce((sum, t) => sum + t.currentParticipants, 0);
    const activeTournaments = tournaments.filter(t => t.status === 'Live Now').length;
    const totalPrizePool = tournaments.reduce((sum, t) => sum + t.prizePool, 0);

    document.getElementById('totalTournaments').textContent = totalTournaments;
    document.getElementById('totalParticipants').textContent = formatNumber(totalParticipants);
    document.getElementById('activeTournaments').textContent = activeTournaments;
    document.getElementById('totalPrizePool').textContent = formatNumber(totalPrizePool);
}

// Modal functions
function openCreateModal() {
    editingTournamentId = null;
    document.getElementById('modalTitle').textContent = 'Create New Tournament';
    document.getElementById('tournamentForm').reset();
    document.getElementById('tournamentModal').style.display = 'block';
}

function editTournament(id) {
    // Redirect to edit tournament page with ID
    window.location.href = `edit-tournament.html?id=${id}`;
}

function closeModal() {
    document.getElementById('tournamentModal').style.display = 'none';
    editingTournamentId = null;
}

async function deleteTournament(id) {
    if (confirm('Apakah Anda yakin ingin menghapus turnamen ini?')) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
            window.location.href = 'login.html';
            return;
        }
        try {
            const response = await fetch(`/api/tournaments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Turnamen berhasil dihapus.');
                renderTournaments(); // Muat ulang daftar turnamen
            } else {
                const result = await response.json();
                alert('Gagal menghapus turnamen: ' + (result.message || 'Error tidak diketahui'));
            }
        } catch (error) {
            alert('Gagal menghapus turnamen: ' + error.message);
        }
    }
}

function viewTournament(id) {
    // Implement view functionality
    alert('View tournament details - ID: ' + id);
}

function refreshTournaments() {
    renderTournaments();
    updateStats();
}



// Form submission
document.getElementById('tournamentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const locationValue = document.getElementById('location').value;
    const prizeValue = parseInt(document.getElementById('prizePool').value) || 0;

    const formData = {
        title: document.getElementById('tournamentName').value,
        description: document.getElementById('description').value,
        game: document.getElementById('tournamentGame').value,
        type: document.getElementById('tournamentType').value,
        category: document.getElementById('tournamentCategory').value,
        schedule: {
            registrationDeadline: document.getElementById('registrationDeadline').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value
        },
        maxParticipants: parseInt(document.getElementById('maxParticipants').value),
        prizePool: {
            first: prizeValue,
            second: 0,
            third: 0
        },
        location: {
            type: locationValue.toLowerCase().includes('online') ? 'online' : 'offline',
            address: locationValue,
            city: ''
        },
        status: 'open'
    };

    const isEditing = editingTournamentId !== null;
    const url = isEditing ? `/api/tournaments/${editingTournamentId}` : '/api/tournaments';
    const method = isEditing ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            alert(`Tournament berhasil ${isEditing ? 'diperbarui' : 'disimpan'}!`);
            closeModal();
            renderTournaments();
        } else {
            const result = await response.json();
            alert(`Gagal ${isEditing ? 'memperbarui' : 'menyimpan'} tournament: ` + (result.message || 'Unknown error'));
        }
    } catch (error) {
        alert(`Gagal ${isEditing ? 'memperbarui' : 'menyimpan'} tournament: ` + error.message);
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tournamentModal');
    if (event.target === modal) {
        closeModal();
    }
} 