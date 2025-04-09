const express = require('express');
const {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  submitExam,
  getPendingEvaluations,
  evaluateSubjective
} = require('../controllers/examController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getExams)
  .post(protect, authorize('Admin', 'Examiner'), createExam);

router
  .route('/:id')
  .get(protect, getExam)
  .put(protect, authorize('Admin', 'Examiner'), updateExam)
  .delete(protect, authorize('Admin', 'Examiner'), deleteExam);

router
  .route('/:id/submit')
  .post(protect, authorize('Student'), submitExam);

router
  .route('/evaluations')
  .get(protect, authorize('Admin', 'Examiner'), getPendingEvaluations);

router
  .route('/:examId/evaluate')
  .post(protect, authorize('Admin', 'Examiner'), evaluateSubjective);

module.exports = router;