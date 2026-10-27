const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { User } = require('../models');

const seedUsers = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing users to avoid duplicate conflicts
    console.log('[Seed] Clearing existing User records...');
    await User.deleteMany({});

    // 1 Admin User
    const adminUser = {
      name: 'FYP System Administrator',
      email: 'admin@university.edu',
      password: 'Admin@12345',
      role: 'admin',
      department: 'Computer Science Department',
      phone: '+92-300-1110000',
    };

    // Supervisor Users
    const supervisors = [
      {
        name: 'Dr. Khursheed Ahmed',
        email: 'dr.khursheed@university.edu',
        password: 'Password@123',
        role: 'supervisor',
        department: 'Computer Science',
        employeeId: 'EMP-000',
        designation: 'Associate Professor',
        phone: '+92-300-1110012',
      },
      {
        name: 'Dr. Tariq Mahmood',
        email: 'dr.tariq@university.edu',
        password: 'Supervisor@12345',
        role: 'supervisor',
        department: 'Computer Science',
        employeeId: 'EMP-001',
        designation: 'Professor & FYP Coordinator',
        phone: '+92-300-1110001',
      },
      {
        name: 'Dr. Amna Farooq',
        email: 'dr.amna@university.edu',
        password: 'Supervisor@12345',
        role: 'supervisor',
        department: 'Software Engineering',
        employeeId: 'EMP-002',
        designation: 'Associate Professor',
        phone: '+92-300-1110002',
      },
      {
        name: 'Dr. Fahad Siddiqui',
        email: 'dr.fahad@university.edu',
        password: 'Supervisor@12345',
        role: 'supervisor',
        department: 'Computer System Engineering',
        employeeId: 'EMP-003',
        designation: 'Assistant Professor',
        phone: '+92-300-1110003',
      },
    ];

    // Student Users
    const students = [
      {
        name: 'Ali Ahmed',
        email: 'student@university.edu',
        password: 'Password@123',
        role: 'student',
        department: 'Computer System Engineering',
        studentId: 'CSE-2023-01',
        batch: '2023-2027',
        phone: '+92-300-1234567',
      },
      {
        name: 'Ali Ahmed',
        email: 'student1@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer Science',
        studentId: 'CS-2023-01',
        batch: '2023-2027',
        phone: '+92-321-5550001',
      },
      {
        name: 'Sara Khan',
        email: 'student2@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer Science',
        studentId: 'CS-2023-02',
        batch: '2023-2027',
        phone: '+92-321-5550002',
      },
      {
        name: 'Bilal Hassan',
        email: 'student3@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Software Engineering',
        studentId: 'SE-2023-03',
        batch: '2023-2027',
        phone: '+92-321-5550003',
      },
      {
        name: 'Zainab Fatima',
        email: 'student4@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Software Engineering',
        studentId: 'SE-2023-04',
        batch: '2023-2027',
        phone: '+92-321-5550004',
      },
      {
        name: 'Hamza Malik',
        email: 'student5@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer System Engineering',
        studentId: 'CSE-2023-05',
        batch: '2023-2027',
        phone: '+92-321-5550005',
      },
      {
        name: 'Ayesha Noor',
        email: 'student6@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer System Engineering',
        studentId: 'CSE-2023-06',
        batch: '2023-2027',
        phone: '+92-321-5550006',
      },
      {
        name: 'Usman Tariq',
        email: 'student7@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer Science',
        studentId: 'CS-2023-07',
        batch: '2023-2027',
        phone: '+92-321-5550007',
      },
      {
        name: 'Maryam Nawaz',
        email: 'student8@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer Science',
        studentId: 'CS-2023-08',
        batch: '2023-2027',
        phone: '+92-321-5550008',
      },
      {
        name: 'Omer Farooq',
        email: 'student9@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Software Engineering',
        studentId: 'SE-2023-09',
        batch: '2023-2027',
        phone: '+92-321-5550009',
      },
      {
        name: 'Hina Riaz',
        email: 'student10@university.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer System Engineering',
        studentId: 'CSE-2023-10',
        batch: '2023-2027',
        phone: '+92-321-5550010',
      },
    ];

    console.log('[Seed] Seeding Admin user...');
    await User.create(adminUser);

    console.log('[Seed] Seeding 3 Supervisor users...');
    for (const sup of supervisors) {
      await User.create(sup);
    }

    console.log('[Seed] Seeding 10 Student users...');
    for (const stu of students) {
      await User.create(stu);
    }

    const totalCount = await User.countDocuments();
    console.log(`[Seed Complete] Successfully seeded ${totalCount} users into MongoDB!`);
    console.log('----------------------------------------------------');
    console.log('Admin Account:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${adminUser.password}`);
    console.log('Sample Supervisor Account:');
    console.log(`  Email: ${supervisors[0].email}`);
    console.log(`  Password: ${supervisors[0].password}`);
    console.log('Sample Student Account:');
    console.log(`  Email: ${students[0].email}`);
    console.log(`  Password: ${students[0].password}`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
