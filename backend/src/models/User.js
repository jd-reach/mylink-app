const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* =========================================
   SUB-SCHEMA: LINKS
   We embed this inside the User schema for faster performance.
   ========================================= */
const LinkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a link title'],
        trim: true,
        maxlength: [30, 'Title cannot be more than 30 characters']
    },
    url: {
        type: String,
        required: [true, 'Please add a valid URL'],
        match: [
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    icon: {
        type: String, // FontAwesome class, e.g., "fa-brands fa-twitter"
        default: 'fa-solid fa-link'
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0 // For drag-and-drop sorting
    },
    clicks: {
        type: Number,
        default: 0 // Basic analytics
    }
});

/* =========================================
   MAIN SCHEMA: USER
   ========================================= */
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Don't return password by default when querying user
    },
    // Profile Customization Fields
    profileImage: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=6366f1&color=fff' // Default avatar
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot be more than 150 characters'],
        default: 'Welcome to my link in bio!'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Embed the links here
    links: [LinkSchema],
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/* =========================================
   MIDDLEWARE: ENCRYPT PASSWORD
   Runs automatically before saving to DB
   ========================================= */
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        next();
    }
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/* =========================================
   METHOD: CHECK PASSWORD
   Used during Login
   ========================================= */
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);