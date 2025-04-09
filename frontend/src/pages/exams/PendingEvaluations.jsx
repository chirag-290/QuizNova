import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { examAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const PendingEvaluations = () => {
  const [pendingExams, setPendingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPendingEvaluations = async () => {
      setLoading(true);
      try {
        const res = await examAPI.getPendingEvaluations();
        if (res.data.success) {
          setPendingExams(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching pending evaluations:', error);
        toast.error('Failed to load pending evaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEvaluations();
  }, []);

  // Filter exams based on search term
  const filteredExams = pendingExams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Spinner size="large" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Pending Evaluations</h1>
      
      {/* Search */}
      <div className="relative max-w-md">
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
      
      {/* Exams with Pending Evaluations */}
      {filteredExams.length > 0 ? (
        <div className="space-y-6">
          {filteredExams.map(exam => (
            <Card 
              key={exam.examId}
              title={exam.title}
              subtitle={`${exam.pendingSubmissions.length} pending submission(s)`}
            >
              <div className="space-y-4">
                {exam.pendingSubmissions.map(submission => (
                  <div key={submission.submissionId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">{submission.student.name}</h3>
                      <p className="text-sm text-gray-500">{submission.student.email}</p>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <Link to={`/exams/${exam.examId}/evaluate/${submission.submissionId}`}>
                      <Button size="small" className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Evaluate
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Evaluations</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No exams match your search for "${searchTerm}"`
              : 'All submissions have been evaluated. Great job!'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default PendingEvaluations;