import React from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";

export default function Leaderboard({ exam, onClose }) {
    console.log("exam is",exam);
  if (!exam || !exam.submissions) return null;

  // Sort submissions by score DESC, timeTaken ASC
  const topResults = [...exam.submissions]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    })
    .slice(0, 10); // Top 10

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
        <Button onClick={onClose} className="flex items-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300">
          <ArrowLeft size={18} />
          Back to Results
        </Button>
      </div>

      {topResults.length === 0 ? (
        <p className="text-gray-600 text-center">No submissions yet.</p>
      ) : (
        <table className="w-full table-auto border-collapse text-left mt-4">
          <thead>
            <tr className="text-sm text-gray-600 border-b">
              <th className="py-2">#</th>
              <th className="py-2">Student ID</th>
              <th className="py-2">Score</th>
              <th className="py-2">Percentage</th>
              <th className="py-2">Time Taken (min)</th>
            </tr>
          </thead>
          <tbody>
            {topResults.map((submission, index) => (
              <tr key={submission._id} className="border-b text-gray-800">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{submission.student.name}</td>
                <td className="py-2">{submission.score}/{exam.totalMarks}</td>
                <td className="py-2">{Math.round((submission.score / exam.totalMarks) * 100)}%</td>
                <td className="py-2">{Math.floor(submission.timeTaken / 60)}:{(submission.timeTaken % 60).toString().padStart(2, '0')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
