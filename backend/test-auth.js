// Automated Integration Test for Phase 1 Auth & RBAC
const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('   STARTING PHASE 1 AUTH & RBAC INTEGRATION TESTS   ');
  console.log('====================================================\n');

  let studentToken = '';
  let supervisorToken = '';
  let adminToken = '';
  let passedCount = 0;
  let totalCount = 0;

  const assert = (condition, testName, details = '') => {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  };

  try {
    // 1. Health Check
    const health = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data.success === true, '1. Health check returns 200 OK');

    // 2. Register New Student
    const newStudentEmail = `test.student.${Date.now()}@university.edu`;
    const regRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Automated Tester',
        email: newStudentEmail,
        password: 'Password@123',
        studentId: `TEST-${Date.now().toString().slice(-5)}`,
        department: 'Software Engineering',
        batch: '2023-2027',
      }
    );
    assert(
      regRes.status === 201 && regRes.data.success === true && regRes.data.token,
      '2. Register new student returns 201 Created with JWT',
      JSON.stringify(regRes.data)
    );
    studentToken = regRes.data.token;

    // 3. Prevent Duplicate Registration
    const dupRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Automated Tester Dup',
        email: newStudentEmail,
        password: 'Password@123',
      }
    );
    assert(
      dupRes.status === 400 && dupRes.data.success === false,
      '3. Reject duplicate student registration with 400 Bad Request',
      JSON.stringify(dupRes.data)
    );

    // 4. Student Login
    const stuLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: newStudentEmail,
        password: 'Password@123',
      }
    );
    assert(
      stuLogin.status === 200 && stuLogin.data.success === true && stuLogin.data.user.role === 'student',
      '4. Student login returns 200 OK and student role payload'
    );

    // 5. Seeded Supervisor Login
    const supLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'dr.tariq@university.edu',
        password: 'Supervisor@12345',
      }
    );
    assert(
      supLogin.status === 200 && supLogin.data.success === true && supLogin.data.user.role === 'supervisor',
      '5. Seeded Supervisor login returns 200 OK and supervisor role'
    );
    supervisorToken = supLogin.data.token;

    // 6. Seeded Admin Login
    const admLogin = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@university.edu',
        password: 'Admin@12345',
      }
    );
    assert(
      admLogin.status === 200 && admLogin.data.success === true && admLogin.data.user.role === 'admin',
      '6. Seeded Admin login returns 200 OK and admin role'
    );
    adminToken = admLogin.data.token;

    // 7. Get Current User (/api/auth/me) with Student Token
    const meRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      meRes.status === 200 && meRes.data.user.email === newStudentEmail,
      '7. GET /api/auth/me with Bearer token returns current user profile'
    );

    // 8. Access Denied without Token
    const noTokenRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
    });
    assert(
      noTokenRes.status === 401 && noTokenRes.data.success === false,
      '8. GET /api/auth/me without token returns 401 Unauthorized'
    );

    // 9. RBAC: Student accesses Student endpoint
    const stuTestRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/test-student',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      stuTestRes.status === 200 && stuTestRes.data.success === true,
      '9. Student token accessing /test-student succeeds (200 OK)'
    );

    // 10. RBAC: Student blocked from Supervisor endpoint
    const stuToSupRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/test-supervisor',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      stuToSupRes.status === 403 && stuToSupRes.data.success === false,
      '10. Student token accessing /test-supervisor is Forbidden (403)'
    );

    // 11. RBAC: Student blocked from Admin endpoint
    const stuToAdmRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/test-admin',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      stuToAdmRes.status === 403 && stuToAdmRes.data.success === false,
      '11. Student token accessing /test-admin is Forbidden (403)'
    );

    // 12. RBAC: Supervisor accesses Supervisor endpoint
    const supTestRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/test-supervisor',
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(
      supTestRes.status === 200 && supTestRes.data.success === true,
      '12. Supervisor token accessing /test-supervisor succeeds (200 OK)'
    );

    // 13. RBAC: Admin accesses Admin endpoint
    const admTestRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/test-admin',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      admTestRes.status === 200 && admTestRes.data.success === true,
      '13. Admin token accessing /test-admin succeeds (200 OK)'
    );

    // 14. 404 Route Not Found
    const notFoundRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/nonexistent-route-endpoint',
      method: 'GET',
    });
    assert(
      notFoundRes.status === 404 && notFoundRes.data.success === false,
      '14. Undefined route correctly caught by 404 handler (404 Not Found)'
    );

    console.log('\n====================================================');
    console.log(`RESULTS: ${passedCount} / ${totalCount} tests passed (${Math.round((passedCount/totalCount)*100)}%)`);
    console.log('====================================================');

    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runTests();
