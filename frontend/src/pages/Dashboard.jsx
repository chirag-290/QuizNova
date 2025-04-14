import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, CheckCircle, AlertTriangle, Users, Rocket, Brain, Globe } from 'lucide-react';
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
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Welcome, {user.name}!</h1>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl">
            {user.role === 'Student' && 'Track your progress, explore new exams, and manage your certification journey.'}
            {user.role === 'Examiner' && 'Create exams, evaluate submissions, and monitor student performance.'}
            {user.role === 'Admin' && 'Oversee platform activities, manage users, and ensure system performance.'}
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-6 max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, label: 'Total Exams', value: stats.totalExams, color: 'indigo' },
            user.role === 'Student'
              ? { icon: CheckCircle, label: 'Exams Taken', value: stats.examsTaken, color: 'pink' }
              : { icon: Clock, label: 'Pending Evaluations', value: stats.pendingCount, color: 'pink' },
            user.role === 'Student'
              ? { icon: Award, label: 'Exams Passed', value: stats.examsPassed, color: 'green' }
              : { icon: AlertTriangle, label: 'Success Rate', value: stats.examsTaken > 0 ? `${Math.round((stats.examsPassed / stats.examsTaken) * 100)}%` : 'N/A', color: 'green' },
            user.role === 'Admin'
              ? { icon: Users, label: 'Total Users', value: '-', color: 'blue' }
              : { icon: Award, label: 'Certificates', value: examHistory?.filter((exam) => exam.certificateGenerated).length || 0, color: 'blue' },
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

      {/* Main Content */}
      <div className="px-6 max-w-6xl mx-auto space-y-16">
        {/* Exams Section */}
        <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              {user.role === 'Student' ? 'Available Exams' : 'Recent Exams'}
            </h2>
            <Link to="/exams">
              <Button variant="outline" size="small" className="border-pink-500 text-pink-400 hover:bg-pink-500/20 transition-colors">
                View All
              </Button>
            </Link>
          </div>
          
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
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
                    <Link to={`/exams/${exam._id}`}>
                      <Button size="small" className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
              <p className="text-gray-400 mb-4">
                {user.role === 'Student' ? 'No exams available yet.' : 'No exams created yet.'}
              </p>
              {(user.role === 'Admin' || user.role === 'Examiner') && (
                <Link to="/exams/create">
                  <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
                    Create Exam
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Student History Section */}
        {user.role === 'Student' && (
          <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Your Exam History</h2>
              <Link to="/exam-history">
                <Button variant="outline" size="small" className="border-pink-500 text-pink-400 hover:bg-pink-500/20 transition-colors">
                  View All
                </Button>
              </Link>
            </div>
            
            {examHistory.length > 0 ? (
              <div className="overflow-x-auto bg-[#0f172a] rounded-xl">
                <table className="min-w-full">
                  <thead className="bg-[#1e293b] text-gray-300">
                    <tr>
                      {['Exam', 'Score', 'Status', 'Date', 'Certificate'].map((header) => (
                        <th key={header} className="py-3 px-6 text-left font-medium text-sm">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {examHistory.map((item) => (
                      <tr key={item.exam._id} className="hover:bg-[#172135] transition-colors duration-200">
                        <td className="py-4 px-6">
                          <Link to={`/exams/${item.exam._id}/results`} className="text-indigo-400 hover:text-indigo-300">
                            {item.exam.title}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {item.score}/{item.exam.totalMarks} ({Math.round((item.score / item.exam.totalMarks) * 100)}%)
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.passed ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                            }`}
                          >
                            {item.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400">{new Date(item.submittedAt).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          {item.certificateGenerated ? (
                            <a
                              href={`https://examportal-i5j6.onrender.com${item.certificateUrl}`}

                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-400 hover:text-pink-300"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-gray-600">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
                <p className="text-gray-400 mb-4">You haven't taken any exams yet.</p>
                <Link to="/exams">
                  <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
                    Browse Exams
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Pending Evaluations Section */}
        {(user.role === 'Examiner' || user.role === 'Admin') && (
          <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Pending Evaluations</h2>
              <Link to="/evaluations">
                <Button variant="outline" size="small" className="border-pink-500 text-pink-400 hover:bg-pink-500/20 transition-colors">
                  View All
                </Button>
              </Link>
            </div>
            
            {pendingEvaluations.length > 0 ? (
              <div className="space-y-6">
                {pendingEvaluations.map((exam) => (
                  <div
                    key={exam.examId}
                    className="bg-[#0f172a] rounded-2xl overflow-hidden shadow-md"
                  >
                    <div className="bg-[#1a2234] px-6 py-4 border-l-4 border-pink-500">
                      <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                      <p className="text-sm text-pink-400">{exam.pendingSubmissions.length} submissions pending evaluation</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {exam.pendingSubmissions.slice(0, 3).map((submission) => (
                        <div
                          key={submission.submissionId}
                          className="flex justify-between items-center p-4 bg-[#172135] rounded-lg hover:bg-[#1e293b] transition-colors duration-200"
                        >
                          <div>
                            <p className="font-medium text-gray-200">{submission.student.name}</p>
                            <p className="text-sm text-gray-400">{submission.student.email}</p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <Link to={`/exams/${exam.examId}/evaluate/${submission.submissionId}`}>
                            <Button size="small" className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
                <p className="text-gray-400">No pending evaluations at this time.</p>
              </div>
            )}
          </section>
        )}

        {/* Features Section */}
        <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user.role === 'Student' ? (
              [
                { icon: BookOpen, title: "Browse Exams", desc: "Explore all available exams and start your learning journey.", to: "/exams" },
                { icon: Clock, title: "Exam History", desc: "Review your past performance and download certificates.", to: "/exam-history" },
                { icon: Users, title: "Update Profile", desc: "Keep your information up to date for a better experience.", to: "/profile" },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="block">
                  <div className="bg-[#0f172a] p-6 rounded-2xl h-full transform hover:-translate-y-2 transition duration-300 hover:shadow-lg hover:shadow-pink-500/10">
                    <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{action.desc}</p>
                    <Button 
                      fullWidth
                      className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                </Link>
              ))
            ) : (
              [
                { icon: BookOpen, title: "Create Exam", desc: "Design a new exam with customizable questions and settings.", to: "/exams/create" },
                { icon: Brain, title: "Add Question", desc: "Expand your question bank with various question types.", to: "/questions/create" },
                { icon: CheckCircle, title: "Evaluate", desc: "Review and score pending exam submissions.", to: "/evaluations" },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="block">
                  <div className="bg-[#0f172a] p-6 rounded-2xl h-full transform hover:-translate-y-2 transition duration-300 hover:shadow-lg hover:shadow-pink-500/10">
                    <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{action.desc}</p>
                    <Button 
                      fullWidth
                      className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;