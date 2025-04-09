import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { examAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const EvaluateSubmission = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [evaluations, setEvaluations] = useState({});

  useEffect(() => {
    const fetchSubmissionData = async () => {
      setLoading(true);
      try {
        // This would be a specific API call to get submission details
        // For now, we'll simulate it by getting exam details and finding the submission
        const examRes = await examAPI.getExam(examId);
        if (examRes.data.success) {
          setExam(examRes.data.data);
          
          // Simulate getting submission data
          // In a real app, this would be a separate API call
          const mockSubmission = {
            _id: submissionId,
            student: {
              _id: 'student123',
              name: 'John Doe',
              email: 'john@example.com'
            },
            answers: examRes.data.data.questions.map(q => ({
              questionId: q._id,
              question: q,
              answer: q.type === 'MCQ' ? q.options[Math.floor(Math.random() * q.options.length)] : 'This is a sample subjective answer that needs evaluation.',
              points: q.type === 'MCQ' ? (Math.random() > 0.5 ? q.marks : 0) : null,
              needsEvaluation: q.type === 'Subjective'
            })),
            submittedAt: new Date().toISOString(),
            timeTaken: 1800, // 30 minutes in seconds
            currentScore: 0,
            totalPoints: examRes.data.data.questions.reduce((sum, q) => sum + q.marks, 0)
          };
          
          // Calculate current score from MCQ questions
          mockSubmission.currentScore = mockSubmission.answers.reduce((sum, a) => 
            sum + (a.points || 0), 0);
          
          setSubmission(mockSubmission);
          
          // Initialize evaluations state for subjective questions
          const initialEvaluations = {};
          mockSubmission.answers.forEach(answer => {
            if (answer.needsEvaluation) {
              initialEvaluations[answer.questionId] = {
                points: 0,
                feedback: ''
              };
            }
          });
          setEvaluations(initialEvaluations);
        }
      } catch (error) {
        console.error('Error fetching submission data:', error);
        toast.error('Failed to load submission data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [examId, submissionId]);

  const handlePointsChange = (questionId, points) => {
    const question = submission.answers.find(a => a.questionId === questionId).question;
    const maxPoints = question.marks;
    
    // Ensure points are within valid range
    const validPoints = Math.min(Math.max(0, points), maxPoints);
    
    setEvaluations(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        points: validPoints
      }
    }));
  };

  const handleFeedbackChange = (questionId, feedback) => {
    setEvaluations(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        feedback
      }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Format evaluations for API
      const formattedEvaluations = Object.keys(evaluations).map(questionId => ({
        questionId,
        points: evaluations[questionId].points,
        feedback: evaluations[questionId].feedback
      }));
      
      // In a real app, this would be the actual API call
      const res = await examAPI.evaluateSubjective(examId, {
        submissionId,
        evaluations: formattedEvaluations
      });
      
      if (res.data.success) {
        toast.success('Evaluation submitted successfully!');
        navigate('/evaluations');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast.error('Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  if (!submission || !exam) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Not Found</h2>
        <p className="text-gray-600 mb-6">The submission you're looking for doesn't exist or has been removed.</p>
        <Link to="/evaluations">
          <Button className="mx-auto">
            Back to Evaluations
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate total subjective points available
  const totalSubjectivePoints = submission.answers
    .filter(a => a.needsEvaluation)
    .reduce((sum, a) => sum + a.question.marks, 0);
  
  // Calculate awarded subjective points
  const awardedSubjectivePoints = Object.values(evaluations)
    .reduce((sum, e) => sum + (e.points || 0), 0);
  
  // Calculate total score (MCQ + subjective)
  const totalScore = submission.currentScore + awardedSubjectivePoints;
  
  // Calculate percentage score
  const percentageScore = Math.round((totalScore / submission.totalPoints) * 100);
  
  // Check if passed
  const passed = percentageScore >= exam.passingScore;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/evaluations" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Evaluations</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800">Evaluate Submission</h1>
      
      {/* Submission Info */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{exam.title}</h2>
            <p className="text-gray-600 mb-4">{exam.description || 'No description provided.'}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">Passing Score: {exam.passingScore}%</span>
              <span>Total Points: {submission.totalPoints}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Student Information</h3>
            <p className="text-gray-700">{submission.student.name}</p>
            <p className="text-gray-500 text-sm">{submission.student.email}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Time Taken: {Math.floor(submission.timeTaken / 60)}:{(submission.timeTaken % 60).toString().padStart(2, '0')} minutes
              </p>
            </div >
          </div>
        </div>
      </Card>
      
      {/* Score Summary */}
      <Card title="Score Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600 font-medium">MCQ Score</p>
            <p className="text-2xl font-bold text-gray-800">{submission.currentScore}</p>
            <p className="text-xs text-gray-500">Auto-graded</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <p className="text-sm text-indigo-600 font-medium">Subjective Score</p>
            <p className="text-2xl font-bold text-gray-800">{awardedSubjectivePoints}/{totalSubjectivePoints}</p>
            <p className="text-xs text-gray-500">Your evaluation</p>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
              Total Score
            </p>
            <p className="text-2xl font-bold text-gray-800">{totalScore}/{submission.totalPoints} ({percentageScore}%)</p>
            <p className={`text-xs ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {passed ? 'Passed' : 'Failed'} (Minimum: {exam.passingScore}%)
            </p>
          </div>
        </div>
      </Card>
      
      {/* Questions to Evaluate */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Subjective Questions</h2>
        
        {submission.answers.filter(a => a.needsEvaluation).length > 0 ? (
          submission.answers.filter(a => a.needsEvaluation).map((answer, index) => (
            <Card key={answer.questionId}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">Question {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      answer.question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      answer.question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {answer.question.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      Subjective
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {answer.question.marks} points
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700">{answer.question.text}</p>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">Student's Answer:</p>
                  <p className="text-gray-600">{answer.answer || '(No answer provided)'}</p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-700 mb-2">Expected Answer:</p>
                  <p className="text-gray-700">{answer.question.correctAnswer}</p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor={`points-${answer.questionId}`} className="block text-sm font-medium text-gray-700">
                      Points (0-{answer.question.marks}):
                    </label>
                    <input
                      id={`points-${answer.questionId}`}
                      type="number"
                      min="0"
                      max={answer.question.marks}
                      value={evaluations[answer.questionId]?.points || 0}
                      onChange={(e) => handlePointsChange(answer.questionId, parseInt(e.target.value, 10))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`feedback-${answer.questionId}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback (optional):
                    </label>
                    <textarea
                      id={`feedback-${answer.questionId}`}
                      rows="3"
                      value={evaluations[answer.questionId]?.feedback || ''}
                      onChange={(e) => handleFeedbackChange(answer.questionId, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Provide feedback on the student's answer..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-6">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No subjective questions to evaluate in this submission.</p>
          </Card>
        )}
      </div>
      
      {/* MCQ Questions (Read-only) */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Multiple Choice Questions</h2>
        
        {submission.answers.filter(a => !a.needsEvaluation).length > 0 ? (
          submission.answers.filter(a => !a.needsEvaluation).map((answer, index) => (
            <Card key={answer.questionId}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">Question {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      answer.question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      answer.question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {answer.question.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      MCQ
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {answer.question.marks} points
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700">{answer.question.text}</p>
                
                <div className="space-y-2">
                  {answer.question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`p-2 rounded-md ${
                        option === answer.question.correctAnswer 
                          ? 'bg-green-50 border border-green-200' 
                          : option === answer.answer && option !== answer.question.correctAnswer
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className={
                        option === answer.question.correctAnswer 
                          ? 'text-green-700' 
                          : option === answer.answer && option !== answer.question.correctAnswer
                          ? 'text-red-700'
                          : 'text-gray-700'
                      }>
                        {option}
                        {option === answer.question.correctAnswer && ' ✓'}
                        {option === answer.answer && option !== answer.question.correctAnswer && ' ✗'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center">
                  {answer.answer === answer.question.correctAnswer ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Correct: {answer.points} points</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span>Incorrect: 0 points</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-6">
            <p className="text-gray-600">No multiple choice questions in this submission.</p>
          </Card>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center"
        >
          {submitting ? (
            <Spinner size="small" />
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Submit Evaluation
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EvaluateSubmission;