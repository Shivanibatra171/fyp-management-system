const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function verifyAll() {
  console.log('=== VERIFYING FYP PORTAL EXPANDED CORPUS & AUTH ===\n');

  // 1. Health check
  const healthRes = await axios.get(`${BASE_URL}/health`);
  console.log('✓ Health Endpoint:', healthRes.data.message);

  // 2. Admin Login
  const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@university.edu',
    password: 'Password@123',
  });
  console.log('✓ Admin Login OK:', adminRes.data.user.name, `(${adminRes.data.user.role})`);
  const adminToken = adminRes.data.token;

  // 3. Admin view stats
  const adminStats = await axios.get(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('✓ Admin System Stats:');
  console.log(`   - Students:     ${adminStats.data.stats.users.students}`);
  console.log(`   - Supervisors:  ${adminStats.data.stats.users.supervisors}`);
  console.log(`   - Total Users:  ${adminStats.data.stats.users.total}`);
  console.log(`   - Proposals:    ${adminStats.data.stats.proposals.total} (${adminStats.data.stats.proposals.pending} pending)`);
  console.log(`   - Projects:     ${adminStats.data.stats.projects.total} (${adminStats.data.stats.projects.active} in-progress, ${adminStats.data.stats.projects.completed} completed)`);
  console.log(`   - Past FYPs:    ${adminStats.data.stats.previousFyps.total} historical records`);

  // 4. Supervisor Login (Dr. Khursheed)
  const supRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'dr.khursheed@university.edu',
    password: 'Password@123',
  });
  console.log('\n✓ Dr. Khursheed Login OK:', supRes.data.user.name, `(${supRes.data.user.department})`);
  const supToken = supRes.data.token;

  const supProposals = await axios.get(`${BASE_URL}/supervisor/proposals`, {
    headers: { Authorization: `Bearer ${supToken}` },
  });
  console.log(`✓ Dr. Khursheed Assigned Proposals: ${supProposals.data.count || supProposals.data.data?.length}`);

  const supProjects = await axios.get(`${BASE_URL}/supervisor/projects`, {
    headers: { Authorization: `Bearer ${supToken}` },
  });
  console.log(`✓ Dr. Khursheed Active Projects: ${supProjects.data.count || supProjects.data.data?.length}`);

  // 5. Newly Added Supervisor Login (Dr. Asif Nawaz)
  const newSupRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'dr.asif@university.edu',
    password: 'Password@123',
  });
  console.log('\n✓ Dr. Asif Nawaz Login OK:', newSupRes.data.user.name, `(${newSupRes.data.user.department})`);
  const newSupToken = newSupRes.data.token;

  const newSupProposals = await axios.get(`${BASE_URL}/supervisor/proposals`, {
    headers: { Authorization: `Bearer ${newSupToken}` },
  });
  console.log(`✓ Dr. Asif Assigned Proposals: ${newSupProposals.data.count || newSupProposals.data.data?.length}`);

  // 6. Student Login (Ali Ahmed)
  const stuRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'student@university.edu',
    password: 'Password@123',
  });
  console.log('\n✓ Student Login OK:', stuRes.data.user.name, `(${stuRes.data.user.studentId})`);
  const stuToken = stuRes.data.token;

  // 7. Student view my-project / my proposal
  const myProj = await axios.get(`${BASE_URL}/student/my-project`, {
    headers: { Authorization: `Bearer ${stuToken}` },
  });
  console.log('✓ Student Proposal Title:', myProj.data.proposal?.title);
  console.log('✓ Proposal Status:', myProj.data.proposal?.status);
  console.log('✓ Proposal Similarity Score:', `${myProj.data.proposal?.similarityScore}%`, `(High Similarity Warning: ${myProj.data.proposal?.similarityWarning})`);

  // 8. Student AI similarity check test
  const simRes = await axios.post(
    `${BASE_URL}/student/proposals/check-similarity`,
    {
      title: 'Autonomous Mobile Robot with LiDAR SLAM',
      abstract: 'An autonomous guided vehicle mapping indoor spaces with 2D LiDAR and ROS2 Hector SLAM.',
    },
    {
      headers: { Authorization: `Bearer ${stuToken}` },
    }
  );
  console.log('\n✓ AI Similarity Live Pre-Submit Check:');
  console.log(`   - Max Similarity: ${simRes.data.data?.maxSimilarity}%`);
  console.log(`   - High Warning Flag: ${simRes.data.data?.hasWarning}`);
  console.log(`   - Top Matched Past FYP: "${simRes.data.data?.topMatches?.[0]?.title}" (${simRes.data.data?.topMatches?.[0]?.similarityPercentage}%)`);

  console.log('\n======================================================');
  console.log('   ALL CHECKS VERIFIED 100% OPERATIONAL');
  console.log('======================================================\n');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
