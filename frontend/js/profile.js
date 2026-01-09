/* =========================================
   PUBLIC PROFILE LOGIC (FINAL FIX)
   ========================================= */

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('user');

document.addEventListener('DOMContentLoaded', () => {
    if(username) {
        loadPublicProfile(username);
    } else {
        document.body.innerHTML = '<h3 style="color:white;text-align:center;margin-top:50px;">No user specified in URL</h3>';
    }
});

async function loadPublicProfile(user) {
    const loader = document.getElementById('loader');
    if(loader) loader.classList.remove('hidden');
    
    try {
        const res = await fetch(`${CONFIG.API_URL}/users/${user}`);
        const data = await res.json();

        if (data.success) {
            renderProfile(data.user);
        } else {
            render404();
        }

    } catch (error) {
        console.error(error);
        render404();
    } finally {
        if(loader) loader.classList.add('hidden');
    }
}

function renderProfile(user) {
    // 1. Set Title & Texts
    document.title = `${user.username} | MyLink`;
    document.getElementById('profile-name').textContent = `@${user.username}`;
    
    if (user.bio) {
        document.getElementById('profile-bio').innerHTML = user.bio.replace(/\n/g, '<br>');
    }

    // 2. SMART IMAGE LOGIC
    const imgEl = document.getElementById('profile-image');
    
    // Check if the image is a custom upload (starts with 'data:image')
    if (user.profileImage && user.profileImage.startsWith('data:image')) {
        imgEl.src = user.profileImage;
    } else {
        // Otherwise, generate the Initials (TE)
        imgEl.src = `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&size=128&bold=true&font-size=0.5`;
    }

    // 3. Render Links
    const container = document.getElementById('links-container');
    container.innerHTML = ''; 

    if(user.links.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top: 2rem;">No links yet.</p>';
        return;
    }

    // Sort: Pinned first
    const sortedLinks = user.links.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

    sortedLinks.forEach(link => {
        const isPinnedClass = link.isPinned ? 'pinned' : '';
        const iconClass = link.icon || 'fa-solid fa-link';
        
        const html = `
            <a href="${link.url}" class="link-card ${isPinnedClass}" target="_blank">
                <div class="link-icon"><i class="${iconClass}"></i></div>
                <span class="link-text">${link.title}</span>
                ${link.isPinned ? '<div class="link-action"><i class="fa-solid fa-star" style="font-size:0.8rem"></i></div>' : ''}
            </a>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function render404() {
    document.body.innerHTML = `
        <div style="text-align:center; padding:50px; color:white;">
            <h1>404</h1>
            <p>User not found</p>
            <a href="index.html" style="color:var(--color-primary); margin-top:20px; display:inline-block;">Go Home</a>
        </div>`;
}