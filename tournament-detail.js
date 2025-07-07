// Tournament Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initializeSmoothScrolling();
    initializeHoverEffects();
    initializeTimelineInteraction();
    initializeContactCopy();
    initializeAnimations();
    initializeMobileMenu();
    setUserNameFromStorage();
});

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add hover effects to cards and elements
function initializeHoverEffects() {
    // Card hover effects
    document.querySelectorAll('.sidebar-card, .tournament-info, .stat-item').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 10px 30px rgba(24, 18, 18, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Organizer info hover effect
    const organizerInfo = document.querySelector('.organizer-info');
    if (organizerInfo) {
        organizerInfo.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0, 191, 166, 0.1)';
            this.style.transform = 'scale(1.02)';
        });
        
        organizerInfo.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.05)';
            this.style.transform = 'scale(1)';
        });
    }
}

// Interactive timeline functionality
function initializeTimelineInteraction() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            timelineItems.forEach(timelineItem => {
                timelineItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Add visual feedback
            this.style.transform = 'translateX(5px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'translateX(5px)';
            }, 200);
        });
    });
}

// Click to copy functionality for contact information
function initializeContactCopy() {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            
            // Copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                // Show success feedback
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check" style="color: #4CAF50;"></i> Copied!';
                this.style.color = '#4CAF50';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.color = '#B8B8CC';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show feedback
                const originalHTML = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check" style="color: #4CAF50;"></i> Copied!';
                this.style.color = '#4CAF50';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.color = '#B8B8CC';
                }, 2000);
            });
        });
    });
}

// Initialize animations
function initializeAnimations() {
    // Animate stat items on load
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });

    // Animate tournament badges
    const badges = document.querySelectorAll('.badge');
    badges.forEach((badge, index) => {
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            badge.style.transition = 'all 0.5s ease';
            badge.style.opacity = '1';
            badge.style.transform = 'scale(1)';
        }, 500 + (index * 150));
    });

    // Animate tournament header
    const tournamentHeader = document.querySelector('.tournament-header');
    if (tournamentHeader) {
        tournamentHeader.style.opacity = '0';
        tournamentHeader.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            tournamentHeader.style.transition = 'all 0.8s ease';
            tournamentHeader.style.opacity = '1';
            tournamentHeader.style.transform = 'translateY(0)';
        }, 100);
    }

    // Animate info sections
    const infoSections = document.querySelectorAll('.info-section');
    infoSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateX(0)';
        }, 800 + (index * 200));
    });

    // Animate sidebar cards
    const sidebarCards = document.querySelectorAll('.sidebar-card');
    sidebarCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        }, 1000 + (index * 200));
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.header');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 10px;
        transition: all 0.3s ease;
    `;

    // Add mobile menu functionality
    function setupMobileMenu() {
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-menu-btn')) {
                header.insertBefore(mobileMenuBtn, navLinks);
                mobileMenuBtn.style.display = 'block';
            }
            
            navLinks.style.display = 'none';
            
            mobileMenuBtn.addEventListener('click', function() {
                const isVisible = navLinks.style.display === 'flex';
                navLinks.style.display = isVisible ? 'none' : 'flex';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = '#1E1E2F';
                navLinks.style.flexDirection = 'column';
                navLinks.style.padding = '20px';
                navLinks.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
                navLinks.style.zIndex = '1000';
                
                // Animate menu button
                this.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(90deg)';
            });
        } else {
            if (document.querySelector('.mobile-menu-btn')) {
                document.querySelector('.mobile-menu-btn').remove();
            }
            navLinks.style.display = 'flex';
            navLinks.style.position = 'static';
            navLinks.style.background = 'none';
            navLinks.style.flexDirection = 'row';
            navLinks.style.padding = '0';
            navLinks.style.borderTop = 'none';
        }
    }

    // Initial setup
    setupMobileMenu();

    // Handle window resize
    window.addEventListener('resize', setupMobileMenu);
}

// Add scroll reveal animation
function initializeScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll reveal
    document.querySelectorAll('.tournament-info, .sidebar-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Add loading animation for registration button
function initializeRegistrationButton() {
    const registerBtn = document.querySelector('.register-btn');
    if (registerBtn) {
        // If it's already an anchor tag with href, don't override it
        if (registerBtn.tagName === 'A' && registerBtn.href) {
            return;
        }
        
        // Only add click handler if it's a button without href
        registerBtn.addEventListener('click', function() {
            // Redirect to registration form page
            window.location.href = 'registration-form.html';
        });
    }
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollReveal();
    initializeRegistrationButton();
    
    // Add keyboard navigation for timeline
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

// Set user-name from localStorage
function setUserNameFromStorage() {
    try {
        const userData = localStorage.getItem('userData');
        const userName = localStorage.getItem('userName');
        const userNameElement = document.querySelector('.user-name');
        if (userData) {
            const user = JSON.parse(userData);
            if (userNameElement) {
                userNameElement.textContent = user.username || user.firstName || 'User01';
            }
        } else if (userName) {
            if (userNameElement) {
                userNameElement.textContent = userName;
            }
        } else {
            if (userNameElement) {
                userNameElement.textContent = 'User01';
            }
        }
    } catch (error) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = 'User01';
        }
    }
} 