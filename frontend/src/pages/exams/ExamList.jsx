import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Filter, Plus, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#1f2937]">
        <Spinner size="large" className="text-pink-500" />
      </div>
    );
  }

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="relative py-16 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[3rem] shadow-xl mb-12">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Exams</h1>
            <p className="text-lg text-gray-300 mb-6 max-w-3xl">
              {user.role === 'Student' ? 'Browse and take exams to earn certificates' : 'Manage and create exams for students'}
            </p>
          </div>
          
          {/* Create Exam Button (Admin & Examiner only) */}
          {(user.role === 'Admin' || user.role === 'Examiner') && (
            <Link to="/exams/create">
              <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create Exam
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6 max-w-6xl mx-auto space-y-8">
        {/* Stats Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, label: 'Total Exams', value: exams.length, color: 'indigo' },
              { icon: CheckCircle, label: 'Active Exams', value: exams.filter(exam => exam.isActive).length, color: 'green' },
              { icon: AlertTriangle, label: 'Inactive Exams', value: exams.filter(exam => !exam.isActive).length, color: 'pink' },
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-[#1e293b] p-6 rounded-2xl transform hover:-translate-y-1 transition duration-300 shadow-lg hover:shadow-xl border-l-4 border-${stat.color}-500 animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full bg-${stat.color}-900/50 mr-4`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search exams..."
                className="pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-white appearance-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Exams</option>
                <option value="active">Active</option>
                <option value="completed">Inactive</option>
              </select>
            </div>
          </div>
        </section>
        
        {/* Exams List */}
        <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-8">Available Exams</h2>
          
          {filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map(exam => (
                <div
                  key={exam._id}
                  className="bg-[#0f172a] rounded-2xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-pink-500/20"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{exam.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{exam.description || 'No description available.'}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{exam.duration} mins</span>
                      <span className="mx-2">•</span>
                      <span>Pass: {exam.passingScore}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      {exam.isActive ? (
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-800/50 text-gray-400 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                      
                      <Link to={`/exams/${exam._id}`}>
                        <Button size="small" className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Exams Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? `No exams match your search for "${searchTerm}"`
                  : 'There are no exams available at the moment.'}
              </p>
              
              {(user.role === 'Admin' || user.role === 'Examiner') && (
                <Link to="/exams/create">
                  <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
                    Create New Exam
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ExamList;