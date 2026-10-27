const express = require('express');
const {
  // Users
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  // Supervisor allocation
  assignSupervisorToStudent,
  assignSupervisorToProject,
  assignSupervisorToProposal,
  // PreviousFYP
  getPreviousFyps,
  getPreviousFypById,
  createPreviousFyp,
  updatePreviousFyp,
  deletePreviousFyp,
  importPreviousFypsCsv,
  // Proposals & Projects
  getAllProposals,
  getAllProjects,
  getDashboardStats,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadCsv } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Strict Admin-only middleware for all routes in this router
router.use(protect);
router.use(authorize('admin'));

// Dashboard Stats
router.get('/stats', getDashboardStats);

// User Management (Students & Supervisors)
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.patch('/users/:id/toggle-status', toggleUserStatus);

// Supervisor Allocation
router.put('/assign-supervisor/student', assignSupervisorToStudent);
router.put('/assign-supervisor/project', assignSupervisorToProject);
router.put('/assign-supervisor/proposal', assignSupervisorToProposal);

// PreviousFYP CSV Import (must precede /:id)
router.post('/previous-fyps/import-csv', uploadCsv.single('file'), importPreviousFypsCsv);

// PreviousFYP CRUD
router.route('/previous-fyps')
  .get(getPreviousFyps)
  .post(createPreviousFyp);

router.route('/previous-fyps/:id')
  .get(getPreviousFypById)
  .put(updatePreviousFyp)
  .delete(deletePreviousFyp);

// Proposals and Projects Management
router.get('/proposals', getAllProposals);
router.get('/projects', getAllProjects);

module.exports = router;
