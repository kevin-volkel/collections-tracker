import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { 
        type: String, 
        unique: true, 
        required: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/, 'Please enter a valid email address']
    },
    username: { type: String, unique: true, required: true },
    password: {
        type: String,
        required: true,
        select: false,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/,
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number or symbol'
        ]
    },
    profilePicture: String,
    bio: String,
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
