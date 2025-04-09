const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const http = require('http');
const { Server } = require('socket.io');


const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
 const userRoutes = require('./routes/userRoutes');


dotenv.config();

connectDB();

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
 
app.use('/api/users', userRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('exam_timer_update', (data) => {
  
    if (data.userId) {
      socket.to(data.userId).emit('timer_update', data.timeRemaining);
    }
  });

  socket.on('join_exam', (examId) => {
    socket.join(examId);
    console.log(`User joined exam: ${examId}`);
  });

 
  socket.on('tab_switch', (data) => {
    
    io.to(data.examId).emit('student_tab_switch', {
      studentId: data.userId,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});