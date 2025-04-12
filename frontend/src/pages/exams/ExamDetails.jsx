import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, Award, Edit, Trash2, AlertTriangle, ArrowLeft, View } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { examAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ViewSubmissions from './ViewSubmissions';

const ExamDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [showSubmission, setSubmission] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await examAPI.getExam(id);
        if (res.data.success) {
          setExam(res.data.data);

          if (user.role === 'Student' && user.examHistory) {
            const attempted = user.examHistory.some(item => item.exam === id);
            setHasAttempted(attempted);
          }
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Failed to load exam details');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await examAPI.deleteExam(id);
      if (res.data.success) {
        toast.success('Exam deleted successfully');
        navigate('/exams');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner size="large" />;

  if (!exam) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Not Found</h2>
        <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist or has been removed.</p>
        <Link to="/exams">
          <Button className="flex items-center mx-auto">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Exams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSubmission ? (

        <ViewSubmissions
          exam={exam}
          onBack={() => setSubmission(false)}
        />
        // Only show submissions when showSubmission is true
        
      ) : (
        // Show the full exam details when submissions are not being shown
        <>
          <div className="flex items-center justify-between">
            <Link to="/exams" className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to Exams</span>
            </Link>
            {(user.role === 'Admin' ||
              (user.role === 'Examiner' && exam.createdBy?._id === user._id)) && (
              <div className="flex space-x-3">
                <Link to={`/exams/${id}/edit`}>
                  <Button variant="outline" className="flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Exam
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  className="flex items-center"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Spinner size="small" />
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSubmission(true)}
                  variant="outline"
                  className="flex items-center"
                >
                  View Submissions
                </Button>
              </div>
            )}
          </div>
  
          {/* Exam Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              {exam.createdBy && (
                <p className="text-indigo-100">Created by: {exam.createdBy.name}</p>
              )}
            </div>
  
            <div className="p-6">
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">
                    Duration: <strong>{exam.duration} minutes</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">
                    Passing Score: <strong>{exam.passingScore}%</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">
                    Total Questions: <strong>{exam.questions?.length || 0}</strong>
                  </span>
                </div>
              </div>
  
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">
                  {exam.description || 'No description provided.'}
                </p>
              </div>
  
              {user.role === 'Student' && (
                <div className="border-t pt-6">
                  {hasAttempted ? (
                    <div className="flex flex-col items-center">
                      <p className="text-gray-600 mb-4">You have already taken this exam.</p>
                      <Link to={`/exams/${id}/results`}>
                        <Button>View Results</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="text-gray-600 mb-4">
                        Ready to take this exam? Make sure you have {exam.duration} minutes available.
                      </p>
                      <Link to={`/exams/${id}/take`}>
                        <Button size="large">Start Exam</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
  
          {(user.role === 'Admin' || user.role === 'Examiner') && exam.questions && (
            <Card title="Questions Preview">
              <div className="space-y-4">
                {exam.questions.map((question, index) => (
                  <div key={question._id} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.difficulty === 'Easy'
                              ? 'bg-green-100 text-green-800'
                              : question.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {question.difficulty}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            question.type === 'MCQ'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {question.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {question.marks} {question.marks === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{question.text}</p>
  
                    {question.type === 'MCQ' && question.options && (
                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-md ${
                              option === question.correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span
                              className={
                                option === question.correctAnswer
                                  ? 'text-green-700'
                                  : 'text-gray-700'
                              }
                            >
                              {option}
                              {option === question.correctAnswer && ' ✓'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
  
                    {question.type === 'Subjective' && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 italic">
                          This is a subjective question that requires manual evaluation.
                        </p>
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm font-medium text-green-700">
                            Expected Answer:
                          </p>
                          <p className="text-gray-700">{question.correctAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
  
};

export default ExamDetails;
