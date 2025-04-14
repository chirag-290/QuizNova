import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { questionAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    difficulty: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const res = await questionAPI.getAllQuestions(params);
      if (res.data.success) {
        setQuestions(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.count
        }));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const res = await questionAPI.deleteQuestion(id);
      if (res.data.success) {
        toast.success('Question deleted successfully');
        // Refresh questions
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="relative py-12 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[3rem] shadow-xl mb-12">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Question Bank</h1>
            <p className="text-lg text-gray-300 max-w-3xl">
              Browse, search, and manage your exam questions.
            </p>
          </div>
          <Link to="/questions/create">
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-pink-500/20 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Question
            </button>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6 max-w-6xl mx-auto">
        {/* Search & Filter Section */}
        <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
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
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="MCQ">MCQ</option>
                    <option value="Subjective">Subjective</option>
                  </select>
                  
                  <select
                    className="px-4 py-3 rounded-xl bg-[#1e293b] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition duration-300 shadow-lg flex items-center"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Questions List Section */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="large" />
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="space-y-6">
            {filteredQuestions.map(question => (
              <div key={question._id} className="bg-[#1f2937] rounded-3xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
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
                      <span className="px-3 py-1 bg-gray-800/70 text-gray-300 rounded-full text-xs font-medium">
                        {question.marks} points
                      </span>
                    </div>
                    
                    <div className="bg-[#0f172a] rounded-2xl p-5 mb-5">
                      <p className="text-gray-200">{question.text}</p>
                    </div>
                    
                    {question.type === 'MCQ' && (
                      <div className="bg-[#0f172a] rounded-2xl p-5">
                        <p className="text-sm font-medium text-gray-400 mb-3">Options:</p>
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
                      <div className="bg-[#0f172a] rounded-2xl p-5">
                        <p className="text-sm font-medium text-gray-400 mb-2">Expected Answer:</p>
                        <p className="text-sm text-gray-300 italic">{question.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col items-center justify-start mt-6 md:mt-0 md:ml-6 space-x-3 md:space-x-0 md:space-y-3">
                    <Link to={`/questions/${question._id}/edit`} className="w-full">
                      <button className="w-full px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-medium rounded-xl transition duration-200 flex items-center justify-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    </Link>
                    <button 
                      className="w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 font-medium rounded-xl transition duration-200 flex items-center justify-center"
                      onClick={() => handleDelete(question._id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="bg-[#1f2937] rounded-2xl p-2 inline-flex">
                  <button
                    className={`px-4 py-2 rounded-xl font-medium transition duration-200 ${
                      pagination.page === 1 
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-white hover:bg-[#0f172a]'
                    }`}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`px-4 py-2 rounded-xl font-medium transition duration-200 ${
                        pagination.page === i + 1 
                          ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white'
                          : 'text-white hover:bg-[#0f172a]'
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    className={`px-4 py-2 rounded-xl font-medium transition duration-200 ${
                      pagination.page === totalPages 
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-white hover:bg-[#0f172a]'
                    }`}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1f2937] rounded-3xl p-10 shadow-xl text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No Questions Found</h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              {searchTerm || filters.type || filters.difficulty
                ? 'No questions match your search criteria. Try adjusting your filters.'
                : 'Your question bank is empty. Start by adding some questions to build your collection.'}
            </p>
            <Link to="/questions/create">
              <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-pink-500/20">
                Add Your First Question
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;