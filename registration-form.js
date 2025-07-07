// Registration Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Set hidden input tournamentId dari query string jika ada
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tournament')) {
        const hiddenInput = document.getElementById('tournamentId');
        if (hiddenInput) hiddenInput.value = urlParams.get('tournament');
    }

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Initialize form functionality
    loadTournamentData(); // Load tournament data first
    initializePhoneNumberFormatting();
    initializeFormSubmission();
    initializeFormValidation();
    initializeEmailValidation();
    initializeAutoCapitalize();
    initializeFormAnimations();
    initializeBackButton(); // Add back button functionality
});

// Load tournament data and display it
async function loadTournamentData() {
    try {
        // Get tournament ID from URL or hidden input
        const urlParams = new URLSearchParams(window.location.search);
        let tournamentId = '';
        
        if (urlParams.has('tournament')) {
            tournamentId = urlParams.get('tournament');
        } else {
            const hiddenInput = document.getElementById('tournamentId');
            if (hiddenInput) tournamentId = hiddenInput.value;
        }

        if (!tournamentId) {
            showErrorMessage('ID turnamen tidak ditemukan.');
            return;
        }

        // Fetch tournament data from API
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        if (!response.ok) {
            throw new Error('Gagal mengambil data turnamen');
        }

        const result = await response.json();
        const tournament = result.data.tournament;

        // Update tournament info in the header
        const tournamentTitle = document.getElementById('tournamentTitle');
        const tournamentSubtitle = document.getElementById('tournamentSubtitle');
        const deadlineText = document.getElementById('deadlineText');

        if (tournamentTitle) {
            tournamentTitle.textContent = tournament.title || 'Tournament';
        }

        if (tournamentSubtitle) {
            const game = tournament.game || '';
            const type = tournament.type || '';
            const category = tournament.category || '';
            tournamentSubtitle.textContent = `${game} • ${type.toUpperCase()} • ${category}`;
        }

        if (deadlineText) {
            // Check for registrationDeadline in schedule object
            const registrationDeadline = tournament.schedule?.registrationDeadline || tournament.registrationDeadline;
            
            if (registrationDeadline) {
                const deadline = new Date(registrationDeadline);
                const now = new Date();
                const timeLeft = deadline - now;
                
                if (timeLeft > 0) {
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    
                    if (days > 0) {
                        deadlineText.textContent = `Deadline: ${days} hari ${hours} jam lagi`;
                    } else {
                        deadlineText.textContent = `Deadline: ${hours} jam lagi`;
                    }
                } else {
                    deadlineText.textContent = 'Pendaftaran telah ditutup';
                    // Disable form if registration is closed
                    const form = document.getElementById('registrationForm');
                    const submitBtn = document.getElementById('submitBtn');
                    if (form && submitBtn) {
                        form.style.opacity = '0.5';
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Pendaftaran Ditutup';
                    }
                }
            } else {
                deadlineText.textContent = 'Deadline tidak tersedia';
            }
        }

    } catch (error) {
        console.error('Error loading tournament data:', error);
        showErrorMessage('Gagal memuat data turnamen. Silakan coba lagi.');
    }
}

// Phone number formatting
function initializePhoneNumberFormatting() {
    const whatsappInput = document.getElementById('whatsappNumber');
    whatsappInput.addEventListener('input', function(e) {
        // Hanya izinkan angka dan strip, tanpa auto-replace 0 ke 62
        let value = e.target.value.replace(/[^\d-]/g, '');
        e.target.value = value;
    });
}

// Form submission handling
function initializeFormSubmission() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Cek apakah user sudah login
        const token = localStorage.getItem('token');
        if (!token) {
            showErrorMessage('Anda harus login terlebih dahulu untuk mendaftar.');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            }, 2000);
            return;
        }

        // Cek apakah user adalah participant
        try {
            const userResponse = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!userResponse.ok) {
                showErrorMessage('Sesi login Anda telah berakhir. Silakan login ulang.');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                }, 2000);
                return;
            }
            
            const userData = await userResponse.json();
            if (userData.data.user.accountType !== 'participant') {
                showErrorMessage('Hanya akun participant yang dapat mendaftar turnamen.');
                return;
            }
        } catch (error) {
            showErrorMessage('Gagal memverifikasi akun. Silakan login ulang.');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            }, 2000);
            return;
        }
        
        // Show loading state
        submitBtn.innerHTML = '<span class="registration-loading"></span>Mendaftarkan...';
        submitBtn.disabled = true;

        // Ambil ID turnamen dari query string atau hidden input
        let tournamentId = '';
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('tournament')) {
            tournamentId = urlParams.get('tournament');
        } else {
            const hiddenInput = document.getElementById('tournamentId');
            if (hiddenInput) tournamentId = hiddenInput.value;
        }
        if (!tournamentId) {
            showErrorMessage('ID turnamen tidak ditemukan.');
            submitBtn.innerHTML = 'Daftar Sekarang';
            submitBtn.disabled = false;
            return;
        }

        // Ambil data form sesuai struktur frontend
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Kirim data ke backend
        try {
            const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok) {
                // Show success message
                successMessage.classList.add('show');
                successMessage.textContent = 'Pendaftaran berhasil!';
                // Reset form
                form.reset();
                // Hide after 10s
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 10000);
            } else {
                showErrorMessage(result.message || 'Pendaftaran gagal.');
            }
        } catch (error) {
            showErrorMessage('Gagal menghubungi server.');
        } finally {
            submitBtn.innerHTML = 'Daftar Sekarang';
            submitBtn.disabled = false;
        }
    });
}

// Form validation enhancements
function initializeFormValidation() {
    const form = document.getElementById('registrationForm');
    const requiredInputs = form.querySelectorAll('input[required], select[required]');
    
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#FF4C29';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#00BFA6';
        });
    });
}

// Email validation
function initializeEmailValidation() {
    const emailInput = document.getElementById('teamEmail');
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.style.borderColor = '#FF4C29';
        } else if (this.value) {
            this.style.borderColor = '#00BFA6';
        }
    });
}

// Auto-capitalize team name and member names
function initializeAutoCapitalize() {
    const form = document.getElementById('registrationForm');
    const nameInputs = form.querySelectorAll('input[name^="teamName"], input[name^="member"], input[name^="substitute"]');
    
    nameInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\b\w/g, l => l.toUpperCase());
        });
    });
}

// Form animation on load
function initializeFormAnimations() {
    const formSections = document.querySelectorAll('.registration-form-section');
    formSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
}

// Additional utility functions
function validateForm() {
    const form = document.getElementById('registrationForm');
    let isValid = true;

    // Validasi member1 wajib diisi
    const member1 = form.querySelector('input[name="member1"]');
    if (!member1.value.trim()) {
        member1.style.borderColor = '#FF4C29';
        isValid = false;
    } else {
        member1.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    }

    // Validasi input lain yang required (teamName, teamEmail, whatsappNumber, infoSource, terms)
    const requiredInputs = [
        form.querySelector('input[name="teamName"]'),
        form.querySelector('input[name="teamEmail"]'),
        form.querySelector('input[name="whatsappNumber"]'),
        form.querySelector('select[name="infoSource"]')
    ];
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#FF4C29';
            isValid = false;
        } else {
            input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
    });

    // Check email format
    const emailInput = form.querySelector('input[name="teamEmail"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value && !emailRegex.test(emailInput.value)) {
        emailInput.style.borderColor = '#FF4C29';
        isValid = false;
    }

    // Check terms checkbox
    const termsCheckbox = form.querySelector('#terms');
    if (!termsCheckbox.checked) {
        termsCheckbox.style.borderColor = '#FF4C29';
        isValid = false;
    }

    return isValid;
}

// Show error message
function showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'registration-error-message';
    errorDiv.style.cssText = `
        background: linear-gradient(135deg, #FF4C29, #E63E1F);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        font-weight: 500;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

    // Insert before form
    const form = document.getElementById('registrationForm');
    form.parentNode.insertBefore(errorDiv, form);

    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Clear form validation styles
function clearValidationStyles() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
}

// Back button functionality
function initializeBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if there's a previous page in history
            if (document.referrer && document.referrer !== window.location.href) {
                window.history.back();
            } else {
                // If no previous page, go to homepage
                window.location.href = 'homepage.html';
            }
        });
    }
} 