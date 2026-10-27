// Automated Integration Test for Phase 3 Student and Supervisor APIs
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

const runPhase3Tests = async () => {
  console.log('====================================================');
  console.log('    STARTING PHASE 3 STUDENT & SUPERVISOR TESTS     ');
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
    // 1. Register a fresh Student for idempotent testing and log in Supervisor
    const uniqueStudentEmail = `phase3.student.${Date.now()}@university.edu`;
    const regStudentRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Phase3 Student Tester',
        email: uniqueStudentEmail,
        password: 'Password@123',
        studentId: `STU-P3-${Date.now().toString().slice(-4)}`,
        department: 'Computer Science',
        batch: '2023-2027',
      }
    );
    const studentToken = regStudentRes.data.token;
    const studentId = regStudentRes.data.user.id;

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

    // --- ROLE BARRIERS ---
    // Test 1: Student blocked from Supervisor endpoints
    const stuToSup = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/supervisor/students',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(stuToSup.status === 403, '1. Student cannot access supervisor endpoint (403 Forbidden)');

    // Test 2: Supervisor blocked from Student proposal submission
    const supToStu = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/student/proposals',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      { title: 'Test', abstract: 'Test', domain: 'AI' }
    );
    assert(supToStu.status === 403, '2. Supervisor cannot submit student proposal (403 Forbidden)');

    // --- STUDENT APIS ---
    // Test 3: Submit FYP proposal
    const proposalRes = await request(
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
      {
        title: 'Deep Learning for Autonomous Drone Surveillance',
        abstract: 'Using YOLOv8 and Jetson Nano for real-time target tracking and airspace obstacle detection.',
        domain: 'Artificial Intelligence & Robotics',
        technologies: ['PyTorch', 'YOLOv8', 'OpenCV', 'ROS2', 'Python'],
        supervisor: supervisorId,
      }
    );
    assert(
      proposalRes.status === 201 && proposalRes.data.proposal._id,
      '3. Student submits FYP proposal (201 Created)',
      JSON.stringify(proposalRes.data)
    );
    const proposalId = proposalRes.data.proposal._id;

    // Test 4: Prevent duplicate active proposal submission
    const dupProposalRes = await request(
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
      {
        title: 'Another Drone Project',
        abstract: 'Duplicate proposal attempt.',
        domain: 'Robotics',
      }
    );
    assert(
      dupProposalRes.status === 400 && dupProposalRes.data.success === false,
      '4. Student cannot submit multiple active proposals (400 Bad Request)'
    );

    // Test 5: View own proposal & project status & assigned supervisor
    const myProjectRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/student/my-project',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      myProjectRes.status === 200 &&
        myProjectRes.data.proposal &&
        myProjectRes.data.proposal.status === 'pending',
      '5. Student retrieves active proposal status & supervisor details (200 OK)'
    );

    // Test 6: Search previous FYPs with keyword, year, technology filters
    const searchFypsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/student/previous-fyps?technology=Python&year=2023',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      searchFypsRes.status === 200 && Array.isArray(searchFypsRes.data.records),
      '6. Student searches Previous FYPs with tech & year filters (200 OK)'
    );

    // Test 7: Upload Project Document (PDF) via Multer
    const boundary = '----WebKitFormBoundaryX9A34ZqW11BCdE';
    const fakePdfBytes = Buffer.from('%PDF-1.4 sample fyp deliverable content %EOF');
    const docUploadBody = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="title"\r\n\r\nProposal Initial Draft\r\n` +
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="milestoneKey"\r\n\r\nproposal_doc\r\n` +
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="proposalId"\r\n\r\n${proposalId}\r\n` +
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="drone_proposal.pdf"\r\n` +
          `Content-Type: application/pdf\r\n\r\n`
      ),
      fakePdfBytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadDocRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/student/documents',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': docUploadBody.length,
        },
      },
      docUploadBody
    );
    assert(
      uploadDocRes.status === 201 && uploadDocRes.data.document._id,
      '7. Student uploads PDF document deliverable within 10MB limit (201 Created)',
      JSON.stringify(uploadDocRes.data)
    );
    const documentId = uploadDocRes.data.document._id;

    // Test 8: List student's uploaded documents
    const listDocsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/student/documents',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      listDocsRes.status === 200 && listDocsRes.data.documents.length >= 1,
      '8. Student lists own uploaded deliverables (200 OK)'
    );

    // Test 9: Download uploaded document
    const downloadRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/student/documents/${documentId}/download`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      downloadRes.status === 200,
      '9. Download uploaded document successfully streams file (200 OK)'
    );

    // --- SUPERVISOR APIS ---
    // Test 10: List proposals awaiting or assigned to supervisor
    const supProposalsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/supervisor/proposals?status=pending',
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(
      supProposalsRes.status === 200 && supProposalsRes.data.proposals.length >= 1,
      '10. Supervisor retrieves pending proposals (200 OK)'
    );

    // Test 11: Approve proposal with remarks & automatically spawn Project
    const reviewRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/supervisor/proposals/${proposalId}/review`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        status: 'approved',
        remarks: 'Excellent proposal. Approved for FYP development. Focus on edge inference on Jetson.',
      }
    );
    assert(
      reviewRes.status === 200 &&
        reviewRes.data.proposal.status === 'approved' &&
        reviewRes.data.project &&
        reviewRes.data.project.status === 'in-progress',
      '11. Supervisor approves proposal with remarks and spawns active Project (200 OK)',
      JSON.stringify(reviewRes.data)
    );
    const projectId = reviewRes.data.project._id;

    // Test 12: List assigned students under supervisor
    const supStudentsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/supervisor/students',
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(
      supStudentsRes.status === 200 && supStudentsRes.data.students.length >= 1,
      '12. Supervisor lists assigned students with active project details (200 OK)'
    );

    // Test 13: Give feedback on project
    const feedbackRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/supervisor/feedback',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        projectId,
        content: 'Review of SRS complete. Ensure system architecture diagram includes edge-to-cloud telemetry.',
        milestoneKey: 'srs',
        feedbackType: 'milestone_review',
      }
    );
    assert(
      feedbackRes.status === 201 && feedbackRes.data.feedback._id,
      '13. Supervisor records milestone feedback (201 Created)'
    );

    // Test 14: Get project feedback history
    const getFeedbackRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/supervisor/projects/${projectId}/feedback`,
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(
      getFeedbackRes.status === 200 && getFeedbackRes.data.feedback.length >= 1,
      '14. Supervisor retrieves project feedback history (200 OK)'
    );

    // Test 15: Student submits weekly progress update
    const stuProgressRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/student/progress-updates',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        projectId,
        title: 'Week 4: YOLOv8 model quantization',
        description: 'Completed TensorRT model conversion for edge deployment on Jetson Nano.',
        weekNumber: 4,
        tasksCompleted: ['YOLOv8 nano trained', 'Exported to ONNX', 'TensorRT engine built'],
        nextWeekPlan: ['ROS2 node integration', 'Camera fps testing'],
        blockers: 'Minor CUDA library version mismatch resolved.',
      }
    );
    assert(
      stuProgressRes.status === 201 && stuProgressRes.data.progressUpdate._id,
      '15. Student submits weekly progress update (201 Created)'
    );
    const progressId = stuProgressRes.data.progressUpdate._id;

    // Test 16: Supervisor reviews student progress update
    const reviewProgressRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/supervisor/progress-updates/${progressId}/review`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        supervisorNote: 'Great progress on TensorRT conversion. Keep camera latency under 30ms.',
        status: 'reviewed',
      }
    );
    assert(
      reviewProgressRes.status === 200 &&
        reviewProgressRes.data.progressUpdate.status === 'reviewed',
      '16. Supervisor reviews progress update with remarks (200 OK)'
    );

    // Test 17: Supervisor logs direct progress update
    const supLogProgressRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/supervisor/progress-updates',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        projectId,
        title: 'Bi-weekly Supervisor Progress Evaluation',
        description: 'Meeting held. Team is on schedule for mid-evaluation.',
        weekNumber: 5,
        status: 'reviewed',
        supervisorNote: 'Satisfactory performance.',
      }
    );
    assert(
      supLogProgressRes.status === 201 && supLogProgressRes.data.progressUpdate._id,
      '17. Supervisor adds progress update (201 Created)'
    );

    // Test 18: Assign marks for SRS milestone
    const assignMarksRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/supervisor/marks',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        projectId,
        milestoneKey: 'srs',
        marksAwarded: 92,
        maxMarks: 100,
        remarks: 'Thorough requirements specification and clear architecture diagrams.',
      }
    );
    assert(
      assignMarksRes.status === 200 && assignMarksRes.data.marks.marksAwarded === 92,
      '18. Supervisor assigns milestone marks (200 OK)'
    );

    // Test 19: Assign final defense marks and verify grade calculation
    const finalMarksRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/supervisor/marks',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supervisorToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        projectId,
        milestoneKey: 'final_defense',
        marksAwarded: 94,
        maxMarks: 100,
        remarks: 'Outstanding project execution and defense presentation.',
      }
    );
    assert(
      finalMarksRes.status === 200 &&
        finalMarksRes.data.projectStatus.finalGrade === 'A+' &&
        finalMarksRes.data.projectStatus.status === 'completed',
      '19. Supervisor grades final defense; auto-assigns grade A+ and marks project completed (200 OK)'
    );

    // Test 20: Get project marks breakdown
    const getMarksRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/supervisor/projects/${projectId}/marks`,
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(
      getMarksRes.status === 200 && getMarksRes.data.marks.length >= 2,
      '20. Supervisor retrieves marks breakdown for project (200 OK)'
    );

    // Test 21: List supervisor active projects
    const supProjectsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/supervisor/projects',
      method: 'GET',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert(
      supProjectsRes.status === 200 && supProjectsRes.data.projects.length >= 1,
      '21. Supervisor lists all supervised projects (200 OK)'
    );

    console.log('\n====================================================');
    console.log(`PHASE 3 RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runPhase3Tests();
