const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add question text']
  },
  options: {
    type: [String],
    required: function() {
      return this.type === 'MCQ';
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Please add correct answer']
  },
  type: {
    type: String,
    enum: ['MCQ', 'Subjective'],
    default: 'MCQ'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  marks: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Question', QuestionSchema);