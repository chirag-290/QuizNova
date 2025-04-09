import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { examAPI } from '../../services/api';
import { connectSocket, joinExamRoom, listenForTimerUpdates, emitTabSwitch, removeTimerListener } from '../../services/socket';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const TakeExam = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load exam data
  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await examAPI.getExam(id);
        // console.log(res.data);
        if (res.data.success) {
          setExam(res.data.data);
          // Initialize time remaining in seconds
          setTimeRemaining(res.data.data.duration * 60);
          // Initialize empty answers object
          const initialAnswers = {};
          res.data.data.questions.forEach(q => {
            initialAnswers[q._id] = '';
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Failed to load exam');
        navigate('/exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, navigate]);

  // Setup socket connection and timer
  useEffect(() => {
    if (!exam || !token) return;

    // Connect to socket
    const socket = connectSocket(token);
    joinExamRoom(id);
    
    // Listen for timer updates from server
    listenForTimerUpdates((time) => {
      setTimeRemaining(time);
    });
    
    // Record start time
    startTimeRef.current = Date.now();
    
    // Setup local timer as fallback
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up, submit exam
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Handle tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        emitTabSwitch(id, user._id);
        toast.warning('Tab switching detected! This may be flagged for review.');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      clearInterval(timerRef.current);
      removeTimerListener();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [exam, id, token, user._id]);

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigate to previous question
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // Submit exam
  const handleSubmit = async (timeUp = false) => {
    if (!timeUp && !confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    
    setSubmitting(true);
    
    // Calculate time taken in seconds
    const timeTaken = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
      : exam.duration * 60 - timeRemaining;
    
    // Format answers for submission
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId]
    }));
    
    try {
      const res = await examAPI.submitExam(id, {
        answers: formattedAnswers,
        timeTaken
      });
      
      if (res.data.success) {
        toast.success(timeUp ? 'Time\'s up! Exam submitted.' : 'Exam submitted successfully!');
        navigate(`/exams/${id}/results`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam. Please try again.');
      setConfirmSubmit(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel submission confirmation
  const cancelSubmit = () => {
    setConfirmSubmit(false);
  };

  if (loading) {
    return <Spinner size="large" />;
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Not Found</h2>
        <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/exams')} className="mx-auto">
          Back to Exams
        </Button>
      </div>
    );
  }

  const currentQuestionData = exam.questions[currentQuestion];
  // console.log(currentQuestionData)

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{exam.title}</h1>
          <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} of {exam.questions.length}</span>
          <span>Passing Score: {exam.passingScore}%</span>
        </div>
      </div>
      
      {/* Question Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {exam.questions.map((q, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                index === currentQuestion
                  ? 'bg-indigo-600 text-white'
                  : answers[q._id]
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Question */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Question {currentQuestion + 1}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentQuestionData.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentQuestionData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestionData.difficulty}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentQuestionData.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {currentQuestionData.type}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                {currentQuestionData.marks} {currentQuestionData.marks === 1 ? 'point' : 'points'}
              </span>
            </div>
          </div>
          
          <p className="text-gray-700">{currentQuestionData.text}</p>
          
          {/* MCQ Options */}
          
          {currentQuestionData.type === 'MCQ' && (
            
            <div className="space-y-2 mt-4">
              <div>helllo</div>
              {currentQuestionData.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${currentQuestionData._id}`}
                    value={option}
                    checked={answers[currentQuestionData._id] === option}
                    onChange={() => handleAnswerChange(currentQuestionData._id, option)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={`option-${index}`} className="ml-2 text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {/* Subjective Answer */}
          {currentQuestionData.type === 'Subjective' && (
            <div className="mt-4">
              <label htmlFor="subjective-answer" className="block text-sm font-medium text-gray-700 mb-1">
                Your Answer:
              </label>
              <textarea
                id="subjective-answer"
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Type your answer here..."
                value={answers[currentQuestionData._id]}
                onChange={(e) => handleAnswerChange(currentQuestionData._id, e.target.value)}
              ></textarea>
            </div>
          )}
        </div>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPrevQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </Button>
        
        {currentQuestion < exam.questions.length - 1 ? (
          <Button
            onClick={goToNextQuestion}
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={() => handleSubmit()}
            disabled={submitting || confirmSubmit}
            className="flex items-center"
          >
            <Save className="h-5 w-5 mr-1" />
            Submit Exam
          </Button>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You won't be able to change your answers after submission.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={cancelSubmit}>
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? <Spinner size="small" /> : 'Submit Exam'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;