// Auth Module - Professional Session Management
const Auth = {
    // Note: In a production server, this would be a hash or a secure cookie.
    // For this local-first standalone system, we use a simple credential check.
    credentials: {
        user: 'admin',
        pass: 'admin123'
    },

    init() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }
        this.checkSession();
    },

    login() {
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        const form = document.getElementById('login-form');

        if (u === this.credentials.user && p === this.credentials.pass) {
            // Success
            localStorage.setItem('academy_auth_session', 'active');
            this.handleSuccess();
        } else {
            // Failure with premium feedback
            form.classList.add('login-error');
            window.showToast("Invalid Credentials. Access Denied.", "error");
            
            setTimeout(() => {
                form.classList.remove('login-error');
            }, 500);
        }
    },

    checkSession() {
        if (localStorage.getItem('academy_auth_session') === 'active') {
             this.handleSuccess(true);
        }
    },

    handleSuccess(isAuto = false) {
        document.documentElement.classList.add('is-authenticated');
        if(!isAuto) {
            window.showToast("Welcome Back, Admin!", "success");
        }
        // Securely initialize the app state
        if(window.initApp) window.initApp();
    },

    logout() {
        window.confirmCustom(
            'Sign Out?', 
            'Are you sure you want to end your current session?', 
            () => {
                localStorage.removeItem('academy_auth_session');
                document.documentElement.classList.remove('is-authenticated');
                // Force a reload to clean the memory state entirely
                window.location.reload();
            }
        );
    }
};

// Start auth monitoring
Auth.init();

// Export to window for global access
window.Auth = Auth;
