/* =========================================
   ADMIN DASHBOARD LOGIC (COMPLETE)
   ========================================= */

const token = localStorage.getItem('token');
const linksContainer = document.querySelector('.links-manager');
const saveLinkBtn = document.getElementById('save-link-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');

// Variable to store the image string (Base64)
let currentProfileImage = ''; 

/* ----------------------------------
   1. INIT: CHECK AUTH & LOAD DATA
   ---------------------------------- */
if (!token) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();

    // Initialize Image Upload Listener
    const avatarInput = document.getElementById('avatar-upload');
    if(avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validation: Check size (Max 200KB)
            if (file.size > 200 * 1024) {
                showToast('Image is too large! Please use an image under 200KB.', 'error');
                return;
            }

            // Convert to Base64
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                
                // Show Preview immediately
                document.getElementById('admin-avatar-preview').src = base64String;
                
                // Store in variable to send to server later
                currentProfileImage = base64String;
            };
            reader.readAsDataURL(file);
        });
    }
});

/* ----------------------------------
   2. LOAD USER DATA & POPULATE UI
   ---------------------------------- */
async function loadUserData() {
    try {
        const res = await fetch(`${CONFIG.API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (data.success) {
            const user = data.data; 
            
            // A. Update "View Live" Button Link
            const liveBtn = document.getElementById('view-live-btn');
            if(liveBtn) {
                liveBtn.href = `profile.html?user=${user.username}`;
            }

            // B. Populate "Appearance" Tab
            const avatarImg = document.getElementById('admin-avatar-preview');
            const usernameInput = document.getElementById('settings-username');
            const bioInput = document.getElementById('settings-bio');

            if(avatarImg) {
                avatarImg.src = user.profileImage;
                currentProfileImage = user.profileImage; // Sync variable with DB data
            }
            if(usernameInput) usernameInput.value = user.username;
            if(bioInput) bioInput.value = user.bio || '';

            // C. Render Links
            renderLinks(user.links);
        } else {
            // Token expired
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error('Error loading data:', err);
    }
}

/* ----------------------------------
   3. RENDER LINKS LIST
   ---------------------------------- */
function renderLinks(links) {
    linksContainer.innerHTML = ''; // Clear list

    if (!links || links.length === 0) {
        linksContainer.innerHTML = `
            <div class="text-center" style="padding: 2rem; opacity: 0.6;">
                <p>No links yet. Click "Add New Link" above!</p>
            </div>`;
        return;
    }

    links.forEach((link) => {
        const html = `
            <div class="link-item-card" style="margin-bottom: 10px;">
                <div class="link-info">
                    <h4>${link.title}</h4>
                    <span class="link-url">${link.url}</span>
                </div>
                <div class="link-controls">
                    <button class="btn-icon-sm text-error" onclick="deleteLink('${link._id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        linksContainer.insertAdjacentHTML('beforeend', html);
    });
}

/* ----------------------------------
   4. ADD NEW LINK
   ---------------------------------- */
if(saveLinkBtn) {
    saveLinkBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const titleInput = document.getElementById('link-title');
        const urlInput = document.getElementById('link-url');
        
        const title = titleInput.value;
        const url = urlInput.value;

        if(!title || !url) {
            showToast('Please fill in both fields', 'error');
            return;
        }

        saveLinkBtn.innerHTML = 'Saving...';
        saveLinkBtn.disabled = true;

        try {
            const res = await fetch(`${CONFIG.API_URL}/users/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, url })
            });

            const data = await res.json();

            if (data.success) {
                renderLinks(data.links); 
                // Reset Form
                titleInput.value = '';
                urlInput.value = '';
                document.getElementById('add-link-form').classList.add('hidden');
            } else {
                showToast(data.message, 'error');
            }
        } catch (err) {
            showToast('Error saving link', 'error');
        } finally {
            saveLinkBtn.innerHTML = 'Save Link';
            saveLinkBtn.disabled = false;
        }
    });
}

/* ----------------------------------
   5. DELETE LINK
   ---------------------------------- */
window.deleteLink = async (id) => {
    if(!confirm('Delete this link?')) return;

    try {
        const res = await fetch(`${CONFIG.API_URL}/users/links/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        
        if (data.success) {
            renderLinks(data.links);
        }
    } catch (err) {
        showToast('Error deleting link', 'error');
    }
};

/* ----------------------------------
   6. UPDATE PROFILE (Bio + Image)
   ---------------------------------- */
if(saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        const bio = document.getElementById('settings-bio').value;
        
        saveProfileBtn.innerHTML = 'Saving...';
        saveProfileBtn.disabled = true;

        // Prepare data payload (Bio + Image String)
        const payload = { 
            bio: bio,
            profileImage: currentProfileImage 
        };

        try {
            const res = await fetch(`${CONFIG.API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            if(data.success) {
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast(data.message, 'error'); // Will show error if image > 5mb
            }
        } catch(err) {
            console.error(err);
            showToast('Error updating profile', 'error');
        } finally {
            saveProfileBtn.innerHTML = 'Save Changes';
            saveProfileBtn.disabled = false;
        }
    });
}