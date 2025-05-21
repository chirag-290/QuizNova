import React, { useContext, useEffect, useState } from "react";
import AuthContext from '../../context/AuthContext';
import axios from "axios";
import { User, Award, Clock, ChevronRight, BarChart2, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [examHistory, setExamHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("https://quiznova.onrender.com/api/users/exams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExamHistory(res.data.data);
      } catch (error) {
        console.error("Failed to fetch exam history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const totalExams = examHistory.length;
  const passedExams = examHistory.filter((e) => e.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  // Format date in a more readable way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen py-20 px-6">
      {/* Header with glow effect */}
      <div className="relative max-w-4xl mx-auto mb-16">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-700 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-600 opacity-20 blur-3xl rounded-full"></div>
        
        {/* Profile Header */}
        <div className="relative z-10 bg-[#1e293b] rounded-3xl p-8 shadow-xl border border-gray-800">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-pink-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#111827] rounded-full flex items-center justify-center border-2 border-gray-800">
                <span className="text-xs font-bold text-pink-500">Pro</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{user.name || "User"}</h1>
              <p className="text-gray-400 mb-4">{user.email || "user@example.com"}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                <span className="bg-[#111827] px-3 py-1 rounded-full text-sm font-medium text-gray-300 flex items-center">
                  <Award className="h-4 w-4 mr-1 text-indigo-400" />
                  Member since {user.joinDate || "2023"}
                </span>
                <span className="bg-[#111827] px-3 py-1 rounded-full text-sm font-medium text-gray-300 flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-indigo-400" />
                  {totalExams} Exams
                </span>
              </div>
            </div>
            
            <div className="md:ml-auto">
              {/* <button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition text-white px-4 py-2 rounded-lg text-sm font-medium">
                Edit Profile
              </button> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Stats Section */}
        <div className="md:col-span-1">
          <div className="bg-[#1e293b] rounded-3xl p-6 shadow-lg border border-gray-800 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-400" />
              Performance
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Pass Rate</span>
                    <span className="text-sm font-bold text-white">{passRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full" 
                      style={{ width: `${passRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#111827] p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Total Exams</p>
                    <p className="text-2xl font-bold">{totalExams}</p>
                  </div>
                  <div className="bg-[#111827] p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Passed</p>
                    <p className="text-2xl font-bold text-green-400">{passedExams}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-[#1e293b] rounded-3xl p-6 shadow-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link to="/exams" className="flex items-center justify-between p-3 bg-[#111827] hover:bg-[#2d3748] rounded-xl transition">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-indigo-400" />
                  Available Exams
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link to="/exam-history" className="flex items-center justify-between p-3 bg-[#111827] hover:bg-[#2d3748] rounded-xl transition">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                  Exam History
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link to="/certificates" className="flex items-center justify-between p-3 bg-[#111827] hover:bg-[#2d3748] rounded-xl transition">
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-indigo-400" />
                  Certificates
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recent Exams Section */}
        <div className="md:col-span-2">
          <div className="bg-[#1e293b] rounded-3xl p-6 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-400" />
                Recent Exams
              </h2>
              <Link to="/exam-history" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : examHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                <p>No exams attempted yet</p>
                <Link to="/exams" className="text-pink-500 hover:text-pink-400 mt-2 inline-block">
                  Browse Exams
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {examHistory.slice(0, 3).map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-[#111827] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          {entry.exam?.title || "Untitled Exam"}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            Score: {entry.score}/{entry.exam?.totalMarks}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(entry.submittedAt)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          entry.passed
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {entry.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {entry.timeTaken} mins
                      </span>
                      {entry.certificateGenerated && (
                        <Link to={`https://quiznova.onrender.com${entry.certificateUrl}`} className="text-xs text-indigo-400 hover:text-indigo-300">
                          View Certificate
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {examHistory.length > 0 && (
              <div className="mt-6 text-center">
                <Link to="/exam-history" className="inline-block bg-pink-600 hover:bg-pink-500 transition px-4 py-2 rounded-full text-white text-sm font-medium">
                  View All Exam History
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;