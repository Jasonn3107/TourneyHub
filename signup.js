// Enhanced signup form handling with account type selection

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // Account type selection handling
    const accountTypeOptions = document.querySelectorAll('input[name="accountType"]');
    
    accountTypeOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Update illustration based on selected account type
            updateIllustrationContent(this.value);
            
            // Add visual feedback
            document.querySelectorAll('.account-type-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.nextElementSibling.classList.add('selected');
        });
    });
    
    // Form submission handling
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const accountType = formData.get('accountType');
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        
        // Validation
        if (!accountType) {
            showMessage('Pilih tipe akun terlebih dahulu', 'error');
            return;
        }
        
        if (password.length < 8) {
            showMessage('Password harus minimal 8 karakter', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Konfirmasi password tidak cocok', 'error');
            return;
        }
        
        if (!terms) {
            showMessage('Anda harus menyetujui Syarat & Ketentuan', 'error');
            return;
        }
        
        // Show loading state
        showLoadingState(true);
        
        try {
            // Prepare data for API
            const signupData = {
                firstName: formData.get('firstName'),
                username: formData.get('username'),
                email: formData.get('email'),
                password: password,
                accountType: accountType
            };
            
            // Send signup request to backend
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Success
                showMessage('Akun berhasil dibuat!', 'success');
                
                // Store token and user data
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('userData', JSON.stringify(result.data.user));
                localStorage.setItem('userName', result.data.user.username);
                
                // Redirect based on account type
                setTimeout(() => {
                    if (result.data.user.accountType === 'host') {
                        window.location.href = 'homepage-host.html';
                    } else {
                        window.location.href = 'homepage.html';
                    }
                }, 1500);
                
            } else {
                // Error from backend
                showMessage(result.message || 'Error saat membuat akun', 'error');
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('Error koneksi. Coba lagi nanti.', 'error');
        } finally {
            showLoadingState(false);
        }
    });
    
    // Real-time password confirmation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.style.borderColor = '#FF4C29';
            this.style.boxShadow = '0 0 0 3px rgba(255, 76, 41, 0.1)';
        } else if (confirmPassword && password === confirmPassword) {
            this.style.borderColor = '#00BFA6';
            this.style.boxShadow = '0 0 0 3px rgba(0, 191, 166, 0.1)';
        } else {
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            this.style.boxShadow = 'none';
        }
    });
    
    // Username availability checker (simulation)
    let usernameTimeout;
    document.getElementById('username').addEventListener('input', function() {
        clearTimeout(usernameTimeout);
        const username = this.value;
        
        if (username.length >= 3) {
            usernameTimeout = setTimeout(() => {
                checkUsernameAvailability(username, this);
            }, 800);
        }
    });
    
    // Email format validation
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.style.borderColor = '#FF4C29';
            showMessage('Format email tidak valid', 'error');
        } else if (email) {
            this.style.borderColor = '#00BFA6';
        }
    });
    
    function updateIllustrationContent(accountType) {
        const illustrationTitle = document.querySelector('.illustration-title');
        const illustrationText = document.querySelector('.illustration-text');
        const benefitsList = document.querySelector('.benefits-list');
        
        if (accountType === 'participant') {
            illustrationTitle.textContent = 'Bergabung sebagai Participant';
            illustrationText.textContent = 'Ikuti tournament seru dan raih prestasi terbaik Anda!';
            
            benefitsList.innerHTML = `
                <div class="benefit-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Ikuti semua tournament</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Akses ke profile pribadi</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Komunitas aktif 24/7</span>
                </div>
            `;
        } else if (accountType === 'host') {
            illustrationTitle.textContent = 'Bergabung sebagai Host';
            illustrationText.textContent = 'Buat dan kelola tournament dengan tools terlengkap!';
            
            benefitsList.innerHTML = `
                <div class="benefit-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Buat tournament yang diinginkan</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Management tools lengkap</span>
                </div>
                <div class="benefit-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Monetisasi tournament</span>
                </div>
            `;
        }
    }
    
    function showLoadingState(show) {
        if (show) {
            btnText.style.display = 'none';
            loading.style.display = 'flex';
            submitBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 15px;
            animation: slideDown 0.3s ease;
            ${type === 'success' 
                ? 'background: rgba(0, 191, 166, 0.1); color: #00BFA6; border: 1px solid rgba(0, 191, 166, 0.3);'
                : 'background: rgba(255, 76, 41, 0.1); color: #FF4C29; border: 1px solid rgba(255, 76, 41, 0.3);'
            }
        `;
        
        // Insert message
        signupForm.insertBefore(messageEl, signupForm.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => messageEl.remove(), 300);
            }
        }, 5000);
    }
    
    function checkUsernameAvailability(username, inputEl) {
        // Simulate API call to check username
        const unavailableUsernames = ['admin', 'test', 'user', 'tourneyhub', 'host', 'participant'];
        
        if (unavailableUsernames.includes(username.toLowerCase())) {
            inputEl.style.borderColor = '#FF4C29';
            showMessage(`Username "${username}" sudah digunakan`, 'error');
        } else {
            inputEl.style.borderColor = '#00BFA6';
        }
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    .account-type-card.selected {
        border-color: #00BFA6 !important;
        background: rgba(0, 191, 166, 0.15) !important;
        box-shadow: 0 8px 25px rgba(0, 191, 166, 0.3) !important;
    }
    
    .account-type-card.selected .account-type-icon {
        color: #00BFA6 !important;
        transform: scale(1.1) !important;
    }
`;
document.head.appendChild(style); 