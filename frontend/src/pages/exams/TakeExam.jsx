import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Save, Video, VideoOff, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import { examAPI } from '../../services/api';
import { connectSocket, joinExamRoom, listenForTimerUpdates, emitTabSwitch, removeTimerListener } from '../../services/socket';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import * as tf from '@tensorflow/tfjs';

const TakeExam = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const tabSwitchCountRef = useRef(0);

  // Camera and face detection references and states
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null); // For face detection visualization
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [model, setModel] = useState(null);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const detectionIntervalRef = useRef(null);
  const [faceCount, setFaceCount] = useState(0);
  const [showFaceAlert, setShowFaceAlert] = useState(false);
  const [faceLogs, setFaceLogs] = useState([]);

  // Load TensorFlow model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Import the face-detection model dynamically
        const blazeface = await import('@tensorflow-models/blazeface');
        
        // Initialize the model
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        console.log('Face detection model loaded successfully');
        toast.success('Proctoring system activated');
      } catch (error) {
        console.error('Failed to load face detection model:', error);
        toast.error('Failed to load proctoring system');
      }
    };

    loadModel();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Function for face detection
  const detectFaces = async () => {
    if (!model || !localVideoRef.current || !localVideoRef.current.videoWidth) return;

    try {
      const video = localVideoRef.current;
      
      // Run detection on the video element
      const predictions = await model.estimateFaces(video, false);
      
      // Count faces and update state
      const numFaces = predictions.length;
      setFaceCount(numFaces);
      
      // Log potentially suspicious activity
      if (numFaces > 1) {
        const timestamp = new Date().toLocaleTimeString();
        setFaceLogs(prev => [...prev, `${timestamp}: Multiple faces (${numFaces}) detected`]);
        
        if (!multipleFacesDetected) {
          setMultipleFacesDetected(true);
          setShowFaceAlert(true);
          
          // Notify the exam system
          emitTabSwitch(id, user._id, 'multiple_faces_detected');
          toast.error('Multiple faces detected! This may be flagged for cheating.');
        }
      } else {
        setMultipleFacesDetected(false);
      }
      
      // Optional: Visualize the faces on a canvas overlay
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw detected faces
        predictions.forEach(prediction => {
          const start = prediction.topLeft;
          const end = prediction.bottomRight;
          const size = [end[0] - start[0], end[1] - start[1]];
          
          // Draw the bounding box
          ctx.strokeStyle = numFaces > 1 ? 'red' : 'green';
          ctx.lineWidth = 2;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);
          
          // Draw keypoints (optional)
          if (prediction.landmarks) {
            ctx.fillStyle = numFaces > 1 ? 'red' : 'green';
            prediction.landmarks.forEach(landmark => {
              ctx.beginPath();
              ctx.arc(landmark[0], landmark[1], 3, 0, 2 * Math.PI);
              ctx.fill();
            });
          }
        });
      }
    } catch (error) {
      console.error('Error during face detection:', error);
    }
  };

  // Function to start the camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }, 
        audio: false 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      
      // Initialize canvas for face detection visualization
      if (canvasRef.current && localVideoRef.current) {
        canvasRef.current.width = localVideoRef.current.clientWidth;
        canvasRef.current.height = localVideoRef.current.clientHeight;
      }
      
      setStream(mediaStream);
      setCameraActive(true);
      toast.info('Camera started and proctoring activated');
      
      // Start face detection interval
      if (model) {
        detectionIntervalRef.current = setInterval(detectFaces, 1000); // Check every 1 second
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please allow camera permissions to continue with the exam.');
      setCameraActive(false);
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await examAPI.getExam(id);
        if (res.data.success) {
          setExam(res.data.data);
          setTimeRemaining(res.data.data.duration * 60);
          const initialAnswers = {};
          res.data.data.questions.forEach(q => {
            initialAnswers[q._id] = '';
          });
          setAnswers(initialAnswers);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Failed to load exam');
        navigate('/exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, navigate]);

  useEffect(() => {
    if (!exam || !token) return;

    // Start camera when the exam component mounts and exam data is loaded
    startCamera();

    const socket = connectSocket(token);
    joinExamRoom(id);

    listenForTimerUpdates((time) => {
      setTimeRemaining(time);
    });

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        emitTabSwitch(id, user._id, 'tab_switch');
        toast.warning('Tab switching detected! This may be flagged for review.');
        
        // Add to logs
        const timestamp = new Date().toLocaleTimeString();
        setFaceLogs(prev => [...prev, `${timestamp}: Tab switch detected`]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerRef.current);
      removeTimerListener();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [exam, id, token, user._id, model]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async (timeUp = false) => {
    if (!timeUp && !confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }

    setSubmitting(true);
    stopCamera();

    const timeTaken = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : exam.duration * 60 - timeRemaining;

    // Format answers for submission
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      answer: answers[questionId]
    }));

    try {
      const res = await examAPI.submitExam(id, {
        answers: formattedAnswers,
        timeTaken,
        tabSwitches: tabSwitchCountRef.current,
        proctorLogs: faceLogs // Send the face detection logs with the submission
      });

      if (res.data.success) {
        toast.success(timeUp ? 'Time\'s up! Exam submitted.' : 'Exam submitted successfully!');
        navigate(`/exams/${id}/results`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam. Please try again.');
      setConfirmSubmit(false);
    } finally {
      setSubmitting(false);
    }
  };

  const dismissFaceAlert = () => {
    setShowFaceAlert(false);
  };

  const cancelSubmit = () => {
    setConfirmSubmit(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#1f2937]">
        <Spinner size="large" className="text-pink-500" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen py-12 px-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Exam Not Found</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">The exam you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/exams')} className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestionData = exam.questions[currentQuestion];

  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen pb-12 animate-fade-in">

      <section className="relative py-8 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[3rem] shadow-xl mb-8">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 md:mb-0">{exam.title}</h1>
            <div className="flex items-center bg-indigo-900/50 text-indigo-300 px-4 py-2 rounded-full">
              <Clock className="h-5 w-5 mr-2 text-pink-400" />
              <span className="font-bold text-xl">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-between items-center text-gray-300">
            <div className="flex items-center mr-4 mb-2">
              <span className="mr-2">Question</span>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold">{currentQuestion + 1}</span>
              <span className="mx-1">of</span>
              <span className="bg-pink-600 text-white px-3 py-1 rounded-full font-bold">{exam.questions.length}</span>
            </div>
            <div className="flex items-center mb-2">
              <span className="mr-2">Passing Score:</span>
              <span className="bg-green-600/50 text-green-300 px-3 py-1 rounded-full font-medium">{exam.passingScore}%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 max-w-6xl mx-auto space-y-6">

        {/* Proctoring Camera Feed with Face Detection */}
        <div className="fixed bottom-4 right-4 z-50 bg-[#1f2937] rounded-xl p-3 shadow-2xl border border-gray-700 w-64 h-auto">
          <h2 className="text-sm font-bold mb-2 flex items-center text-white justify-between">
            <div className="flex items-center">
              {cameraActive ? <Video className="h-4 w-4 mr-1 text-green-400" /> : <VideoOff className="h-4 w-4 mr-1 text-red-400" />}
              Proctoring Camera
            </div>
            {/* Face count indicator */}
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
              faceCount === 0 ? 'bg-gray-700 text-gray-300' : 
              faceCount === 1 ? 'bg-green-800/70 text-green-300' : 
              'bg-red-800/70 text-red-300'
            }`}>
              <Users className="h-3 w-3 mr-1" />
              {faceCount}
            </div>
          </h2>
          <div className="relative w-full rounded-md overflow-hidden bg-black aspect-video">
            {cameraActive ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-md transform scaleX(-1)"
                ></video>
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full transform scaleX(-1)"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs text-center p-2">
                <VideoOff className="h-8 w-8 mb-2" />
                <p>Camera required for proctoring.</p>
                <Button onClick={startCamera} className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md">
                  Enable Camera
                </Button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {cameraActive 
              ? "AI proctoring active. Please keep your face visible."
              : "Camera required to continue exam."
            }
          </p>
        </div>

        {/* Multiple Faces Alert */}
        {showFaceAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-red-900/90 border border-red-700 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold">Multiple Faces Detected!</h3>
                <p className="text-sm text-red-200">
                  Our system has detected multiple faces in the camera view. 
                  This violates exam rules and will be logged as potential cheating.
                </p>
              </div>
              <button 
                onClick={dismissFaceAlert} 
                className="ml-4 text-red-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#1f2937] rounded-3xl p-6 shadow-xl">
          <div className="flex flex-wrap gap-3">
            {exam.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 transform ${
                  index === currentQuestion
                    ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white scale-110 shadow-lg shadow-pink-500/20'
                    : answers[q._id]
                    ? 'bg-green-900/50 text-green-400 border border-green-500/30 hover:scale-105'
                    : 'bg-[#0f172a] text-gray-400 hover:bg-[#172135] hover:text-gray-300 hover:scale-105'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>


        <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-700 opacity-10 blur-3xl rounded-full"></div>
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-pink-600 opacity-10 blur-3xl rounded-full"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h3 className="text-2xl font-bold text-white mb-3 md:mb-0">Question {currentQuestion + 1}</h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestionData.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' :
                  currentQuestionData.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {currentQuestionData.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestionData.type === 'MCQ' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'
                }`}>
                  {currentQuestionData.type}
                </span>
                <span className="px-3 py-1 bg-gray-800/70 text-gray-300 rounded-full text-sm font-medium">
                  {currentQuestionData.marks} {currentQuestionData.marks === 1 ? 'point' : 'points'}
                </span>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-xl p-6 shadow-inner border border-gray-800">
              <p className="text-lg text-gray-200">{currentQuestionData.text}</p>
            </div>

            {currentQuestionData.type === 'MCQ' && (
              <div className="space-y-3 mt-6">
                {currentQuestionData.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center bg-[#0f172a] p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      answers[currentQuestionData._id] === option
                        ? 'border-indigo-500 shadow-md shadow-indigo-500/20 transform scale-[1.02]'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                    onClick={() => handleAnswerChange(currentQuestionData._id, option)}
                  >
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestionData._id}`}
                      value={option}
                      checked={answers[currentQuestionData._id] === option}
                      onChange={() => handleAnswerChange(currentQuestionData._id, option)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 text-gray-200 cursor-pointer flex-1">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestionData.type === 'Subjective' && (
              <div className="mt-6">
                <label htmlFor="subjective-answer" className="block text-lg font-medium text-indigo-300 mb-2">
                  Your Answer:
                </label>
                <textarea
                  id="subjective-answer"
                  rows="8"
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-200"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestionData._id]}
                  onChange={(e) => handleAnswerChange(currentQuestionData._id, e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
        </div>


        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={goToPrevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center border-indigo-500 text-indigo-400 hover:bg-indigo-500/20 transition-colors px-6 py-2 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>

          {currentQuestion < exam.questions.length - 1 ? (
            <Button
              onClick={goToNextQuestion}
              className="flex items-center bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 px-6 py-2 rounded-full transition-all duration-300"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => handleSubmit()}
              disabled={submitting || confirmSubmit}
              className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-2 rounded-full"
            >
              <Save className="h-5 w-5 mr-1" />
              Submit Exam
            </Button>
          )}
        </div>
      </div>

      {confirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1f2937] rounded-3xl p-8 max-w-md w-full border border-gray-700 shadow-2xl animate-fade-in">
            <div className="relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-700 opacity-20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-600 opacity-20 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4">Confirm Submission</h3>
                <p className="text-gray-300 mb-8">
                  Are you sure you want to submit your exam? You won't be able to change your answers after submission.
                </p>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={cancelSubmit}
                    className="border-gray-500 text-gray-300 hover:bg-gray-700/50 px-6 py-2 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-2 rounded-full"
                  >
                    {submitting ? <Spinner size="small" /> : 'Submit Exam'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;