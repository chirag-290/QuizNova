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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/questions" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Question Bank</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800">Create New Question</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <textarea
                id="text"
                rows="3"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.text ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholder="Enter your question here..."
                {...register('text', {
                  required: 'Question text is required'
                })}
              ></textarea>
              {errors.text && (
                <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
              )}
            </div>
            
            {/* Question Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Question Type *
              </label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={questionType}
                onChange={handleTypeChange}
              >
                <option value="MCQ">Multiple Choice</option>
                <option value="Subjective">Subjective</option>
              </select>
            </div>
            
            {/* MCQ Options */}
            {questionType === 'MCQ' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options *
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`correct-${index}`}
                        name="correctAnswer"
                        value={option}
                        checked={watchCorrectAnswer === option}
                        onChange={() => setValue('correctAnswer', option)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-2"
                        disabled={!option.trim()}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                  
                  {errors.correctAnswer && (
                    <p className="mt-1 text-sm text-red-600">{errors.correctAnswer.message}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Subjective Answer */}
            {questionType === 'Subjective' && (
              <div>
                <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Answer *
                </label>
                <textarea
                  id="correctAnswer"
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.correctAnswer ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  placeholder="Enter the expected answer..."
                  {...register('correctAnswer', {
                    required: 'Expected answer is required'
                  })}
                ></textarea>
                {errors.correctAnswer && (
                  <p className="mt-1 text-sm text-red-600">{errors.correctAnswer.message}</p>
                )}
              </div>
            )}
            
            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            <div>
              <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">
                Points/Marks *
              </label>
              <input
                id="marks"
                type="number"
                min="1"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.marks ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                {...register('marks', {
                  required: 'Points are required',
                  min: {
                    value: 1,
                    message: 'Points must be at least 1'
                  }
                })}
              />
              {errors.marks && (
                <p className="mt-1 text-sm text-red-600">{errors.marks.message}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? <Spinner size="small" /> : 'Create Question'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateQuestion;