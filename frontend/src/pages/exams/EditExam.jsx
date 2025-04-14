import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, ArrowLeft, Search, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { examAPI, questionAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const EditExam = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    difficulty: ''
  });
  const [hasSubmissions, setHasSubmissions] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const examRes = await examAPI.getExam(id);
        if (examRes.data.success) {
          setExam(examRes.data.data);
          setHasSubmissions(examRes.data.data.hasSubmissions || false);
          
          reset({
            title: examRes.data.data.title,
            description: examRes.data.data.description || '',
            duration: examRes.data.data.duration,
            passingScore: examRes.data.data.passingScore,
            isActive: examRes.data.data.isActive || false
          });
          
          if (examRes.data.data.questions) {
            setSelectedQuestions(examRes.data.data.questions);
          }
        }
        
        const questionsRes = await questionAPI.getAllQuestions();
        if (questionsRes.data.success) {
          setQuestions(questionsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);
  
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter.type ? question.type === filter.type : true;
    const matchesDifficulty = filter.difficulty ? question.difficulty === filter.difficulty : true;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });
  
  const addQuestion = (question) => {
    if (!selectedQuestions.some(q => q._id === question._id)) {
      setSelectedQuestions([...selectedQuestions, question]);
    } else {
      toast.info('This question is already added to the exam');
    }
  };
  
  const removeQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter(q => q._id !== questionId));
  };
  
  const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
  
  const onSubmit = async (data) => {
    if (selectedQuestions.length === 0) {
      toast.error('Please add at least one question to the exam');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const examData = {
        ...data,
        questions: selectedQuestions.map(q => q._id)
      };
      
      const res = await examAPI.updateExam(id, examData);
      
      if (res.data.success) {
        toast.success('Exam updated successfully!');
        navigate(`/exams/${id}`);
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="large" />
      </div>
    );
  }
  
  if (!exam) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Not Found</h2>
        <p className="text-gray-600 mb-6">The exam you're trying to edit doesn't exist or has been removed.</p>
        <Link to="/exams">
          <Button className="mx-auto">
            Back to Exams
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="relative py-12 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[3rem] shadow-xl mb-12">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link to={`/exams/${id}`} className="text-indigo-400 hover:text-indigo-300 flex items-center mb-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Exam Details</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Edit Exam</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Update your exam details and manage questions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6 max-w-6xl mx-auto">
        {hasSubmissions && (
          <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded-xl mb-8">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-yellow-300">
                  <span className="font-bold">Warning:</span> This exam has submissions. Some changes may be restricted.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Exam Details */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-8">Exam Details</h2>
                
                <div className="space-y-6">
                  <div className="bg-[#0f172a] rounded-2xl p-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                      Exam Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      className={`w-full px-4 py-3 rounded-xl bg-[#1e293b] border ${
                        errors.title ? 'border-red-500' : 'border-gray-700'
                      } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="e.g., Introduction to JavaScript"
                      {...register('title', {
                        required: 'Title is required'
                      })}
                      disabled={hasSubmissions}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="bg-[#0f172a] rounded-2xl p-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Provide a description of the exam..."
                      {...register('description')}
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0f172a] rounded-2xl p-6">
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        id="duration"
                        type="number"
                        min="1"
                        className={`w-full px-4 py-3 rounded-xl bg-[#1e293b] border ${
                          errors.duration ? 'border-red-500' : 'border-gray-700'
                        } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        placeholder="e.g., 60"
                        {...register('duration', {
                          required: 'Duration is required',
                          min: {
                            value: 1,
                            message: 'Duration must be at least 1 minute'
                          }
                        })}
                        disabled={hasSubmissions}
                      />
                      {errors.duration && (
                        <p className="mt-2 text-sm text-red-400">{errors.duration.message}</p>
                      )}
                    </div>
                    
                    <div className="bg-[#0f172a] rounded-2xl p-6">
                      <label htmlFor="passingScore" className="block text-sm font-medium text-gray-300 mb-2">
                        Passing Score (%) *
                      </label>
                      <input
                        id="passingScore"
                        type="number"
                        min="1"
                        max="100"
                        className={`w-full px-4 py-3 rounded-xl bg-[#1e293b] border ${
                          errors.passingScore ? 'border-red-500' : 'border-gray-700'
                        } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        placeholder="e.g., 70"
                        {...register('passingScore', {
                          required: 'Passing score is required',
                          min: {
                            value: 1,
                            message: 'Passing score must be at least 1%'
                          },
                          max: {
                            value: 100,
                            message: 'Passing score cannot exceed 100%'
                          }
                        })}
                      />
                      {errors.passingScore && (
                        <p className="mt-2 text-sm text-red-400">{errors.passingScore.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-[#0f172a] rounded-2xl p-6 flex items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded"
                      {...register('isActive')}
                    />
                    <label htmlFor="isActive" className="ml-3 block text-gray-300">
                      Make exam active
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Selected Questions</h2>
                  <div className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-lg text-sm">
                    Total: {selectedQuestions.length} <span className="mx-1">|</span> {totalMarks} pts
                  </div>
                </div>
                
                {selectedQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedQuestions.map((question, index) => (
                      <div key={question._id} className="bg-[#0f172a] rounded-2xl p-4 hover:bg-[#172135] transition-colors duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-medium text-gray-200 mr-1">Q{index + 1}.</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                question.type === 'MCQ' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                              }`}>
                                {question.type}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                question.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300' :
                                question.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                                'bg-red-900/50 text-red-300'
                              }`}>
                                {question.difficulty}
                              </span>
                              <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                                {question.marks} pts
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{question.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestion(question._id)}
                            className="ml-3 p-2 rounded-full bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors duration-200"
                            disabled={hasSubmissions}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
                    <p className="text-gray-400">
                      No questions selected. Add questions from the panel on the right.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={submitting || (hasSubmissions && selectedQuestions.length !== exam.questions.length)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-pink-500/20 flex items-center justify-center min-w-[200px] w-full"
                >
                  {submitting ? <Spinner size="small" /> : 'Update Exam'}
                </button>
              </div>
            </div>
            
            {/* Question Selection */}
            <div className="lg:col-span-2">
              <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-8">Add Questions</h2>
                
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="bg-[#0f172a] rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search questions..."
                          className="pl-12 pr-4 py-3 rounded-xl w-full bg-[#1e293b] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <select
                          className="px-4 py-3 rounded-xl bg-[#1e293b] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          value={filter.type}
                          onChange={(e) => setFilter({...filter, type: e.target.value})}
                        >
                          <option value="">All Types</option>
                          <option value="MCQ">MCQ</option>
                          <option value="Subjective">Subjective</option>
                        </select>
                        
                        <select
                          className="px-4 py-3 rounded-xl bg-[#1e293b] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          value={filter.difficulty}
                          onChange={(e) => setFilter({...filter, difficulty: e.target.value})}
                        >
                          <option value="">All Difficulties</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Questions List */}
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Spinner size="large" />
                    </div>
                  ) : filteredQuestions.length > 0 ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-gray-800">
                      {filteredQuestions.map(question => (
                        <div key={question._id} className="bg-[#0f172a] rounded-2xl p-6 hover:bg-[#172135] transition-colors duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-grow">
                              <div className="flex items-center flex-wrap gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  question.type === 'MCQ' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                                }`}>
                                  {question.type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  question.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300' :
                                  question.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                                  'bg-red-900/50 text-red-300'
                                }`}>
                                  {question.difficulty}
                                </span>
                                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium">
                                  {question.marks} pts
                                </span>
                              </div>
                              
                              <div className="bg-[#1e293b] rounded-xl p-4 mb-4">
                                <p className="text-gray-200">{question.text}</p>
                              </div>
                              
                              {question.type === 'MCQ' && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-400 mb-2">Options:</p>
                                  <div className="space-y-2">
                                    {question.options.map((option, index) => (
                                      <div key={index} className={`flex items-center px-4 py-2 rounded-xl ${option === question.correctAnswer ? 'bg-green-900/30 border border-green-800' : 'bg-[#1e293b]'}`}>
                                        <div className={`w-3 h-3 rounded-full mr-3 ${option === question.correctAnswer ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <p className={`text-sm ${option === question.correctAnswer ? 'text-green-300 font-medium' : 'text-gray-300'}`}>
                                          {option}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {question.type === 'Subjective' && (
                                <div>
                                  <p className="text-sm font-medium text-gray-400 mb-2">Expected Answer:</p>
                                  <div className="bg-[#1e293b] rounded-xl p-4">
                                    <p className="text-sm text-gray-300 italic">{question.correctAnswer}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => addQuestion(question)}
                              className={`ml-4 p-3 rounded-full transition-colors duration-200 ${
                                selectedQuestions.some(q => q._id === question._id)
                                  ? 'bg-green-900/50 text-green-300 cursor-not-allowed'
                                  : 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/70'
                              }`}
                              disabled={selectedQuestions.some(q => q._id === question._id) || hasSubmissions}
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0f172a] rounded-2xl p-12 text-center">
                      <p className="text-gray-400 mb-6">No questions found matching your criteria.</p>
                      <Link to="/questions/create">
                        <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-pink-500/20">
                          Create New Question
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExam;