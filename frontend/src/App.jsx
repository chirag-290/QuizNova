import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

 
import { AuthProvider } from './context/AuthContext';

 
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import ExaminerRoute from './components/routing/ExaminerRoute';

 
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/exams/ExamList';
import ExamDetails from './pages/exams/ExamDetails';
import TakeExam from './pages/exams/TakeExam';
import ExamResults from './pages/exams/ExamResults';
import CreateExam from './pages/exams/CreateExam';
import EditExam from './pages/exams/EditExam';
import QuestionBank from './pages/questions/QuestionBank';
import CreateQuestion from './pages/questions/CreateQuestion';
import EditQuestion from './pages/questions/EditQuestion';
// import UserManagement from './pages/admin/UserManagement';
import PendingEvaluations from './pages/exams/PendingEvaluations';
import EvaluateSubmission from './pages/exams/EvaluateSubmission';
// import UserProfile from './pages/user/UserProfile';
// import ExamHistory from './pages/user/ExamHistory';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Private Routes (All authenticated users) */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/exams" element={<ExamList />} />
                <Route path="/exams/:id" element={<ExamDetails />} />
                <Route path="/exams/:id/take" element={<TakeExam />} />
                <Route path="/exams/:id/results" element={<ExamResults />} />
                {/* <Route path="/profile" element={<UserProfile />} /> */}
                {/* <Route path="/exam-history" element={<ExamHistory />} /> */}
              </Route>
              
              {/* Admin Routes */}
              
              
              {/* Admin & Examiner Routes */}
              <Route element={<ExaminerRoute />}>
                <Route path="/exams/create" element={<CreateExam />} />
                <Route path="/exams/:id/edit" element={<EditExam />} />
                <Route path="/questions" element={<QuestionBank />} />
                <Route path="/questions/create" element={<CreateQuestion />} />
                <Route path="/questions/:id/edit" element={<EditQuestion />} />
                <Route path="/evaluations" element={<PendingEvaluations />} />
                <Route path="/exams/:examId/evaluate/:submissionId" element={<EvaluateSubmission />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;