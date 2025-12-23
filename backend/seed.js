const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Scholarship = require('./models/Scholarship');
const Application = require('./models/Application');
const Document = require('./models/Document');

dotenv.config();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Scholarship = require('./models/Scholarship');
const Application = require('./models/Application');
const Document = require('./models/Document');

dotenv.config();

const users = [
    {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        phoneNumber: "1234567890",
        address: { city: "New York" }
    },
    {
        name: "Scholarship Provider Inc.",
        email: "provider@example.com",
        password: "password123",
        role: "provider",
        organizationDetails: {
            name: "Global Education Foundation",
            website: "https://globaledu.org",
            description: "Supporting students worldwide.",
            verificationStatus: 'verified'
        },
        address: { city: "San Francisco" }
    },
    {
        name: "John Doe",
        email: "student@example.com",
        password: "password123",
        role: "student",
        academicProfile: {
            currentInstitution: "MIT",
            course: "Computer Science",
            gpa: 3.8,
            yearOfStudy: 2
        },
        financialProfile: {
            annualIncome: 45000,
            currency: 'USD'
        },
        address: { city: "Boston" }
    },
    {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "student",
        academicProfile: {
            currentInstitution: "Harvard",
            course: "Law",
            gpa: 3.9,
            yearOfStudy: 3
        },
        financialProfile: {
            annualIncome: 120000,
            currency: 'USD'
        },
        address: { city: "Cambridge" }
    },
    {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "password123",
        role: "student",
        academicProfile: {
            currentInstitution: "Stanford",
            course: "Biology",
            gpa: 3.6,
            yearOfStudy: 1
        },
        financialProfile: {
            annualIncome: 60000,
            currency: 'USD'
        },
        address: { city: "Palo Alto" }
    }
];

const scholarships = [
    {
        title: "Future Tech Leaders Scholarship",
        description: "A scholarship for aspiring computer scientists and engineers who demonstrate innovation.",
        amount: 5000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        eligibility: {
            minGPA: 3.5,
            allowedCourses: ["Computer Science", "Engineering"],
            maxIncome: 80000
        },
        isActive: true,
        tags: ["technology", "stem"]
    },
    {
        title: "Global Merit Award",
        description: "Awarded to students with exceptional academic performance in any field.",
        amount: 10000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        eligibility: {
            minGPA: 3.8
        },
        isActive: true,
        tags: ["merit", "high-value"]
    },
    {
        title: "Community Support Grant",
        description: "Need-based grant for students facing financial hardship.",
        amount: 3000,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        eligibility: {
            maxIncome: 50000,
            location: "National"
        },
        isActive: true,
        tags: ["need-based", "grant"]
    },
    {
        title: "Women in Science Fellowship",
        description: "Supporting women pursuing careers in scientific research.",
        amount: 7500,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        eligibility: {
            minGPA: 3.2,
            gender: "Female",
            allowedCourses: ["Biology", "Chemistry", "Physics"]
        },
        isActive: true,
        tags: ["science", "women-in-stem"]
    },
    {
        title: "Arts & Humanities Scholarship",
        description: "For students demonstrating excellence in arts and humanities.",
        amount: 4000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        eligibility: {
            minGPA: 3.0
        },
        isActive: true,
        tags: ["arts", "humanities"]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        console.log('Clearing database...');
        await Application.deleteMany({});
        await Scholarship.deleteMany({});
        await User.deleteMany({});
        // await Document.deleteMany({});

        console.log('Creating Users...');
        const createdUsers = await User.create(users);
        const providerUser = createdUsers.find(u => u.role === 'provider');
        const students = createdUsers.filter(u => u.role === 'student');

        console.log('Creating Scholarships...');
        const scholarshipData = scholarships.map(s => ({
            ...s,
            provider: providerUser._id
        }));
        const createdScholarships = await Scholarship.create(scholarshipData);

        console.log('Creating Applications...');
        const applications = [];
        // Generate random applications
        // Distribution: 
        // Student 1 (High Merit, Low Income) -> Applies to Tech, Merit, Community
        // Student 2 (High Merit, High Income) -> Applies to Merit, Arts
        // Student 3 (Avg Merit, Med Income) -> Applies to Tech, Arts

        const combinations = [
            { student: students[0], scholarship: createdScholarships[0], score: 92, status: 'submitted' }, // John -> Tech
            { student: students[0], scholarship: createdScholarships[1], score: 88, status: 'under_review' }, // John -> Merit
            { student: students[0], scholarship: createdScholarships[2], score: 95, status: 'approved' }, // John -> Community

            { student: students[1], scholarship: createdScholarships[1], score: 90, status: 'submitted' }, // Jane -> Merit
            { student: students[1], scholarship: createdScholarships[4], score: 75, status: 'rejected' }, // Jane -> Arts

            { student: students[2], scholarship: createdScholarships[0], score: 60, status: 'rejected' }, // Alice -> Tech
            { student: students[2], scholarship: createdScholarships[3], score: 85, status: 'interview' }, // Alice -> Science
            { student: students[2], scholarship: createdScholarships[4], score: 78, status: 'submitted' }  // Alice -> Arts
        ];

        // Add dummy applications to reach 10+
        // Let's just duplicate some for different terms or previous cycles if needed, 
        // or just add more logic. 
        // Let's add variations of dates to test timeline sorting.

        for (const combo of combinations) {
            applications.push({
                student: combo.student._id,
                scholarship: combo.scholarship._id,
                status: combo.status,
                score: combo.score,
                timeline: [{
                    status: 'received',
                    comment: 'Application received',
                    date: new Date(Date.now() - 10000000), // earlier
                    updatedBy: combo.student._id
                }, {
                    status: combo.status,
                    comment: `Status updated to ${combo.status}`,
                    date: new Date(),
                    updatedBy: providerUser._id
                }]
            });
        }

        // Add a few more draft/pending ones
        applications.push({
            student: students[0]._id,
            scholarship: createdScholarships[3]._id,
            status: 'draft',
            score: 0,
            timeline: [{ status: 'draft', date: new Date(), updatedBy: students[0]._id }]
        });

        applications.push({
            student: students[1]._id,
            scholarship: createdScholarships[0]._id,
            status: 'received',
            score: 80,
            timeline: [{ status: 'received', date: new Date(), updatedBy: students[1]._id }]
        });

        await Application.create(applications);

        console.log(`Database Populated: ${createdUsers.length} Users, ${createdScholarships.length} Scholarships, ${applications.length} Applications`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
