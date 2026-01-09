const User = require('../models/User');

/* =========================================
   UPDATE PROFILE (Bio, Image, Theme)
   PUT /api/users/profile
   ========================================= */
exports.updateProfile = async (req, res) => {
    try {
        const { bio, username, profileImage } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.bio = bio || user.bio;
            user.profileImage = profileImage || user.profileImage;
            // If updating username, we'd need to check uniqueness again, 
            // skipping that for complexity in V1
            
            const updatedUser = await user.save();

            res.json({
                success: true,
                user: {
                    username: updatedUser.username,
                    email: updatedUser.email,
                    bio: updatedUser.bio,
                    profileImage: updatedUser.profileImage,
                    links: updatedUser.links
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* =========================================
   ADD NEW LINK
   POST /api/users/links
   ========================================= */
exports.addLink = async (req, res) => {
    try {
        const { title, url, icon } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            const newLink = {
                title,
                url,
                icon: icon || 'fa-solid fa-link',
                isPinned: false
            };

            user.links.push(newLink);
            await user.save();

            res.status(201).json({ success: true, links: user.links });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* =========================================
   DELETE LINK
   DELETE /api/users/links/:id
   ========================================= */
exports.deleteLink = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // Filter out the link that matches the ID
            user.links = user.links.filter(
                (link) => link._id.toString() !== req.params.id
            );

            await user.save();
            res.json({ success: true, links: user.links });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* =========================================
   GET PUBLIC PROFILE (For visitors)
   GET /api/users/:username
   ========================================= */
exports.getPublicProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
                               .select('-password -email'); // Security: Hide email/pass

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};