// Enhanced login form handling with account type selection and conditional redirect

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');

    // Account type selection handling
    const accountTypeOptions = document.querySelectorAll('input[name="accountType"]');
    accountTypeOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Add visual feedback
            document.querySelectorAll('.account-type-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.nextElementSibling.classList.add('selected');
        });
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const emailUsername = document.getElementById('emailUsername').value;
        const password = document.getElementById('password').value;
        const accountType = loginForm.querySelector('input[name="accountType"]:checked');

        // Basic validation
        if (!accountType) {
            showMessage('Pilih tipe akun terlebih dahulu', 'error');
            return;
        }
        if (!emailUsername || !password) {
            showMessage('Mohon isi semua field yang diperlukan', 'error');
            return;
        }

        // Show loading state
        btnText.style.display = 'none';
        loading.style.display = 'flex';
        submitBtn.disabled = true;

        try {
            // Prepare data for API
            const loginData = {
                identifier: emailUsername, // Can be email or username
                password: password
            };

            // Send login request to backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                showMessage('Login berhasil!', 'success');

                // Generate unique session ID for this tab
                const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('sessionId', sessionId);

                // Store token and user data with session isolation
                const sessionPrefix = sessionId + '_';
                sessionStorage.setItem(sessionPrefix + 'token', result.data.token);
                sessionStorage.setItem(sessionPrefix + 'userData', JSON.stringify(result.data.user));
                sessionStorage.setItem(sessionPrefix + 'userName', result.data.user.username);
                sessionStorage.setItem(sessionPrefix + 'accountType', result.data.user.accountType);
                sessionStorage.setItem(sessionPrefix + 'loggedInUser', result.data.user.username);
                
                // Also store in localStorage for backward compatibility
                localStorage.setItem(sessionPrefix + 'token', result.data.token);
                localStorage.setItem(sessionPrefix + 'userData', JSON.stringify(result.data.user));
                localStorage.setItem(sessionPrefix + 'userName', result.data.user.username);
                localStorage.setItem(sessionPrefix + 'accountType', result.data.user.accountType);
                localStorage.setItem(sessionPrefix + 'loggedInUser', result.data.user.username);
                
                // Store also without prefix for compatibility with UI
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('userData', JSON.stringify(result.data.user));
                localStorage.setItem('userName', result.data.user.username);
                localStorage.setItem('accountType', result.data.user.accountType);
                localStorage.setItem('loggedInUser', result.data.user.username);

                // Debug logging
                console.log('Login successful:', {
                    token: result.data.token ? 'Present' : 'Missing',
                    userData: result.data.user,
                    accountType: result.data.user.accountType,
                    username: result.data.user.username
                });

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
                showMessage(result.message || 'Login gagal', 'error');
                console.error('Login failed:', result);
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage('Error koneksi. Coba lagi nanti.', 'error');
        } finally {
            // Reset loading state
            btnText.style.display = 'block';
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

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
        loginForm.insertBefore(messageEl, loginForm.firstChild);
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => messageEl.remove(), 300);
            }
        }, 4000);
    }

    // Add CSS animations for feedback
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
});

// Password visibility toggle (optional enhancement)
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
} 