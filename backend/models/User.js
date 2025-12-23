const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'provider', 'admin'],
        default: 'student'
    },

    // Profile Information
    phoneNumber: String,
    dateOfBirth: Date,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },

    // Specific to Students
    academicProfile: {
        currentInstitution: String,
        studentId: String,
        course: String,
        yearOfStudy: Number,
        gpa: Number,
        achievements: [String]
    },

    // Specific to Providers
    organizationDetails: {
        name: String,
        website: String,
        description: String,
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        }
    },

    // Financial Info (for matching)
    financialProfile: {
        annualIncome: Number,
        currency: { type: String, default: 'USD' }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
// userSchema.index({ email: 1 }); // unique: true already creates an index
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
