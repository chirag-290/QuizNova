import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Award, User, Calendar, MousePointer } from 'lucide-react';
import Button from '../../components/ui/Button';

const ViewSubmissions = ({ exam, onBack }) => {
  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="relative py-12 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[3rem] shadow-xl mb-12">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4 flex items-center text-pink-400 border-pink-500 hover:bg-pink-500/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Exam Details
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Exam Submissions</h1>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl">
            Review all student submissions for {exam?.title || 'this exam'}.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6 max-w-6xl mx-auto">
        <section className="bg-[#1f2937] rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">All Submissions</h2>
            <div className="text-pink-400 bg-pink-500/10 px-4 py-2 rounded-full text-sm">
              Total: {exam.submissions?.length || 0} submissions
            </div>
          </div>
          
          {exam.submissions?.length === 0 ? (
            <div className="bg-[#0f172a] rounded-2xl p-8 text-center">
              <p className="text-gray-400 mb-4">No submissions have been made for this exam yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {exam.submissions.map((submission, index) => (
                <div
                  key={index}
                  className="bg-[#0f172a] rounded-2xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-pink-500/20"
                >
                  <div className="bg-[#1a2234] px-6 py-4 border-l-4 border-indigo-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{submission.student.name}</h3>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.score / exam.totalMarks >= 0.7 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          Score: {submission.score}/{exam.totalMarks} ({Math.round((submission.score / exam.totalMarks) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-indigo-400 mr-3" />
                        <div>
                          <p className="text-xs text-gray-400">Time Taken</p>
                          <p className="text-gray-200">
                            {Math.floor(submission.timeTaken / 60)}:
                            {(submission.timeTaken % 60).toString().padStart(2, '0')} minutes
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MousePointer className="h-5 w-5 text-pink-400 mr-3" />
                        <div>
                          <p className="text-xs text-gray-400">Tab Switches</p>
                          <p className="text-gray-200">{submission.tabSwitches}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-indigo-400 mr-3" />
                        <div>
                          <p className="text-xs text-gray-400">Submitted</p>
                          <p className="text-gray-200">{new Date(submission.submittedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white"
                        size="small"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ViewSubmissions;