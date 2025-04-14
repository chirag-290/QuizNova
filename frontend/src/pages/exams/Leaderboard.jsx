import React from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import Button from "../../components/ui/Button";

export default function Leaderboard({ exam, onClose }) {
  if (!exam || !exam.submissions) return null;

  // Sort submissions by score DESC, timeTaken ASC
  const topResults = [...exam.submissions]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    })
    .slice(0, 10); // Top 10

  return (
    <div className="bg-[#1f2937] rounded-xl shadow-xl p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        <Button 
          onClick={onClose} 
          className="flex items-center gap-2 bg-[#0f172a] hover:bg-[#172135] text-white"
        >
          <ArrowLeft size={16} />
          Back to Results
        </Button>
      </div>

      {topResults.length === 0 ? (
        <div className="bg-[#0f172a] rounded-lg p-6 text-center">
          <p className="text-gray-400">No submissions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0f172a] rounded-lg">
          <table className="min-w-full">
            <thead className="bg-[#1e293b] text-gray-300">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-sm">Rank</th>
                <th className="py-3 px-4 text-left font-medium text-sm">Student</th>
                <th className="py-3 px-4 text-left font-medium text-sm">Score</th>
                <th className="py-3 px-4 text-left font-medium text-sm">Percentage</th>
                <th className="py-3 px-4 text-left font-medium text-sm">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {topResults.map((submission, index) => (
                <tr 
                  key={submission._id} 
                  className="hover:bg-[#172135] transition-colors duration-200"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{submission.student.name}</td>
                  <td className="py-3 px-4">{submission.score}/{exam.totalMarks}</td>
                  <td className="py-3 px-4">
                    {Math.round((submission.score / exam.totalMarks) * 100)}%
                  </td>
                  <td className="py-3 px-4">
                    {Math.floor(submission.timeTaken / 60)}:{(submission.timeTaken % 60).toString().padStart(2, '0')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}