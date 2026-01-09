/* =========================================
   AUTHENTICATION LOGIC
   Handles Login, Register, and Logout
   ========================================= */

// 1. Select Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');

// 2. Event Listener: LOGIN
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerHTML;

        try {
            // Show loading state
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...';
            btn.disabled = true;

            const res = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                // Save Token & User Info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data._id,
                    username: data.username,
                    email: data.email
                }));

                // Redirect to Dashboard
                window.location.href = 'admin.html';
            } else {
                showToast(data.message || 'Login failed', 'error');
            }

        } catch (error) {
            console.error(error);
            showToast('Something went wrong. Please check your connection.', 'error');
        } finally {
            // Reset button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// 3. Event Listener: REGISTER
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = registerForm.querySelector('button');
        const originalText = btn.innerHTML;

        try {
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';
            btn.disabled = true;

            const res = await fetch(`${CONFIG.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (data.success) {
                // Save Token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data._id,
                    username: data.username,
                    email: data.email
                }));

                // Redirect to Dashboard
                window.location.href = 'admin.html';
            } else {
                showToast(data.message || 'Registration failed', 'error');
            }

        } catch (error) {
            console.error(error);
            showToast('Something went wrong. Please check your connection.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// 4. LOGOUT UTILITY
// This checks if we are on a page that requires logout logic
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// 5. PROTECTION CHECK
// If user is on admin.html but has no token, kick them out
if (window.location.pathname.includes('admin.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}