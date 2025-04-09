import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';
    
     
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    toast.error(message);
    return Promise.reject(error);
  }
);

 
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  logout: () => api.get('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

 
export const examAPI = {
  getAllExams: () => api.get('/exams'),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (examData) => api.post('/exams', examData),
  updateExam: (id, examData) => api.put(`/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  submitExam: (id, answers) => api.post(`/exams/${id}/submit`, answers),
  getPendingEvaluations: () => api.get('/exams/evaluations'),
  evaluateSubjective: (examId, data) => api.post(`/exams/${examId}/evaluate`, data)
};

 
export const questionAPI = {
  getAllQuestions: (params) => api.get('/questions', { params }),
  getRandomQuestions: (params) => api.get('/questions/random', { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  updateQuestion: (id, questionData) => api.put(`/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/questions/${id}`)
};
 
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserExamHistory: () => api.get('/users/exams')
};

export default api;