const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');

const { protect } = require('../middleware/authMiddleware');
router.use(protect);

router.route('/')
  .post(createQuestion)
  .get(getQuestions);

router.route('/:id')
  .get(getQuestion)
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router;
