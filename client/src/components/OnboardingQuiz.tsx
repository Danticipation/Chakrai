import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Question {
  id: string;
  type: 'radio' | 'text' | 'textarea';
  question: string;
  description?: string;
  options?: string[];
  category: 'personal' | 'communication' | 'interests' | 'values' | 'goals';
}

const quizQuestions: Question[] = [
  {
    id: 'name',
    type: 'text',
    question: 'What would you like me to call you?',
    description: 'This helps me personalize our conversations',
    category: 'personal'
  },
  {
    id: 'age_range',
    type: 'radio',
    question: 'What age range are you in?',
    options: ['18-25', '26-35', '36-45', '46-55', '56+'],
    category: 'personal'
  },
  {
    id: 'occupation',
    type: 'text',
    question: 'What do you do for work or study?',
    description: 'This helps me understand your daily context',
    category: 'personal'
  },
  {
    id: 'communication_style',
    type: 'radio',
    question: 'How do you prefer to communicate?',
    options: [
      'Direct and to the point',
      'Warm and conversational', 
      'Thoughtful and detailed',
      'Casual and friendly',
      'Professional and structured'
    ],
    category: 'communication'
  },
  {
    id: 'stress_response',
    type: 'radio',
    question: 'When stressed, you typically:',
    options: [
      'Analyze the problem logically',
      'Talk it through with others',
      'Take time alone to process',
      'Jump into action immediately',
      'Seek creative outlets'
    ],
    category: 'communication'
  },
  {
    id: 'primary_interests',
    type: 'textarea',
    question: 'What are your main interests and hobbies?',
    description: 'Tell me about what you enjoy doing in your free time',
    category: 'interests'
  },
  {
    id: 'core_values',
    type: 'radio',
    question: 'Which value resonates most with you?',
    options: [
      'Authenticity and being true to myself',
      'Growth and continuous learning',
      'Connection and meaningful relationships',
      'Achievement and success',
      'Creativity and self-expression',
      'Balance and inner peace'
    ],
    category: 'values'
  },
  {
    id: 'life_philosophy',
    type: 'textarea',
    question: 'How would you describe your approach to life?',
    description: 'What principles or beliefs guide your decisions?',
    category: 'values'
  },
  {
    id: 'wellness_goals',
    type: 'textarea',
    question: 'What are your main wellness or personal development goals?',
    description: 'What would you like to work on or improve?',
    category: 'goals'
  },
  {
    id: 'support_preference',
    type: 'radio',
    question: 'What kind of support do you find most helpful?',
    options: [
      'Someone who listens without judgment',
      'Practical advice and solutions',
      'Encouragement and motivation',
      'Challenging questions that make me think',
      'A mix of all approaches'
    ],
    category: 'communication'
  }
];

interface OnboardingQuizProps {
  userId?: number;
  onComplete: () => void;
}

export default function OnboardingQuiz({ userId = 1, onComplete }: OnboardingQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const submitProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/onboarding-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profileData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory-profile'] });
      onComplete();
    }
  });

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitProfileMutation.mutateAsync({ answers });
  };

  const currentQ = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const hasAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl">
        <div className="text-center pb-4 p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to TraI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Let's build your personality mirror together
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-8 pt-0">
          {/* Question */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {currentQ.question}
              </h3>
              {currentQ.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQ.type === 'radio' && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="radio"
                        id={`${currentQ.id}-${index}`}
                        name={currentQ.id}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <label 
                        htmlFor={`${currentQ.id}-${index}`} 
                        className="flex-1 cursor-pointer text-gray-700 dark:text-gray-300"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {currentQ.type === 'text' && (
                <input
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full text-lg p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              )}

              {currentQ.type === 'textarea' && (
                <textarea
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full text-lg p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnswer || isSubmitting}
              className="px-8 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating your profile...</span>
                </div>
              ) : isLastQuestion ? (
                'Complete Setup'
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}