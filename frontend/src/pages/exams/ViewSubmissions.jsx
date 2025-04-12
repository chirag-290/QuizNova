// components/exams/ViewSubmissions.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';

const ViewSubmissions = ({ exam, onBack }) => {


  return (
    <div className="flex flex-col items-center">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-4 flex items-center"
      >
        ← Back to Exam Details
      </Button>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Submissions</h2>

      {exam.submissions.length === 0 ? (
        <p className="text-gray-600">No submissions yet.</p>
      ) : (
        exam.submissions.map((submission, index) => (
          <div key={index} className="border rounded-md p-4 mb-4 w-full">
            <h3 className="font-medium text-gray-800">{submission.student.name}</h3>
            <p className="text-gray-600">Score: {submission.score}/{exam.totalMarks}</p>
            <p className="text-gray-600">
              Time Taken: {Math.floor(submission.timeTaken / 60)}:
              {(submission.timeTaken % 60).toString().padStart(2, '0')}
            </p>
            {/* <Link to={`/exams/${id}/results/${submission._id}`}>
              <Button variant="outline" className="mt-2">
                View Details
              </Button>
            </Link> */}
               <p className="text-gray-600">Tab Switches:{submission.tabSwitches}</p>
               <p className="text-gray-600">Score: {submission.score}/{exam.totalMarks}</p>
               <p className="text-gray-600">
              Submitted At: {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewSubmissions;
