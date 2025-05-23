import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        minlength: 3, 
        maxlength: 50 
    },
    description: { 
        type: String, 
        required: true, 
        minlength: 3, 
        maxlength: 256 
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Collection || mongoose.model('Collection', collectionSchema);