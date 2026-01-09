/* =========================================
   CONFIGURATION & ENVIRONMENT VARIABLES
   ========================================= */

/*const CONFIG = {
    // 1. Where is the Backend API running?
    // We check if the window location contains '127.0.0.1' or 'localhost'
    API_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'  // Local Development Backend
        : 'https://your-backend-service.onrender.com/api', // Production Backend (We will set this up later)

    // 2. Where is the Frontend running?
    FRONTEND_URL: window.location.origin,

    // 3. App Meta
    APP_NAME: 'MyLink',
    VERSION: '1.0.0'
};*/

const CONFIG = {
    // We are now using the Live Render URL
    // Make sure to keep the '/api' at the end!
    API_URL: 'https://mylink-api.onrender.com/api'
};

/* =========================================
   AUTO-UPDATE DOMAIN PREFIX
   ========================================= */
// This runs as soon as the file loads. 
// It finds the "mylink.app/" text in index.html and changes it to your REAL current URL.

document.addEventListener('DOMContentLoaded', () => {
    const prefixElement = document.getElementById('domain-prefix');

    if (prefixElement) {
        // Removes 'http://' or 'https://' to make it look clean
        const cleanHost = window.location.host;
        prefixElement.textContent = `${cleanHost}/`;
    }
});