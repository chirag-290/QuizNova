import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from '../../context/AuthContext';
import { Calendar, Clock, Award, FileCheck, AlertCircle, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExamHistory = () => {
  const { user } = useContext(AuthContext);
  const [examHistory, setExamHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExamHistory = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("https://quiznova.onrender.com/api/users/exams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExamHistory(res.data.data);
      } catch (err) {
        console.error("Failed to fetch exam history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamHistory();
  }, []);

  // Function to determine badge color based on score percentage
  const getBadgeColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format date in a more readable way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen py-20 px-6">
      {/* Header Section */}
      <div className="relative max-w-6xl mx-auto mb-16 text-center">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-700 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-600 opacity-20 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Your Exam Journey</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your progress, revisit your achievements, and continue your learning path.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : examHistory.length === 0 ? (
          <div className="bg-[#1f2937] rounded-3xl p-12 text-center shadow-xl">
            <div className="inline-flex justify-center items-center w-20 h-20 bg-[#111827] rounded-full mb-6">
              <AlertCircle className="h-10 w-10 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Exams Attempted Yet</h2>
            <p className="text-gray-400 mb-8">Start your journey by taking your first exam</p>
            <Link to="/exams" className="bg-pink-600 hover:bg-pink-500 transition px-6 py-3 rounded-full font-medium text-white">
              Browse Available Exams
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Your Performance Summary</h2>
                <p className="text-gray-400">You've completed {examHistory.length} exam{examHistory.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex space-x-2">
                {/* <button className="bg-[#1e293b] hover:bg-[#2d3748] text-white px-4 py-2 rounded-lg flex items-center">
                  <FileCheck className="w-4 h-4 mr-2" /> Export Report
                </button> */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examHistory.map((entry, index) => (
                <div
                  key={index}
                  className="bg-[#1e293b] rounded-3xl overflow-hidden transform hover:-translate-y-2 transition duration-300 shadow-lg hover:shadow-xl border border-gray-800"
                >
                  <div className="p-1">
                    <div className={`w-full h-2 ${entry.passed ? "bg-green-500" : "bg-red-500"} rounded-t-3xl`}></div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {entry.exam?.title || "Untitled Exam"}
                      </h3>
                      <span className={`${getBadgeColor(entry.score, entry.exam?.totalMarks)} text-white text-sm px-3 py-1 rounded-full font-medium`}>
                        {Math.round((entry.score / entry.exam?.totalMarks) * 100)}%
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {entry.exam?.description || "No description available"}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-300">
                        <Award className="h-4 w-4 mr-2 text-indigo-400" />
                        <span>Score: </span>
                        <span className="ml-auto font-semibold">{entry.score} / {entry.exam?.totalMarks}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                        <span>Time: </span>
                        <span className="ml-auto font-semibold">{entry.timeTaken} mins</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                        <span>Date: </span>
                        <span className="ml-auto text-sm">{formatDate(entry.submittedAt)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm mr-2">Result:</span>
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            entry.passed
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {entry.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>

                      {entry.certificateGenerated && entry.certificateUrl && (
                        <a
                          href={`https://quiznova.onrender.com${entry.certificateUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-400 hover:text-indigo-300 transition"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          <span className="text-sm">Certificate</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};



export default ExamHistory;