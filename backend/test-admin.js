// Automated Integration Test for Phase 2 Admin APIs
const http = require('http');

const request = (options, postData = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const opts = {
      ...options,
      headers: {
        ...options.headers,
        ...headers,
      },
    };

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (Buffer.isBuffer(postData)) {
        req.write(postData);
      } else if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
};

const runAdminTests = async () => {
  console.log('====================================================');
  console.log('      STARTING PHASE 2 ADMIN APIs TEST SUITE        ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, testName, details = '') => {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName} - Details: ${details}`);
    }
  };

  try {
    // 1. Log in Admin, Supervisor, and Student to get tokens
    const adminLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@university.edu', password: 'Admin@12345' }
    );
    const adminToken = adminLogin.data.token;

    const studentLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'student1@university.edu', password: 'Student@12345' }
    );
    const studentToken = studentLogin.data.token;

    const supervisorLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'dr.tariq@university.edu', password: 'Supervisor@12345' }
    );
    const supervisorToken = supervisorLogin.data.token;
    const supervisorId = supervisorLogin.data.user.id;

    // --- GATEKEEPER / RBAC TESTS ---
    // Test 1: Block unauthenticated requests
    const noAuth = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
    });
    assert(noAuth.status === 401, '1. Admin endpoint rejects request without token (401)');

    // Test 2: Block Student from Admin endpoints
    const stuDenied = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(stuDenied.status === 403, '2. Student role blocked from Admin endpoint (403 Forbidden)');

    // Test 3: Block Supervisor from Admin endpoints
    const supDenied = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(supDenied.status === 403, '3. Supervisor role blocked from Admin endpoint (403 Forbidden)');

    // Test 4: Admin allowed to get dashboard metrics
    const statsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      statsRes.status === 200 && statsRes.data.stats && statsRes.data.stats.users.total >= 13,
      '4. Admin successfully retrieves system statistics (200 OK)',
      JSON.stringify(statsRes.data)
    );

    // --- USER MANAGEMENT CRUD ---
    // Test 5: List users with role filter & pagination
    const listUsers = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/users?role=student&page=1&limit=5',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      listUsers.status === 200 && listUsers.data.users.length === 5 && listUsers.data.total >= 10,
      '5. Admin lists students with pagination (200 OK)',
      `Returned count: ${listUsers.data.count}, total: ${listUsers.data.total}`
    );

    // Test 6: Create new student by Admin
    const createdStudentEmail = `admin.created.stu.${Date.now()}@university.edu`;
    const createUserRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/users',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        name: 'Admin Added Student',
        email: createdStudentEmail,
        password: 'Password@123',
        role: 'student',
        department: 'Computer Science',
        studentId: `CS-${Date.now().toString().slice(-4)}`,
        batch: '2023-2027',
      }
    );
    assert(
      createUserRes.status === 201 && createUserRes.data.user.email === createdStudentEmail,
      '6. Admin creates new student account (201 Created)',
      JSON.stringify(createUserRes.data)
    );
    const newUserId = createUserRes.data.user._id;

    // Test 7: Get single user by ID
    const getUserRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/users/${newUserId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      getUserRes.status === 200 && getUserRes.data.user._id === newUserId,
      '7. Admin retrieves single user by ID (200 OK)'
    );

    // Test 8: Update user details
    const updateUserRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/users/${newUserId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        name: 'Admin Added Student Updated',
        phone: '+92-300-9999999',
      }
    );
    assert(
      updateUserRes.status === 200 && updateUserRes.data.user.name === 'Admin Added Student Updated',
      '8. Admin updates user details (200 OK)'
    );

    // Test 9: Toggle user active status
    const toggleStatusRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/users/${newUserId}/toggle-status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      toggleStatusRes.status === 200 && toggleStatusRes.data.isActive === false,
      '9. Admin deactivates user status via toggle (200 OK)'
    );

    // Test 10: Delete user
    const deleteUserRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/users/${newUserId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      deleteUserRes.status === 200 && deleteUserRes.data.success === true,
      '10. Admin deletes user account (200 OK)'
    );

    // --- SUPERVISOR ASSIGNMENT ---
    // Test 11: Assign supervisor to student
    const student1Id = studentLogin.data.user.id;
    const assignSupRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/assign-supervisor/student',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        studentId: student1Id,
        supervisorId: supervisorId,
      }
    );
    assert(
      assignSupRes.status === 200 &&
        assignSupRes.data.student.assignedSupervisor.id === supervisorId,
      '11. Admin assigns supervisor to student (200 OK)',
      JSON.stringify(assignSupRes.data)
    );

    // --- PREVIOUS FYP CRUD ---
    // Test 12: Create single PreviousFYP record
    const createFypRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/previous-fyps',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        title: 'Smart Health Monitoring System with IoT and Cloud',
        abstract: 'An automated wearable pulse and ECG telemetry platform reporting to cloud dashboards.',
        domain: 'IoT & Cloud Computing',
        year: 2024,
        supervisorName: 'Dr. Tariq Mahmood',
        studentNames: ['Asad Raza', 'Kashif Ali'],
        technologies: ['ESP32', 'Node.js', 'AWS IoT', 'React'],
        grade: 'A+',
      }
    );
    assert(
      createFypRes.status === 201 && createFypRes.data.record._id,
      '12. Admin creates single Previous FYP record (201 Created)'
    );
    const fypId = createFypRes.data.record._id;

    // Test 13: Search and list PreviousFYPs
    const searchFypRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/previous-fyps?search=telemetry&domain=IoT',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      searchFypRes.status === 200 && searchFypRes.data.records.length >= 1,
      '13. Admin searches Previous FYPs with keyword and domain filter (200 OK)'
    );

    // Test 14: Update PreviousFYP record
    const updateFypRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/previous-fyps/${fypId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        grade: 'A',
        technologies: 'ESP32, MQTT, React, MongoDB',
      }
    );
    assert(
      updateFypRes.status === 200 && updateFypRes.data.record.technologies.includes('MQTT'),
      '14. Admin updates Previous FYP record technologies & grade (200 OK)'
    );

    // Test 15: Delete PreviousFYP record
    const deleteFypRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/previous-fyps/${fypId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      deleteFypRes.status === 200 && deleteFypRes.data.success === true,
      '15. Admin deletes Previous FYP record (200 OK)'
    );

    // --- BULK CSV IMPORT ---
    // Test 16: Bulk import PreviousFYPs via multipart/form-data CSV upload
    const csvContent =
      `Title,Abstract,Domain,Year,Supervisor,Students,Technologies,Grade\n` +
      `Autonomous Drone Navigation,Path planning using ROS and depth cameras for indoor obstacle avoidance,Robotics,2023,Dr. Fahad Siddiqui,"Zeeshan, Bilal",ROS; OpenCV; Python,A\n` +
      `Decentralized Voting System,A blockchain voting portal leveraging Ethereum smart contracts,Blockchain,2024,Dr. Amna Farooq,"Hassan, Muneeb",Solidity; React; Web3.js,A+\n` +
      `Fake News Detection with NLP,Transformer-based multi-class classification for Urdu news articles,NLP & AI,2024,Dr. Tariq Mahmood,"Sana, Mariam",PyTorch; BERT; FastAPI,A\n` +
      `Invalid Row Without Supervisor,,AI,2023,,OnlyStudent,Python,B\n`; // Missing required fields

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let bodyBuffer = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="archive_fyps.csv"\r\n` +
          `Content-Type: text/csv\r\n\r\n`
      ),
      Buffer.from(csvContent, 'utf-8'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const csvImportRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/previous-fyps/import-csv',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': bodyBuffer.length,
        },
      },
      bodyBuffer
    );

    assert(
      csvImportRes.status === 201 &&
        csvImportRes.data.importedCount === 3 &&
        csvImportRes.data.skippedCount === 1,
      '16. Admin bulk imports Previous FYPs via CSV (3 imported, 1 invalid skipped) (201 Created)',
      JSON.stringify(csvImportRes.data)
    );

    // --- PROPOSALS & PROJECTS LISTING ---
    // Test 17: List all proposals with filters
    const listProposalsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/proposals?page=1&limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      listProposalsRes.status === 200 && Array.isArray(listProposalsRes.data.proposals),
      '17. Admin lists all proposals with pagination (200 OK)'
    );

    // Test 18: List all projects with filters
    const listProjectsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/projects?page=1&limit=10',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      listProjectsRes.status === 200 && Array.isArray(listProjectsRes.data.projects),
      '18. Admin lists all projects with pagination (200 OK)'
    );

    console.log('\n====================================================');
    console.log(`PHASE 2 RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runAdminTests();
