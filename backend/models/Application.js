const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    scholarship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scholarship',
        required: true,
        index: true
    },

    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'interview', 'approved', 'rejected'],
        default: 'draft',
        index: true
    },

    // Submission Data
    submittedDocuments: [{
        documentType: String, // Matches requirement in Scholarship
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        }
    }],

    customAnswers: [{
        questionId: String,
        question: String,
        answer: String
    }],

    // Tracking
    timeline: [{
        status: String,
        date: { type: Date, default: Date.now },
        comment: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    reviewerNotes: {
        type: String,
        select: false // Only visible to admins/providers
    },

    score: {
        type: Number // For automated sorting/ranking
    }

}, {
    timestamps: true
});

// Compound index to ensure a student applies only once per scholarship (if that's the rule)
applicationSchema.index({ student: 1, scholarship: 1 }, { unique: true });
applicationSchema.index({ score: -1 }); // Index for sorting by highest score

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
