const express = require('express');
const {
  getAssignedStudents,
  getAssignedProposals,
  reviewProposal,
  giveFeedback,
  getProjectFeedback,
  addProgressUpdate,
  reviewStudentProgress,
  getSupervisorProgressUpdates,
  assignMarks,
  getProjectMarks,
  getAssignedProjects,
} = require('../controllers/supervisorController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Strict Supervisor-only middleware for all routes in this router
router.use(protect);
router.use(authorize('supervisor'));

// Assigned students and projects
router.get('/students', getAssignedStudents);
router.get('/projects', getAssignedProjects);

// Proposals review
router.get('/proposals', getAssignedProposals);
router.put('/proposals/:id/review', reviewProposal);

// Feedback
router.post('/feedback', giveFeedback);
router.get('/projects/:id/feedback', getProjectFeedback);

// Progress updates
router.get('/progress-updates', getSupervisorProgressUpdates);
router.post('/progress-updates', addProgressUpdate);
router.put('/progress-updates/:id/review', reviewStudentProgress);

// Marks and Grading
router.post('/marks', assignMarks);
router.get('/projects/:id/marks', getProjectMarks);

module.exports = router;
