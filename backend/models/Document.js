const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true // e.g., "Fall 2024 Transcript"
    },
    type: {
        type: String,
        required: true,
        enum: ['Transcript', 'ID Proof', 'Income Certificate', 'Recommendation Letter', 'Essay', 'Other']
    },
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String // for cloud storage (e.g., Cloudinary)
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationComments: String,

    fileSize: Number, // in bytes
    mimeType: String
}, {
    timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
