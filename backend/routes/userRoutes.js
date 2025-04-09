const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserExams
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('Admin'), getUsers);

router
  .route('/exams')
  .get(protect, getUserExams);

router
  .route('/:id')
  .get(protect, authorize('Admin'), getUser)
  
  .put(protect, updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;