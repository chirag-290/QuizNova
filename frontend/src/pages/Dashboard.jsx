import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { examAPI, userAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    examsTaken: 0,
    examsPassed: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const examsRes = await examAPI.getAllExams();
        if (examsRes.data.success) {
          setExams(examsRes.data.data.slice(0, 5));
          setStats((prev) => ({ ...prev, totalExams: examsRes.data.count }));
        }

        if (user.role === 'Student') {
          const historyRes = await userAPI.getUserExamHistory();
          if (historyRes.data.success) {
            setExamHistory(historyRes.data.data.slice(0, 5));
            const passed = historyRes.data.data.filter((item) => item.passed).length;
            setStats((prev) => ({
              ...prev,
              examsTaken: historyRes.data.data.length,
              examsPassed: passed,
            }));
          }
        }

        if (user.role === 'Examiner' || user.role === 'Admin') {
          const evalRes = await examAPI.getPendingEvaluations();
          if (evalRes.data.success) {
            setPendingEvaluations(evalRes.data.data);
            let pendingCount = 0;
            evalRes.data.data.forEach((exam) => {
              pendingCount += exam.pendingSubmissions.length;
            });
            setStats((prev) => ({ ...prev, pendingCount }));
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg transform hover:scale-[1.01] transition-all duration-300">
        <h2 className="text-3xl font-semibold mb-3 animate-fade-up">Hello, {user.name}!</h2>
        <p className="text-lg leading-relaxed opacity-90 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {user.role === 'Student' && 'Explore exams, track your progress, and earn certificates.'}
          {user.role === 'Examiner' && 'Craft exams, evaluate submissions, and manage your questions.'}
          {user.role === 'Admin' && 'Oversee users, exams, and system performance with ease.'}
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: BookOpen, label: 'Total Exams', value: stats.totalExams, color: 'blue' },
          user.role === 'Student'
            ? { icon: CheckCircle, label: 'Exams Taken', value: stats.examsTaken, color: 'green' }
            : { icon: Clock, label: 'Pending Evaluations', value: stats.pendingCount, color: 'yellow' },
          user.role === 'Student'
            ? { icon: Award, label: 'Exams Passed', value: stats.examsPassed, color: 'purple' }
            : { icon: AlertTriangle, label: 'Success Rate', value: stats.examsTaken > 0 ? `${Math.round((stats.examsPassed / stats.examsTaken) * 100)}%` : 'N/A', color: 'purple' },
          user.role === 'Admin'
            ? { icon: Users, label: 'Total Users', value: '-', color: 'indigo' }
            : { icon: Award, label: 'Certificates', value: examHistory?.filter((exam) => exam.certificateGenerated).length || 0, color: 'indigo' },
        ].map((stat, index) => (
          <Card
            key={index}
            className={`bg-${stat.color}-50 border-l-4 border-${stat.color}-500 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full bg-${stat.color}-100 mr-4`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className={`text-sm text-${stat.color}-600 font-medium`}>{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Exams Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 animate-fade-up">
            {user.role === 'Student' ? 'Available Exams' : 'Recent Exams'}
          </h2>
          <Link to="/exams">
            <Button variant="outline" size="small" className="hover:bg-indigo-50 transition-colors duration-200">
              View All
            </Button>
          </Link>
        </div>
        {exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card
                key={exam._id}
                title={<span className="text-lg font-semibold text-gray-900">{exam.title}</span>}
                subtitle={<span className="text-sm text-gray-500">Duration: {exam.duration} mins</span>}
                footer={
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Passing: {exam.passingScore}%</span>
                    <Link to={`/exams/${exam._id}`}>
                      <Button size="small" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Details
                      </Button>
                    </Link>
                  </div>
                }
                className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <p className="text-gray-600 line-clamp-2 mb-4">{exam.description || 'No description available.'}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Created: {new Date(exam.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {user.role === 'Student' ? 'No exams available yet.' : 'No exams created yet.'}
            </p>
            {(user.role === 'Admin' || user.role === 'Examiner') && (
              <Link to="/exams/create">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Exam</Button>
              </Link>
            )}
          </Card>
        )}
      </div>

      {/* Exam History (Students) */}
      {user.role === 'Student' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 animate-fade-up">Recent Exam History</h2>
            <Link to="/exam-history">
              <Button variant="outline" size="small" className="hover:bg-indigo-50 transition-colors duration-200">
                View All
              </Button>
            </Link>
          </div>
          {examHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-xl shadow-md">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    {['Exam', 'Score', 'Status', 'Date', 'Certificate'].map((header) => (
                      <th key={header} className="py-3 px-6 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {examHistory.map((item) => (
                    <tr key={item.exam._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <Link to={`/exams/${item.exam._id}/results`} className="text-indigo-600 hover:text-indigo-800">
                          {item.exam.title}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        {item.score}/{item.exam.totalMarks} ({Math.round((item.score / item.exam.totalMarks) * 100)}%)
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-4 px-6">{new Date(item.submittedAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        {item.certificateGenerated ? (
                          <a
                            href={item.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven’t taken any exams yet.</p>
              <Link to="/exams">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Browse Exams</Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {/* Pending Evaluations (Examiners & Admins) */}
      {(user.role === 'Examiner' || user.role === 'Admin') && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 animate-fade-up">Pending Evaluations</h2>
            <Link to="/evaluations">
              <Button variant="outline" size="small" className="hover:bg-indigo-50 transition-colors duration-200">
                View All
              </Button>
            </Link>
          </div>
          {pendingEvaluations.length > 0 ? (
            <div className="space-y-6">
              {pendingEvaluations.map((exam) => (
                <Card
                  key={exam.examId}
                  title={<span className="text-lg font-semibold text-gray-900">{exam.title}</span>}
                  subtitle={<span className="text-sm text-gray-500">{exam.pendingSubmissions.length} pending</span>}
                  className="hover:shadow-xl transition-all duration-300"
                >
                  <div className="space-y-4">
                    {exam.pendingSubmissions.slice(0, 3).map((submission) => (
                      <div
                        key={submission.submissionId}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{submission.student.name}</p>
                          <p className="text-sm text-gray-500">{submission.student.email}</p>
                          <p className="text-xs text-gray-400">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Link to={`/exams/${exam.examId}/evaluate/${submission.submissionId}`}>
                          <Button size="small" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Evaluate
                          </Button>
                        </Link>
                      </div>
                    ))}
                    {exam.pendingSubmissions.length > 3 && (
                      <p className="text-center text-sm text-gray-500">
                        +{exam.pendingSubmissions.length - 3} more submissions
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">No pending evaluations at this time.</p>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 animate-fade-up">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user.role === 'Student' ? (
            [
              { to: '/exams', icon: BookOpen, label: 'Browse Exams', variant: 'primary' },
              { to: '/exam-history', icon: Clock, label: 'Exam History', variant: 'outline' },
              { to: '/profile', icon: Users, label: 'Update Profile', variant: 'secondary' },
            ].map((action, index) => (
              <Link key={index} to={action.to}>
                <Button
                  variant={action.variant}
                  fullWidth
                  className="flex items-center justify-center py-3 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <action.icon className="h-5 w-5 mr-2" />
                  {action.label}
                </Button>
              </Link>
            ))
          ) : (
            [
              { to: '/exams/create', icon: BookOpen, label: 'Create Exam', variant: 'primary' },
              { to: '/questions/create', icon: Clock, label: 'Add Question', variant: 'outline' },
              { to: '/evaluations', icon: CheckCircle, label: 'Evaluate', variant: 'secondary' },
            ].map((action, index) => (
              <Link key={index} to={action.to}>
                <Button
                  variant={action.variant}
                  fullWidth
                  className="flex items-center justify-center py-3 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <action.icon className="h-5 w-5 mr-2" />
                  {action.label}
                </Button>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;