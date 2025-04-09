import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Filter, Plus, BookOpen } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { examAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const ExamList = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');  

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await examAPI.getAllExams();
        if (res.data.success) {
          setExams(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

   
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && exam.isActive;
    if (filter === 'completed') return matchesSearch && !exam.isActive;
    
    return matchesSearch;
  });

  if (loading) {
    return <Spinner size="large" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Exams</h1>
        
        {/* Create Exam Button (Admin & Examiner only) */}
        {(user.role === 'Admin' || user.role === 'Examiner') && (
          <Link to="/exams/create">
            <Button className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Exam
            </Button>
          </Link>
        )}
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exams..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Exams</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {/* Exams List */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <Card 
              key={exam._id}
              title={exam.title}
              subtitle={`Duration: ${exam.duration} minutes`}
              footer={
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Passing: {exam.passingScore}%
                  </span>
                  <Link to={`/exams/${exam._id}`}>
                    <Button size="small">View Details</Button>
                  </Link>
                </div>
              }
            >
              <p className="text-gray-600 line-clamp-3">{exam.description || 'No description provided.'}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Created: {new Date(exam.createdAt).toLocaleDateString()}</span>
                </div>
                
                {exam.isActive ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Exams Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? `No exams match your search for "${searchTerm}"`
              : 'There are no exams available at the moment.'}
          </p>
          
          {(user.role === 'Admin' || user.role === 'Examiner') && (
            <Link to="/exams/create">
              <Button>Create New Exam</Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  );
};

export default ExamList;