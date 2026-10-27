// End-to-End Test for Phase 4: AI Similarity Detection & Node Backend Integration
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

const runAiIntegrationTests = async () => {
  console.log('====================================================');
  console.log('   STARTING PHASE 4 AI SIMILARITY INTEGRATION TEST  ');
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
    // 1. Verify AI Microservice is online
    const aiHealth = await request({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/health',
      method: 'GET',
    });
    assert(
      aiHealth.status === 200 && aiHealth.data.status === 'healthy',
      '1. AI Microservice /health returns 200 OK and healthy status'
    );

    // 2. Verify Backend Server is online
    const beHealth = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(
      beHealth.status === 200 && beHealth.data.success === true,
      '2. Backend Server /api/health returns 200 OK'
    );

    // 3. Admin login and ensure benchmark Previous FYP records exist
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

    // Seed a known reference project for similarity testing
    const seedFypRes = await request(
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
        title: 'Smart Attendance System using Face Recognition and Convolutional Neural Networks',
        abstract: 'An automated student attendance monitoring system using OpenCV, MTCNN, and CNN embeddings deployed on a raspberry pi camera and web dashboard.',
        domain: 'Artificial Intelligence',
        year: 2023,
        supervisorName: 'Dr. Tariq Mahmood',
        studentNames: ['Hamza Tariq', 'Bilal Ahmed'],
        technologies: ['Python', 'OpenCV', 'PyTorch', 'CNN', 'FastAPI'],
        grade: 'A+',
      }
    );
    assert(
      seedFypRes.status === 201 || seedFypRes.status === 200,
      '3. Benchmark historical FYP record verified/seeded in MongoDB'
    );

    // 4. Register a fresh student for proposal testing
    const studentEmail = `ai.test.student.${Date.now()}@university.edu`;
    const regStudent = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'AI Test Student',
        email: studentEmail,
        password: 'Password@123',
        studentId: `AI-${Date.now().toString().slice(-4)}`,
        department: 'Computer Science',
      }
    );
    const studentToken = regStudent.data.token;

    // 5. Submit a proposal HIGHLY SIMILAR to the seeded face attendance FYP
    const similarProposal = {
      title: 'Automated Facial Recognition Attendance Management System with Deep Learning',
      abstract: 'A deep learning attendance management system using face detection CNN algorithms and computer vision for automating classroom student presence.',
      domain: 'Computer Vision & AI',
      technologies: ['Python', 'CNN', 'Face Recognition', 'OpenCV'],
    };

    const submitSimRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/student/proposals',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
      },
      similarProposal
    );

    assert(
      submitSimRes.status === 201 && submitSimRes.data.proposal._id,
      '4. Backend accepts proposal and calls AI microservice (201 Created)',
      JSON.stringify(submitSimRes.data)
    );

    assert(
      submitSimRes.data.hasWarning === true &&
        submitSimRes.data.similarityReport.maxSimilarity > 70.0,
      `5. Warning triggered when similarity > 70% (Score: ${submitSimRes.data.similarityReport.maxSimilarity}%)`,
      JSON.stringify(submitSimRes.data.similarityReport)
    );

    assert(
      submitSimRes.data.similarityReport.topMatches &&
        submitSimRes.data.similarityReport.topMatches.length > 0 &&
        submitSimRes.data.similarityReport.topMatches[0].title.includes('Attendance System'),
      '6. Top match correctly identifies the historical Face Attendance project',
      JSON.stringify(submitSimRes.data.similarityReport.topMatches[0])
    );

    assert(
      submitSimRes.data.proposal.similarityResult !== null &&
        submitSimRes.data.proposal.similarityScore > 70.0,
      '7. SimilarityResult model correctly linked to Proposal in MongoDB'
    );

    // 6. Register a second fresh student to test a NOVEL/ORIGINAL proposal
    const novelStudentEmail = `novel.student.${Date.now()}@university.edu`;
    const regNovelStudent = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Novel Idea Student',
        email: novelStudentEmail,
        password: 'Password@123',
        studentId: `NOV-${Date.now().toString().slice(-4)}`,
        department: 'Computer Science',
      }
    );
    const novelStudentToken = regNovelStudent.data.token;

    // Novel proposal completely different from all previous FYPs
    const novelProposal = {
      title: 'Quantum Key Distribution for Deep Space Satellite Relays',
      abstract: 'Implementing simulation models for BB84 photon polarization protocols over interplanetary laser optical links to prevent interception.',
      domain: 'Quantum Computing & Telecommunications',
      technologies: ['Qiskit', 'Python', 'C++', 'Optics Simulator'],
    };

    const submitNovelRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/student/proposals',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${novelStudentToken}`,
          'Content-Type': 'application/json',
        },
      },
      novelProposal
    );

    assert(
      submitNovelRes.status === 201 && submitNovelRes.data.hasWarning === false,
      `8. Novel proposal accepted WITHOUT warning (Score: ${submitNovelRes.data.similarityReport.maxSimilarity}%)`,
      `Score: ${submitNovelRes.data.similarityReport.maxSimilarity}%`
    );

    assert(
      submitNovelRes.data.similarityReport.maxSimilarity < 50.0,
      '9. Novel proposal similarity score is below 50%'
    );

    console.log('\n====================================================');
    console.log(`PHASE 4 RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runAiIntegrationTests();
