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
    return <Spinner size="large" />;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/exams/${id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Exam Details</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800">Edit Exam</h1>
      
      {hasSubmissions && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Warning:</span> This exam has submissions. Some changes may be restricted.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Exam Details">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    placeholder="e.g., Introduction to JavaScript"
                    {...register('title', {
                      required: 'Title is required'
                    })}
                    disabled={hasSubmissions}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Provide a description of the exam..."
                    {...register('description')}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min="1"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
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
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%) *
                  </label>
                  <input
                    id="passingScore"
                    type="number"
                    min="1"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.passingScore ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
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
                    <p className="mt-1 text-sm text-red-600">{errors.passingScore.message}</p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    {...register('isActive')}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Make exam active
                  </label>
                </div>
              </div>
            </Card>
            
            <Card title="Selected Questions" subtitle={`Total: ${selectedQuestions.length} (${totalMarks} points)`}>
              {selectedQuestions.length > 0 ? (
                <div className="space-y-3">
                  {selectedQuestions.map((question, index) => (
                    <div key={question._id} className="flex justify-between items-start p-3 bg-gray-50 rounded-md">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 mr-2">Q{index + 1}.</span>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {question.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {question.marks} pts
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{question.text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question._id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        disabled={hasSubmissions}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No questions selected. Add questions from the panel on the right.
                </p>
              )}
            </Card>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || (hasSubmissions && selectedQuestions.length !== exam.questions.length)}
                className="w-full"
              >
                {submitting ? <Spinner size="small" /> : 'Update Exam'}
              </Button>
            </div>
          </div>
          
          {/* Question Selection */}
          <div className="lg:col-span-2">
            <Card title="Add Questions">
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search questions..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={filter.type}
                      onChange={(e) => setFilter({...filter, type: e.target.value})}
                    >
                      <option value="">All Types</option>
                      <option value="MCQ">MCQ</option>
                      <option value="Subjective">Subjective</option>
                    </select>
                    
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                
                {/* Questions List */}
                {loading ? (
                  <Spinner />
                ) : filteredQuestions.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredQuestions.map(question => (
                      <div key={question._id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.type === 'MCQ' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {question.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {question.difficulty}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                {question.marks} points
                              </span>
                            </div>
                            <p className="text-gray-800 mb-2">{question.text}</p>
                            
                            {question.type === 'MCQ' && (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm font-medium text-gray-700">Options:</p>
                                <ul className="text-sm text-gray-600 pl-5 list-disc">
                                  {question.options.map((option, index) => (
                                    <li key={index} className={option === question.correctAnswer ? 'font-medium text-green-600' : ''}>
                                      {option} {option === question.correctAnswer && '✓'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {question.type === 'Subjective' && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Expected Answer:</p>
                                <p className="text-sm text-gray-600 italic">{question.correctAnswer}</p>
                              </div>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => addQuestion(question)}
                            className={`ml-4 p-2 rounded-full ${
                              selectedQuestions.some(q => q._id === question._id)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
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
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No questions found matching your criteria.</p>
                    <Link to="/questions/create">
                      <Button>Create New Question</Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditExam;