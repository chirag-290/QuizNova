const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  duration: {
    type: Number,
    required: [true, 'Please specify exam duration']
  },
  passingScore: {
    type: Number,
    required: [true, 'Please specify passing score']
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    // required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    // required: [true, 'Please add an end date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number,
    submittedAt: Date,
    timeSpent: Number,
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Evaluated'],
      default: 'Not Started'
    },
    responses: [{
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      answer: String,
      isCorrect: Boolean,
      marksAwarded: Number
    }],
    tabSwitches: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

 
ExamSchema.pre('save', async function(next) {
  if (this.isModified('questions')) {
    const Question = mongoose.model('Question');
    const questions = await Question.find({ _id: { $in: this.questions } });
    this.totalMarks = questions.reduce((total, question) => total + question.marks, 0);
  }
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);