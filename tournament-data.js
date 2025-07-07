// Shared tournament data for all pages
const tournamentData = {
    sport: [
        {
            id: 1,
            title: "Liga Futsal Nusantara",
            sport: "Futsal",
            sportType: "futsal",
            status: "live",
            statusText: "Live Now",
            date: "5 Juni - 20 Juli 2025",
            participants: "32 Tim",
            location: "Surabaya, Indonesia",
            prize: "Rp 200.000.000",
            icon: "fas fa-futbol"
        },
        {
            id: 2,
            title: "Badminton Open Championship",
            sport: "Badminton",
            sportType: "badminton",
            status: "open",
            statusText: "Registration Open",
            date: "10 Juli - 20 Juli 2025",
            participants: "128 Peserta",
            category: "Singles & Doubles",
            prize: "Rp 150.000.000",
            icon: "fas fa-table-tennis"
        },
        {
            id: 3,
            title: "Basketball League Indonesia",
            sport: "Basketball",
            sportType: "basketball",
            status: "soon",
            statusText: "Coming Soon",
            date: "1 September - 15 Oktober 2025",
            participants: "24 Tim",
            location: "Jakarta, Indonesia",
            prize: "Rp 400.000.000",
            icon: "fas fa-basketball-ball"
        },
        {
            id: 4,
            title: "Volleyball Championship",
            sport: "Volleyball",
            sportType: "volleyball",
            status: "open",
            statusText: "Registration Open",
            date: "20 Agustus - 5 September 2025",
            participants: "16 Tim",
            category: "Men's & Women's",
            prize: "Rp 180.000.000",
            icon: "fas fa-volleyball-ball"
        },
        {
            id: 5,
            title: "Piala Nusantara Cup",
            sport: "Sepak Bola",
            sportType: "football",
            status: "open",
            statusText: "Registration Open",
            date: "25 Juni - 15 Juli 2025",
            participants: "64 Tim",
            location: "Jakarta, Indonesia",
            prize: "Rp 1.000.000.000",
            icon: "fas fa-futbol"
        },
        {
            id: 6,
            title: "Indonesia Tennis Open",
            sport: "Tennis",
            sportType: "tennis",
            status: "soon",
            statusText: "Coming Soon",
            date: "15 September - 25 September 2025",
            participants: "96 Peserta",
            category: "Professional Level",
            prize: "Rp 300.000.000",
            icon: "fas fa-table-tennis"
        },
        {
            id: 7,
            title: "Futsal Championship Series",
            sport: "Futsal",
            sportType: "futsal",
            status: "live",
            statusText: "Live Now",
            date: "1 Juli - 31 Juli 2025",
            participants: "48 Tim",
            location: "Bandung, Indonesia",
            prize: "Rp 250.000.000",
            icon: "fas fa-futbol"
        },
        {
            id: 8,
            title: "National Basketball Cup",
            sport: "Basketball",
            sportType: "basketball",
            status: "open",
            statusText: "Registration Open",
            date: "10 Agustus - 20 Agustus 2025",
            participants: "32 Tim",
            location: "Medan, Indonesia",
            prize: "Rp 350.000.000",
            icon: "fas fa-basketball-ball"
        }
    ],
    esport: [
        {
            id: 101,
            title: "Mobile Legends Professional League",
            game: "Mobile Legends",
            gameType: "mobile-legends",
            status: "live",
            statusText: "Live Now",
            date: "1 Juni - 30 Juni 2025",
            participants: "16 Tim",
            platform: "Mobile",
            prize: "Rp 500.000.000",
            icon: "fas fa-mobile-alt"
        },
        {
            id: 102,
            title: "PUBG Mobile Championship",
            game: "PUBG Mobile",
            gameType: "pubg-mobile",
            status: "open",
            statusText: "Registration Open",
            date: "15 Juli - 30 Juli 2025",
            participants: "100 Tim",
            platform: "Mobile",
            prize: "Rp 300.000.000",
            icon: "fas fa-mobile-alt"
        },
        {
            id: 103,
            title: "Free Fire Master League",
            game: "Free Fire",
            gameType: "free-fire",
            status: "soon",
            statusText: "Coming Soon",
            date: "1 Agustus - 15 Agustus 2025",
            participants: "50 Tim",
            platform: "Mobile",
            prize: "Rp 250.000.000",
            icon: "fas fa-mobile-alt"
        },
        {
            id: 104,
            title: "Valorant Indonesia Open",
            game: "Valorant",
            gameType: "valorant",
            status: "open",
            statusText: "Registration Open",
            date: "20 Juli - 5 Agustus 2025",
            participants: "32 Tim",
            platform: "PC",
            prize: "Rp 400.000.000",
            icon: "fas fa-desktop"
        },
        {
            id: 105,
            title: "CS:GO Indonesia Championship",
            game: "CS:GO",
            gameType: "csgo",
            status: "open",
            statusText: "Registration Open",
            date: "10 Agustus - 25 Agustus 2025",
            participants: "24 Tim",
            platform: "PC",
            prize: "Rp 600.000.000",
            icon: "fas fa-desktop"
        },
        {
            id: 106,
            title: "Dota 2 Southeast Asia Cup",
            game: "Dota 2",
            gameType: "dota2",
            status: "soon",
            statusText: "Coming Soon",
            date: "1 September - 15 September 2025",
            participants: "16 Tim",
            platform: "PC",
            prize: "Rp 800.000.000",
            icon: "fas fa-desktop"
        },
        {
            id: 107,
            title: "League of Legends Indonesia",
            game: "League of Legends",
            gameType: "lol",
            status: "live",
            statusText: "Live Now",
            date: "5 Juli - 20 Juli 2025",
            participants: "12 Tim",
            platform: "PC",
            prize: "Rp 350.000.000",
            icon: "fas fa-desktop"
        },
        {
            id: 108,
            title: "FIFA Indonesia Championship",
            game: "FIFA",
            gameType: "fifa",
            status: "open",
            statusText: "Registration Open",
            date: "25 Agustus - 10 September 2025",
            participants: "64 Peserta",
            platform: "Console",
            prize: "Rp 150.000.000",
            icon: "fas fa-gamepad"
        },
        {
            id: 109,
            title: "Mobile Legends University Cup",
            game: "Mobile Legends",
            gameType: "mobile-legends",
            status: "open",
            statusText: "Registration Open",
            date: "15 September - 30 September 2025",
            participants: "32 Tim",
            platform: "Mobile",
            prize: "Rp 100.000.000",
            icon: "fas fa-mobile-alt"
        },
        {
            id: 110,
            title: "PUBG Mobile Pro League",
            game: "PUBG Mobile",
            gameType: "pubg-mobile",
            status: "soon",
            statusText: "Coming Soon",
            date: "1 Oktober - 15 Oktober 2025",
            participants: "80 Tim",
            platform: "Mobile",
            prize: "Rp 450.000.000",
            icon: "fas fa-mobile-alt"
        }
    ],
    featured: [
        {
            id: 201,
            title: "Indonesia Gaming Championship 2025",
            type: "esport",
            game: "Multi-Game Tournament",
            status: "live",
            statusText: "Live Now",
            date: "15 Juni - 20 Juni 2025",
            participants: "1,250 Peserta",
            category: "Grand Final",
            prize: "Rp 500.000.000",
            icon: "fas fa-gamepad"
        },
        {
            id: 202,
            title: "Piala Nusantara Cup",
            type: "sport",
            sport: "Sepak Bola",
            status: "open",
            statusText: "Registration Open",
            date: "25 Juni - 15 Juli 2025",
            participants: "64 Tim",
            location: "Jakarta, Indonesia",
            prize: "Rp 1.000.000.000",
            icon: "fas fa-futbol"
        },
        {
            id: 203,
            title: "Ultimate Gaming Showdown",
            type: "esport",
            game: "Battle Royale Championship",
            status: "soon",
            statusText: "Coming Soon",
            date: "1 Agustus - 10 Agustus 2025",
            participants: "500 Players",
            category: "Online Tournament",
            prize: "Rp 750.000.000",
            icon: "fas fa-globe"
        },
        {
            id: 204,
            title: "Cyber Arena Masters",
            type: "esport",
            game: "Multiple E-Sports",
            status: "open",
            statusText: "Registration Open",
            date: "20 Juli - 30 Juli 2025",
            participants: "800 Peserta",
            category: "Professional League",
            prize: "Rp 300.000.000",
            icon: "fas fa-trophy"
        }
    ]
};

// Helper function to render tournament cards
function renderTournamentCard(tournament, type = 'default') {
    // Determine badge type based on tournament type first, then fall back to existing logic
    let badgeClass, badgeText;
    
    if (type === 'featured' && tournament.type) {
        // For featured tournaments, use the actual type from backend
        if (tournament.type === 'sport') {
            badgeClass = 'sport';
            badgeText = 'Sport';
        } else if (tournament.type === 'esport') {
            badgeClass = 'esport';
            badgeText = 'E-Sport';
        } else {
            badgeClass = 'featured';
            badgeText = 'Featured';
        }
    } else {
        // Original logic for other types
        const isSport = type === 'sport' || tournament.sport;
        const isEsport = type === 'esport' || tournament.game;
        badgeClass = isSport ? 'sport' : isEsport ? 'esport' : 'featured';
        badgeText = isSport ? 'Sport' : isEsport ? 'E-Sport' : 'Featured';
    }
    
    // Gunakan event-card untuk homepage, featured, atau default
    const cardClass = (type === 'homepage' || type === 'featured' || type === 'default' || !type) ? 'event-card' : 'tournament-card';
    
    const title = tournament.title;
    const subtitle = tournament.sport || tournament.game;
    const statusClass = `status-${tournament.status}`;
    
    let infoItems = `
        <div class="info-item">
            <i class="fas fa-calendar"></i>
            <span>${tournament.date}</span>
        </div>
        <div class="info-item">
            <i class="fas fa-users"></i>
            <span>${tournament.participants}</span>
        </div>
    `;
    
    if (tournament.location) {
        infoItems += `
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${tournament.location}</span>
            </div>
        `;
    }
    
    if (tournament.category) {
        infoItems += `
            <div class="info-item">
                <i class="fas fa-trophy"></i>
                <span>${tournament.category}</span>
            </div>
        `;
    }
    
    if (tournament.platform) {
        infoItems += `
            <div class="info-item">
                <i class="fas fa-globe"></i>
                <span>${tournament.platform}</span>
            </div>
        `;
    }
    
    // Untuk sport dan esport page, gunakan struktur khusus
    if (type === 'sport') {
        return `
            <div class="${cardClass}" onclick="viewTournamentDetail('${tournament.id}', '${type}')" style="cursor: pointer;">
                <div class="card-header">
                    <span class="sport-badge">Sport</span>
                    <div class="tournament-status status-${tournament.status}">
                        <div class="status-dot"></div>
                        <span>${tournament.statusText}</span>
                    </div>
                </div>
                <h3 class="tournament-title">${title}</h3>
                <div class="tournament-sport">
                    <i class="${tournament.icon}"></i>
                    ${subtitle}
                </div>
                <div class="tournament-info">
                    ${infoItems}
                </div>
                <div class="tournament-prize">
                    <div class="prize-label">Total Prize Pool</div>
                    <div class="prize-amount">${tournament.prize}</div>
                </div>
            </div>
        `;
    } else if (type === 'esport') {
        return `
            <div class="${cardClass}" onclick="viewTournamentDetail('${tournament.id}', '${type}')" style="cursor: pointer;">
                <div class="card-header">
                    <span class="esport-badge">E-Sport</span>
                    <div class="tournament-status status-${tournament.status}">
                        <div class="status-dot"></div>
                        <span>${tournament.statusText}</span>
                    </div>
                </div>
                <h3 class="tournament-title">${title}</h3>
                <div class="tournament-game">
                    <i class="${tournament.icon}"></i>
                    ${subtitle}
                </div>
                <div class="tournament-info">
                    ${infoItems}
                </div>
                <div class="tournament-prize">
                    <div class="prize-label">Total Prize Pool</div>
                    <div class="prize-amount">${tournament.prize}</div>
                </div>
            </div>
        `;
    } else {
        // Homepage format (event-card)
        return `
            <div class="${cardClass}" onclick="viewTournamentDetail('${tournament.id}', '${type}')" style="cursor: pointer;">
                <div class="card-header">
                    <span class="event-badge ${badgeClass}">${badgeText}</span>
                    <div class="event-status">
                        <div class="status-dot"></div>
                        <span>${tournament.statusText}</span>
                    </div>
                </div>
                <h3 class="event-title">${title}</h3>
                <p class="event-game">${subtitle}</p>
                <div class="event-info">
                    ${infoItems}
                </div>
                <div class="event-prize">
                    <div class="prize-label">Total Prize Pool</div>
                    <div class="prize-amount">${tournament.prize}</div>
                </div>
            </div>
        `;
    }
}

// Function to view tournament detail
function viewTournamentDetail(tournamentId, type) {
    window.location.href = `tournament-detail 2.html?id=${tournamentId}`;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { tournamentData, renderTournamentCard, viewTournamentDetail };
} 