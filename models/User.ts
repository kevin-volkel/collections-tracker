import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: {type: String, required: true, select: false},
    profilePicture: String,
    bio: String,
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],

    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
