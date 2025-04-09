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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
        <Link to="/questions/create">
          <Button className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Question
          </Button>
        </Link>
      </div>
      
       
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
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
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="Subjective">Subjective</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              
              <Button type="submit">
                Filter
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      
      {loading ? (
        <Spinner size="large" />
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map(question => (
            <Card key={question._id}>
              <div className="flex justify-between">
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
                  
                  <p className="text-gray-800 mb-3">{question.text}</p>
                  
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
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Link to={`/questions/${question._id}/edit`}>
                    <Button variant="outline" size="small" className="flex items-center">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="small" 
                    className="flex items-center"
                    onClick={() => handleDelete(question._id)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={pagination.page === i + 1 ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Questions Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filters.type || filters.difficulty
              ? 'No questions match your search criteria.'
              : 'Your question bank is empty. Start by adding some questions.'}
          </p>
          <Link to="/questions/create">
            <Button>Add Your First Question</Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default QuestionBank;