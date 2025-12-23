const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A scholarship must have a title'],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'A scholarship must have a description']
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Scholarship must belong to a provider']
    },
    amount: {
        type: Number,
        required: [true, 'Please specify the scholarship amount']
    },
    deadline: {
        type: Date,
        required: [true, 'Please specify the application deadline'],
        index: true
    },

    // Eligibility Criteria
    eligibility: {
        minGPA: { type: Number, default: 0 },
        maxIncome: { type: Number },
        minAge: { type: Number },
        maxAge: { type: Number },
        allowedCourses: [String], // e.g., ["Computer Science", "Engineering"]
        gender: {
            type: String,
            enum: ['All', 'Male', 'Female', 'Other'],
            default: 'All'
        },
        location: { type: String } // e.g., "State-specific" or "National"
    },

    // Requirements
    requiredDocuments: [{
        type: String, // e.g., "Transcript", "Income Certificate", "ID Proof"
        required: true
    }],

    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    slotsAvailable: {
        type: Number
    },

    tags: [String], // For better searchability

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Text index for search
scholarshipSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Performance indexes for frequent filters
scholarshipSchema.index({ amount: 1 });
scholarshipSchema.index({ 'eligibility.minGPA': 1 });
scholarshipSchema.index({ 'eligibility.maxIncome': 1 });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

module.exports = Scholarship;
