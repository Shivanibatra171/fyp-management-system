const express = require('express');
const {
  submitProposal,
  checkSimilarityPreSubmit,
  getSupervisorsList,
  getMyProjectStatus,
  searchPreviousFyps,
  uploadDocumentFile,
  getMyDocuments,
  downloadDocument,
  submitStudentProgress,
} = require('../controllers/studentController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

const router = express.Router();

// General authentication required for all student routes
router.use(protect);

// Previous FYPs search (accessible to students)
router.get('/previous-fyps', searchPreviousFyps);

// Secure document download (accessible to student, supervisor, and admin)
router.get('/documents/:id/download', downloadDocument);

// Role-restricted routes (Student only)
router.use(authorize('student'));

router.get('/supervisors', getSupervisorsList);
router.post('/proposals/check-similarity', checkSimilarityPreSubmit);
router.post('/proposals', submitProposal);
router.get('/my-project', getMyProjectStatus);
router.post('/documents', uploadDocument.single('file'), uploadDocumentFile);
router.get('/documents', getMyDocuments);
router.post('/progress-updates', submitStudentProgress);

module.exports = router;
