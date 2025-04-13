import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Download, ArrowLeft, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { examAPI, userAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Leaderboard from './Leaderboard';

const ExamResults = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Get exam details
        const examRes = await examAPI.getExam(id);
        console.log('Exam Details:', examRes.data.data);
        if (examRes.data.success) {
          setExam(examRes.data.data);
        }
        
        // Get user's exam history
        const historyRes = await userAPI.getUserExamHistory();
        if (historyRes.data.success) {
          // Find this exam's result
          const examResult = historyRes.data.data.find(item => item.exam._id === id);
          console.log('Exam Result:', examResult);
          if (examResult) {
            setResults(examResult);
          } else {
            toast.error('No results found for this exam');
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to load exam results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return <Spinner size="large" />;
  }


  if (!results || !exam) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find your results for this exam.</p>
        <Link to="/exams">
          <Button className="mx-auto">
            Browse Exams
          </Button>
        </Link>
      </div>
    );
  }

  const percentageScore = Math.round((results.score / exam.totalMarks) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/exam-history" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Exam History</span>
        </Link>
      </div>
      
      {/* Results Summary */}
      {!showLeaderboard && (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className={`px-6 py-4 text-white ${results.passed ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex items-center">
            {results.passed ? (
              <CheckCircle className="h-8 w-8 mr-3" />
            ) : (
              <XCircle className="h-8 w-8 mr-3" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{results.passed ? 'Exam Passed!' : 'Exam Failed'}</h1>
              <p className="text-sm opacity-90">
                {results.passed 
                  ? 'Congratulations! You have successfully passed this exam.' 
                  : `You didn't meet the minimum passing score of ${exam.passingScore}%.`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{exam.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Your Score</p>
              <p className="text-3xl font-bold text-indigo-600">{results.score}/{exam.totalMarks}</p>
              <p className="text-lg font-medium text-gray-700">{percentageScore}%</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Passing Score</p>
              <p className="text-3xl font-bold text-gray-700">{exam.passingScore}%</p>
              <p className="text-lg font-medium text-gray-700">Minimum Required</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Time Taken</p>
              <p className="text-3xl font-bold text-gray-700">
                {Math.floor(results.timeTaken / 60)}:{(results.timeTaken % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-lg font-medium text-gray-700">Minutes</p>
            </div>
          </div>
          
          {/* Certificate Download */}
          {results.passed && results.certificateGenerated && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Certificate of Completion</h3>
                  <p className="text-sm text-gray-600">Your certificate is ready to download</p>
                </div>
              </div>
              
              <a 
                href={`https://examportal-i5j6.onrender.com${results.certificateUrl}`} 
                target="_blank" 
                download 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Download className="h-5 w-5 mr-2" />
                Download
              </a>
              
            </div>
            
          )}
          
          <div className='flex mt-4 justify-center'>
          <Button  onClick={() => setShowLeaderboard(true)}  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ml-70">
              LeaderBoard
              </Button>
              </div>
        </div>
      </div>
      )}

      {showLeaderboard && (
        <div className="mt-6">
          <Leaderboard exam={exam} onClose={() => setShowLeaderboard(false)} />
        </div>
      )}
      
      {/* Detailed Results */}
      {results.answers && (
        <Card title="Detailed Results">
          <div className="space-y-6">
            {results.answers.map((answer, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">Question {index + 1}</h3>
                  <div className="flex items-center">
                    {answer.correct ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="h-5 w-5 mr-1" />
                        Incorrect
                      </span>
                    )}
                    <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {answer.points} / {answer.maxPoints} points
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{answer.question.text}</p>
                
                {answer.question.type === 'MCQ' ? (
                  <div className="space-y-2">
                    {answer.question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`p-2 rounded-md ${
                          option === answer.question.correctAnswer 
                            ? 'bg-green-50 border border-green-200' 
                            : option === answer.answer
                            ? answer.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className={
                          option === answer.question.correctAnswer 
                            ? 'text-green-700' 
                            : option === answer.answer && !answer.correct
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
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-700">Your Answer:</p>
                      <p className="text-gray-600">{answer.answer || '(No answer provided)'}</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-700">Expected Answer:</p>
                      <p className="text-gray-700">{answer.question.correctAnswer}</p>
                    </div>
                    
                    {answer.feedback && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                        <p className="text-sm font-medium text-indigo-700">Examiner Feedback:</p>
                        <p className="text-gray-700">{answer.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;