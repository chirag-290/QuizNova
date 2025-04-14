import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, Award, Edit, Trash2, AlertTriangle, ArrowLeft, View, FileText, CheckCircle, XCircle } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#1f2937]">
        <Spinner size="large" className="text-pink-500" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white p-8">
        <div className="max-w-4xl mx-auto text-center py-20 bg-[#1f2937] rounded-3xl shadow-xl px-6">
          <AlertTriangle className="h-16 w-16 text-pink-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Exam Not Found</h2>
          <p className="text-gray-400 mb-8 text-lg">The exam you're looking for doesn't exist or has been removed.</p>
          <Link to="/exams">
            <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white flex items-center justify-center mx-auto">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Exams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white p-4 sm:p-8 animate-fade-in">
      {showSubmission ? (
        <ViewSubmissions
          exam={exam}
          onBack={() => setSubmission(false)}
        />
      ) : (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link to="/exams" className="text-indigo-400 hover:text-indigo-300 flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back to Exams</span>
            </Link>
            {(user.role === 'Admin' ||
              (user.role === 'Examiner' && exam.createdBy?._id === user._id)) && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setSubmission(true)}
                  className="bg-indigo-800 hover:bg-indigo-700 text-white flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  View Submissions
                </Button>
                <Link to={`/exams/${id}/edit`}>
                  <Button className="bg-[#1e293b] border border-indigo-500 text-indigo-400 hover:bg-indigo-900/30 flex items-center">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Exam
                  </Button>
                </Link>
                <Button
                  className="bg-red-900/50 hover:bg-red-800 text-red-400 flex items-center"
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
              </div>
            )}
          </div>

          {/* Exam Header */}
          <div className="relative overflow-hidden bg-[#1f2937] rounded-3xl shadow-xl">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full"></div>
            <div className="relative z-10 p-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                {exam.title}
              </h1>
              {exam.createdBy && (
                <p className="text-gray-400 mb-6">Created by: {exam.createdBy.name}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#0f172a] p-4 rounded-xl flex items-center">
                  <div className="bg-indigo-900/50 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-xl font-semibold text-white">{exam.duration} minutes</p>
                  </div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl flex items-center">
                  <div className="bg-pink-900/50 p-3 rounded-full mr-4">
                    <Award className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Passing Score</p>
                    <p className="text-xl font-semibold text-white">{exam.passingScore}%</p>
                  </div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl flex items-center">
                  <div className="bg-purple-900/50 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Questions</p>
                    <p className="text-xl font-semibold text-white">{exam.questions?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-gray-300 bg-[#0f172a] p-6 rounded-xl">
                  {exam.description || 'No description provided.'}
                </p>
              </div>

              {user.role === 'Student' && (
                <div className="bg-[#0f172a] p-6 rounded-xl text-center">
                  {hasAttempted ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-green-900/30 p-4 rounded-full">
                          <CheckCircle className="h-12 w-12 text-green-400" />
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">You have already taken this exam.</p>
                      <Link to={`/exams/${id}/results`}>
                        <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
                          View Your Results
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-indigo-900/30 p-4 rounded-full">
                          <FileText className="h-12 w-12 text-indigo-400" />
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Ready to take this exam? Make sure you have {exam.duration} minutes available.
                      </p>
                      <Link to={`/exams/${id}/take`}>
                        <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white px-8 py-3">
                          Start Exam
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Questions Preview for Admin/Examiner */}
          {(user.role === 'Admin' || user.role === 'Examiner') && exam.questions && (
            <div className="bg-[#1f2937] rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Questions Preview</h2>
              <div className="space-y-6">
                {exam.questions.map((question, index) => (
                  <div key={question._id} className="bg-[#0f172a] rounded-xl p-6 border border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                      <h4 className="text-lg font-medium">Question {index + 1}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            question.difficulty === 'Easy'
                              ? 'bg-green-900/50 text-green-400'
                              : question.difficulty === 'Medium'
                              ? 'bg-yellow-900/50 text-yellow-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {question.difficulty}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            question.type === 'MCQ'
                              ? 'bg-blue-900/50 text-blue-400'
                              : 'bg-purple-900/50 text-purple-400'
                          }`}
                        >
                          {question.type}
                        </span>
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                          {question.marks} {question.marks === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                    </div>
  
                    <p className="text-gray-200 mb-4 border-l-4 border-indigo-500 pl-4 py-1">{question.text}</p>
  
                    {question.type === 'MCQ' && question.options && (
                      <div className="space-y-2 mt-4">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg flex items-center ${
                              option === question.correctAnswer
                                ? 'bg-green-900/30 border border-green-700'
                                : 'bg-gray-800/50 border border-gray-700'
                            }`}
                          >
                            {option === question.correctAnswer ? (
                              <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                            )}
                            <span
                              className={
                                option === question.correctAnswer
                                  ? 'text-green-400'
                                  : 'text-gray-300'
                              }
                            >
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
  
                    {question.type === 'Subjective' && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 italic mb-3">
                          This is a subjective question that requires manual evaluation.
                        </p>
                        <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                          <p className="text-sm font-medium text-green-400 mb-2">
                            Expected Answer:
                          </p>
                          <p className="text-gray-200">{question.correctAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamDetails;