const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const {generateCertificate} = require('../utils/generateCertificate');
const { sendEmail } = require('../utils/emailService');

 
const createExam = asyncHandler(async (req, res) => {
  const { title, description, duration, passingScore, questions } = req.body;
console.log("create exam")
  if (!title || !duration || !questions || !passingScore) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  const exam = await Exam.create({
    title,
    description,
    duration,
    passingScore,
    questions,
    createdBy: req.user._id
  });

  if (exam) {
    res.status(201).json({
      success: true,
      data: exam
    });
  } else {
    res.status(400);
    throw new Error('Invalid exam data');
  }
});


const getExams = asyncHandler(async (req, res) => {
  let query = {};
  
  // if (req.user.role === 'Student') {
  //   // Students can only see published exams they haven't taken
  //   query = { isPublished: true };
    
  //   // Find exams the student hasn't already completed
  //   const completedExams = await Exam.find({ 'submissions.student': req.user._id })
  //     .select('_id');
    
  //   const completedExamIds = completedExams.map(exam => exam._id);
    
  //   if (completedExamIds.length > 0) {
  //     query._id = { $nin: completedExamIds };
  //   }
  // } else if (req.user.role === 'Examiner') {
  //   // Examiners can see exams they created
  //   query = { createdBy: req.user._id };
  // }
  // Admins can see all exams

  const exams = await Exam.find(query)
    .select('title description duration passingScore isPublished createdAt')
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams
  });
});
const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('questions')
    .populate('submissions.student', 'name');

    // console.log(exam.questions)

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  // Check if user is authorized to view the exam
  // if (req.user.role === 'Student' && !exam.isPublished) {
  //   res.status(403);
  //   throw new Error('Not authorized to access this exam');
  // }

  // For students, randomize the questions and don't include correct answers
  if (req.user.role === 'Student') {
    // Check if student has already taken this exam
    // const alreadySubmitted = exam.submissions.some(
    //   submission => submission.student.toString() === req.user._id.toString()
    // );

    // if (alreadySubmitted) {
    //   res.status(400);
    //   throw new Error('You have already taken this exam');
    // }

    // Randomize questions for student view
    // const shuffledQuestions = [...exam.questions]
    //   .map(question => ({
    //     ...question._doc,
    //     correctAnswer: undefined // Remove correct answers from student view
    //   }))
    //   .sort(() => Math.random() - 0.5);

    // exam.questions = shuffledQuestions;
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});


const updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to update this exam');
  }
  if (exam.submissions.length > 0) {
    const safeUpdate = {
      title: req.body.title || exam.title,
      description: req.body.description || exam.description,
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : exam.isPublished
    };
    
    exam = await Exam.findByIdAndUpdate(req.params.id, safeUpdate, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: exam,
      message: 'Limited update applied as exam has submissions'
    });
  } else {
    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: exam
    });
  }
});


const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to delete this exam');
  }
  if (exam.submissions.length > 0) {
    res.status(400);
    throw new Error('Cannot delete exam with submissions');
  }

  await exam.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
const submitExam = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { answers, timeTaken, tabSwitches } = req.body;
  
  if (!answers) {
    res.status(400);
    throw new Error('Please provide your answers');
  }

  const exam = await Exam.findById(req.params.id).populate('questions');
  // console.log(exam);

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }
  const alreadySubmitted = exam.submissions?.some(
    submission => submission.student.toString() === req.user._id.toString()
  );

  // console.log("after already submitted")

  if (alreadySubmitted) {
    res.status(400);
    throw new Error('You have already submitted this exam');
  }

  const maxAllowedTime = exam.duration * 60 + 30;
  if (timeTaken > maxAllowedTime) {
    res.status(400);
    throw new Error('Submission time exceeds the allowed duration');
  }

  let score = 0;
  let totalPoints = 0;
  let needsManualEvaluation = false;
  
  const gradedAnswers = exam.questions.map(question => {
    const studentAnswer = answers.find(a => a.questionId === question._id.toString());
    
    if (!studentAnswer) {
      return {
        questionId: question._id,
        correct: false,
        points: 0,
        maxPoints: question.points || 1,
        needsManualEvaluation: false
      };
    }
    
    if (question.type === 'MCQ') {
      const isCorrect = studentAnswer.answer === question.correctAnswer;
      const questionPoints = question.points || 1;
      totalPoints += questionPoints;
      
      if (isCorrect) {
        score += questionPoints;
      }
      
      return {
        questionId: question._id,
        correct: isCorrect,
        points: isCorrect ? questionPoints : 0,
        maxPoints: questionPoints,
        needsManualEvaluation: false
      };
    } 
    else if (question.type === 'Subjective') {
      needsManualEvaluation = true;
      const questionPoints = question.points || 1;
      totalPoints += questionPoints;
      
      return {
        questionId: question._id,
        answer: studentAnswer.answer,
        points: 0,
        maxPoints: questionPoints,
        needsManualEvaluation: true
      };
    }
  });
  const percentageScore = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  const passed = !needsManualEvaluation && percentageScore >= exam.passingScore;
  const submission = {
    student: req.user._id,
    answers: gradedAnswers,
    score,
    totalPoints,
    percentageScore,
    timeTaken,
    submittedAt: Date.now(),
    status: needsManualEvaluation ? 'pending' : (passed ? 'passed' : 'failed'),
    needsManualEvaluation,
    tabSwitches: tabSwitches || 0
  };
  // console.log("submission", submission)
  // console.log("exam",exam);
  // console.log("exam.submissions",exam.submissions)


  exam.submissions.push(submission);
  await exam.save();

  
 

  let certificateUrl = null;
  if (passed) {
    console.log("in passed",req.user, exam);  
    certificateUrl = await generateCertificate(req.user,exam,score);
    try {
      await sendEmail(
        {
          email: req.user.email,
          name: req.user.name,
          title: exam.title,
          score: percentageScore.toFixed(2),
          passed,
          certificateUrl
        }
      );
    } catch (error) {
    
      console.error('Email notification failed:', error);
    }
  }

  const user = await User.findById(req.user._id);
  user.examHistory.push({
    exam: exam._id,
    score,
    passed,
    submittedAt: new Date(),
    timeTaken:timeTaken,
    certificateGenerated: passed ? true : false,
    certificateUrl
  });
  await user.save();


  
  console.log("certificateUrl",certificateUrl);

  res.status(200).json({
    success: true,
    data: {
      score,
      totalPoints,
      percentageScore,
      passed,
      needsManualEvaluation,
      certificateUrl,
    }
  });
});






const getPendingEvaluations = asyncHandler(async (req, res) => {
  const exams = await Exam.find({
    'submissions.needsManualEvaluation': true,
    'submissions.status': 'pending'
  })
  .select('title submissions')
  .populate('submissions.student', 'name email');
  const pendingEvaluations = exams.map(exam => {
    return {
      examId: exam._id,
      title: exam.title,
      pendingSubmissions: exam.submissions.filter(
        sub => sub.needsManualEvaluation && sub.status === 'pending'
      ).map(sub => ({
        submissionId: sub._id,
        student: sub.student,
        submittedAt: sub.submittedAt
      }))
    };

  }).filter(exam => exam.pendingSubmissions.length > 0);

  res.status(200).json({
    success: true,
    count: pendingEvaluations.length,
    data: pendingEvaluations
  });
});

const evaluateSubjective = asyncHandler(async (req, res) => {
  const { submissionId, evaluations } = req.body;

  if (!submissionId || !evaluations) {
    res.status(400);
    throw new Error('Please provide submission ID and evaluations');
  }

  const exam = await Exam.findById(req.params.examId).populate('questions');

  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }

  
  const submissionIndex = exam.submissions.findIndex(
    sub => sub._id.toString() === submissionId
  );

  if (submissionIndex === -1) {
    res.status(404);
    throw new Error('Submission not found');
  }

  const submission = exam.submissions[submissionIndex];

  
  let additionalScore = 0;

  evaluations.forEach(evaluation => {
    const answerIndex = submission.answers.findIndex(
      ans => ans.questionId.toString() === evaluation.questionId
    );

    if (answerIndex !== -1) {
      const answer = submission.answers[answerIndex];
      if (answer.needsManualEvaluation) {
         const pointsAwarded = Math.min(evaluation.points, answer.maxPoints);
        additionalScore += pointsAwarded;
        
         exam.submissions[submissionIndex].answers[answerIndex].points = pointsAwarded;
        exam.submissions[submissionIndex].answers[answerIndex].feedback = evaluation.feedback;
        exam.submissions[submissionIndex].answers[answerIndex].evaluatedBy = req.user._id;
        exam.submissions[submissionIndex].answers[answerIndex].evaluatedAt = Date.now();
      }
    }
  });

   exam.submissions[submissionIndex].score += additionalScore;
  
   const totalPoints = exam.submissions[submissionIndex].totalPoints;
  const newScore = exam.submissions[submissionIndex].score;
  const newPercentageScore = (newScore / totalPoints) * 100;
  
  exam.submissions[submissionIndex].percentageScore = newPercentageScore;
  
  
  const passed = newPercentageScore >= exam.passingScore;
  exam.submissions[submissionIndex].status = passed ? 'passed' : 'failed';
  exam.submissions[submissionIndex].needsManualEvaluation = false;

  
  await exam.save();

   let certificateUrl = null;
   console.log("passed",passed);
  if (passed) {
    const student = await User.findById(submission.student);
    console.log("in certificate function",student);
    certificateUrl = await generateCertificate(submission.student, exam._id);
    
     try {
      await sendExamResult(
        student.email,
        student.name,
        exam.title,
        newPercentageScore.toFixed(2),
        passed,
        certificateUrl
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }
  console.log("certificateUrl",certificateUrl)

  res.status(200).json({
    success: true,
    data: {
      newScore,
      newPercentageScore,
      passed,
      certificateUrl
    }
  });
});

module.exports = {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  submitExam,
  // getPendingEvaluations,
  // evaluateSubjective
};