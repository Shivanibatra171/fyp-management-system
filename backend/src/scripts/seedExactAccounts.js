const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { User, PreviousFYP, Proposal, Project } = require('../models');

const seedExactAccounts = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at 127.0.0.1:27017...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyp_management', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seed] Connected successfully.');

    // Delete existing records to allow User.create pre('save') to hash fresh
    await User.deleteMany({
      email: {
        $in: [
          'admin@university.edu',
          'dr.khursheed@university.edu',
          'student@university.edu',
        ],
      },
    });

    // 1. Admin Account (Pass plain text so pre('save') hashes it once)
    const adminUser = await User.create({
      name: 'FYP Office Coordinator',
      email: 'admin@university.edu',
      password: 'Password@123',
      role: 'admin',
      department: 'Computer System Engineering',
      phone: '+92-300-1110000',
      isActive: true,
    });
    console.log('[Seed] Created admin: admin@university.edu');

    // 2. Supervisor Account (Dr. Khursheed)
    const supervisorUser = await User.create({
      name: 'Dr. Khursheed',
      email: 'dr.khursheed@university.edu',
      password: 'Password@123',
      role: 'supervisor',
      department: 'Computer System Engineering',
      designation: 'Associate Professor',
      employeeId: 'EMP-012',
      phone: '+92-300-1110012',
      isActive: true,
    });
    console.log('[Seed] Created supervisor: dr.khursheed@university.edu');

    // 3. Student Account (Ali Ahmed)
    const studentUser = await User.create({
      name: 'Ali Ahmed',
      email: 'student@university.edu',
      password: 'Password@123',
      role: 'student',
      department: 'Computer System Engineering',
      studentId: 'CSE-2023-01',
      phone: '+92-300-1234567',
      assignedSupervisor: supervisorUser._id,
      isActive: true,
    });
    console.log('[Seed] Created student: student@university.edu');

    // Seed proposal
    await Proposal.deleteMany({ submittedBy: studentUser._id });
    const proposal = await Proposal.create({
      title: 'Smart FYP Portal with AI Semantic Similarity Engine',
      abstract: 'An automated web management system designed for university FYP coordinators, faculty supervisors, and students. Integrates sentence-transformers (all-MiniLM-L6-v2) to flag duplicate proposals with over 70% semantic similarity.',
      domain: 'Software Engineering & AI',
      technologies: ['React', 'Tailwind CSS', 'Node.js', 'FastAPI', 'PyTorch'],
      submittedBy: studentUser._id,
      supervisor: supervisorUser._id,
      status: 'approved',
      similarityScore: 72,
      similarityWarning: true,
    });

    // Seed project
    await Project.deleteMany({ students: studentUser._id });
    await Project.create({
      proposal: proposal._id,
      title: proposal.title,
      abstract: proposal.abstract,
      domain: proposal.domain,
      technologies: proposal.technologies,
      students: [studentUser._id],
      supervisor: supervisorUser._id,
      status: 'in-progress',
      currentMilestone: 'srs',
    });

    console.log('\n======================================================');
    console.log('   3 EXACT ACCOUNTS READY FOR LOGIN');
    console.log('======================================================');
    console.log('1. Admin:      admin@university.edu        | Password@123');
    console.log('2. Supervisor: dr.khursheed@university.edu  | Password@123');
    console.log('3. Student:    student@university.edu      | Password@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedExactAccounts();
