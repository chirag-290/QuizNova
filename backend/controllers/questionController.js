const Question = require('../models/Question');
const asyncHandler = require('express-async-handler');

// @desc    Create a question
// @route   POST /api/questions
// @access  Private (Examiner/Admin)
const createQuestion = asyncHandler(async (req, res) => {
  const { text, options, correctAnswer, type, difficulty, marks } = req.body;

  if (!text || !correctAnswer || !type) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const question = await Question.create({
    text,
    options: type === 'MCQ' ? options : [],
    correctAnswer,
    type,
    difficulty,
    marks,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: question,
  });
});

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private (Admin/Examiner)
const getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find().populate('createdBy', 'name email');
  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});


const getQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Only Creator or Admin)
const updateQuestion = asyncHandler(async (req, res) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to update this question');
  }

  question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: question,
  });
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Only Creator or Admin)
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error('Question not found');
  }

  if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to delete this question');
  }

  await question.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
