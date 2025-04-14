import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { questionAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [questionType, setQuestionType] = useState('MCQ');
  const [options, setOptions] = useState(['', '', '', '']);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      text: '',
      type: 'MCQ',
      difficulty: 'Medium',
      marks: 1,
      correctAnswer: ''
    }
  });
  
  const watchCorrectAnswer = watch('correctAnswer');
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
 
  const addOption = () => {
    setOptions([...options, '']);
  };
  
  const removeOption = (index) => {
    if (options.length <= 2) {
      toast.error('MCQ questions must have at least 2 options');
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    
    if (options[index] === watchCorrectAnswer) {
      setValue('correctAnswer', '');
    }
  };
  
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setQuestionType(type);
    setValue('type', type);
    
    setValue('correctAnswer', '');
  };
  
  const onSubmit = async (data) => {
    if (data.type === 'MCQ') {
      const validOptions = options.filter(opt => opt.trim() !== '');
      
      if (validOptions.length < 2) {
        toast.error('MCQ questions must have at least 2 options');
        return;
      }
      
      if (!validOptions.includes(data.correctAnswer)) {
        toast.error('Correct answer must be one of the options');
        return;
      }
      
      data.options = validOptions;
    }
    
    setSubmitting(true);
    
    try {
      const res = await questionAPI.createQuestion(data);
      
      if (res.data.success) {
        toast.success('Question created successfully!');
        navigate('/questions');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="font-sans bg-gradient-to-br from-[#0d1117] to-[#1f2937] text-white min-h-screen pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="relative py-12 px-6 overflow-hidden bg-[#1f1f1f] rounded-b-[3rem] shadow-xl mb-12">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-700 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link to="/questions" className="text-indigo-400 hover:text-indigo-300 flex items-center mb-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Question Bank</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Create New Question</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Design your question with customizable options and settings for your exams.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-8">Question Details</h2>
            
            <div className="space-y-6">
              {/* Question Text */}
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-2">
                  Question Text *
                </label>
                <textarea
                  id="text"
                  rows="4"
                  className={`w-full px-4 py-3 rounded-xl bg-[#1e293b] border ${
                    errors.text ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your question here..."
                  {...register('text', {
                    required: 'Question text is required'
                  })}
                ></textarea>
                {errors.text && (
                  <p className="mt-2 text-sm text-red-400">{errors.text.message}</p>
                )}
              </div>
              
              {/* Question Type */}
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                  Question Type *
                </label>
                <select
                  id="type"
                  className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  value={questionType}
                  onChange={handleTypeChange}
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="Subjective">Subjective</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* MCQ Options Section */}
          {questionType === 'MCQ' && (
            <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">Answer Options</h2>
              
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-300">
                    Options * <span className="text-gray-500 text-xs">(Select the radio button for correct answer)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center text-indigo-400 hover:text-indigo-300 transition duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>
                
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center bg-[#1e293b] rounded-xl p-2 hover:bg-[#172135] transition-colors duration-200">
                      <input
                        type="radio"
                        id={`correct-${index}`}
                        name="correctAnswer"
                        value={option}
                        checked={watchCorrectAnswer === option}
                        onChange={() => setValue('correctAnswer', option)}
                        className="h-5 w-5 text-pink-600 focus:ring-indigo-500 mr-3 cursor-pointer"
                        disabled={!option.trim()}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-grow px-4 py-2 bg-transparent border-0 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {errors.correctAnswer && (
                  <p className="mt-2 text-sm text-red-400">{errors.correctAnswer.message}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Subjective Answer Section */}
          {questionType === 'Subjective' && (
            <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">Expected Answer</h2>
              
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Answer *
                </label>
                <textarea
                  id="correctAnswer"
                  rows="4"
                  className={`w-full px-4 py-3 rounded-xl bg-[#1e293b] border ${
                    errors.correctAnswer ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter the expected answer..."
                  {...register('correctAnswer', {
                    required: 'Expected answer is required'
                  })}
                ></textarea>
                {errors.correctAnswer && (
                  <p className="mt-2 text-sm text-red-400">{errors.correctAnswer.message}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Settings Section */}
          <div className="bg-[#1f2937] rounded-3xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-8">Question Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level *
                </label>
                <select
                  id="difficulty"
                  className="w-full px-4 py-3 rounded-xl bg-[#1e293b] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  {...register('difficulty', {
                    required: 'Difficulty is required'
                  })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              {/* Marks */}
              <div className="bg-[#0f172a] rounded-2xl p-6">
                <label htmlFor="marks" className="block text-sm font-medium text-gray-300 mb-2">
                  Points/Marks *
                </label>
                <input
                  id="marks"
                  type="number"
                  min="1"
                  className={`w-full px-4 py-3 rounded-xl bg-[#1e293b] border ${
                    errors.marks ? 'border-red-500' : 'border-gray-700'
                  } text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200`}
                  {...register('marks', {
                    required: 'Points are required',
                    min: {
                      value: 1,
                      message: 'Points must be at least 1'
                    }
                  })}
                />
                {errors.marks && (
                  <p className="mt-2 text-sm text-red-400">{errors.marks.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center md:justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium rounded-xl transition duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-pink-500/20 flex items-center justify-center min-w-[200px]"
            >
              {submitting ? <Spinner size="small" /> : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestion;