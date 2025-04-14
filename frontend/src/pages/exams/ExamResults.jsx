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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#1f2937]">
        <Spinner size="large" className="text-pink-500" />
      </div>
    );
  }

  if (!results || !exam) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-[#0d1117] to-[#1f2937] min-h-screen text-white">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Results Not Found</h2>
        <p className="text-gray-300 mb-6">We couldn't find your results for this exam.</p>
        <Link to="/exams">
          <Button className="mx-auto bg-pink-600 hover:bg-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Browse Exams
          </Button>
        </Link>
      </div>
    );
  }

  const percentageScore = Math.round((results.score / exam.totalMarks) * 100);

  return (
    <div className="bg-gradient-to-br from-[#0d1117] to-[#1f2937] min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link to="/exam-history" className="text-pink-400 hover:text-pink-300 flex items-center transition-colors">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Exam History</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold text-white">ExamFlow</span>
          </div>
        </div>
        
        {/* Results Summary */}
        {!showLeaderboard && (
        <div className="bg-[#1f2937] rounded-lg shadow-xl overflow-hidden border border-gray-700/50 animate-fade-in">
          <div className={`px-6 py-4 text-white ${results.passed ? 'bg-green-600/80' : 'bg-red-600/80'}`}>
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
            <h2 className="text-xl font-semibold text-white mb-4">{exam.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#111827] p-4 rounded-lg text-center border border-gray-700/30">
                <p className="text-sm text-gray-400 mb-1">Your Score</p>
                <p className="text-3xl font-bold text-pink-500">{results.score}/{exam.totalMarks}</p>
                <p className="text-lg font-medium text-gray-300">{percentageScore}%</p>
              </div>
              
              <div className="bg-[#111827] p-4 rounded-lg text-center border border-gray-700/30">
                <p className="text-sm text-gray-400 mb-1">Passing Score</p>
                <p className="text-3xl font-bold text-gray-300">{exam.passingScore}%</p>
                <p className="text-lg font-medium text-gray-400">Minimum Required</p>
              </div>
              
              <div className="bg-[#111827] p-4 rounded-lg text-center border border-gray-700/30">
                <p className="text-sm text-gray-400 mb-1">Time Taken</p>
                <p className="text-3xl font-bold text-gray-300">
                  {Math.floor(results.timeTaken / 60)}:{(results.timeTaken % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-lg font-medium text-gray-400">Minutes</p>
              </div>
            </div>
            
            {/* Certificate Download */}
            {results.passed && results.certificateGenerated && (
              <div className="bg-indigo-900/30 border border-indigo-700/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-pink-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-white">Certificate of Completion</h3>
                    <p className="text-sm text-gray-300">Your certificate is ready to download</p>
                  </div>
                </div>
                
                <a 
                  href={`https://examportal-i5j6.onrender.com${results.certificateUrl}`} 
                  target="_blank" 
                  download 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-md transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </a>
              </div>
            )}
            
            <div className="flex mt-6 justify-center">
              <Button  
                onClick={() => setShowLeaderboard(true)}  
                className="inline-flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
        )}

        {showLeaderboard && (
          <div className="mt-6 animate-fade-in">
            <Leaderboard exam={exam} onClose={() => setShowLeaderboard(false)} />
          </div>
        )}
        
        {/* Detailed Results */}
        {results.answers && (
          <div className="bg-[#1f2937] rounded-lg shadow-xl overflow-hidden border border-gray-700/50 animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white">Detailed Results</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {results.answers.map((answer, index) => (
                <div key={index} className="border-b border-gray-700/30 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-white">Question {index + 1}</h3>
                    <div className="flex items-center">
                      {answer.correct ? (
                        <span className="flex items-center text-green-400">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          Correct
                        </span>
                      ) : (
                        <span className="flex items-center text-red-400">
                          <XCircle className="h-5 w-5 mr-1" />
                          Incorrect
                        </span>
                      )}
                      <span className="ml-3 px-2 py-1 bg-[#111827] text-gray-300 rounded-full text-xs font-medium">
                        {answer.points} / {answer.maxPoints} points
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{answer.question.text}</p>
                  
                  {answer.question.type === 'MCQ' ? (
                    <div className="space-y-2">
                      {answer.question.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`p-3 rounded-md ${
                            option === answer.question.correctAnswer 
                              ? 'bg-green-900/30 border border-green-700/50' 
                              : option === answer.answer
                              ? answer.correct ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'
                              : 'bg-[#111827] border border-gray-700/30'
                          }`}
                        >
                          <span className={
                            option === answer.question.correctAnswer 
                              ? 'text-green-400' 
                              : option === answer.answer && !answer.correct
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }>
                            {option}
                            {option === answer.question.correctAnswer && ' ✓'}
                            {option === answer.answer && option !== answer.question.correctAnswer && ' ✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#111827] border border-gray-700/30 rounded-md">
                        <p className="text-sm font-medium text-gray-300 mb-2">Your Answer:</p>
                        <p className="text-gray-400">{answer.answer || '(No answer provided)'}</p>
                      </div>
                      
                      <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-md">
                        <p className="text-sm font-medium text-green-400 mb-2">Expected Answer:</p>
                        <p className="text-gray-300">{answer.question.correctAnswer}</p>
                      </div>
                      
                      {answer.feedback && (
                        <div className="p-4 bg-indigo-900/30 border border-indigo-700/50 rounded-md">
                          <p className="text-sm font-medium text-pink-400 mb-2">Examiner Feedback:</p>
                          <p className="text-gray-300">{answer.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 animate-fade-in delay-500">
          <p>© 2025 ExamFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

// Add custom animation styles if not already defined in your project
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s forwards;
  }
  
  .animate-fade-up {
    animation: fade-up 0.4s forwards;
  }
  
  .delay-200 {
    animation-delay: 0.2s;
  }
  
  .delay-300 {
    animation-delay: 0.3s;
  }
  
  .delay-500 {
    animation-delay: 0.5s;
  }
`;
document.head.appendChild(styleElement);

export default ExamResults;