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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 text-center p-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Welcome to TraI
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Let's build your personality mirror together
        </p>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {currentQ.question}
              </h3>
              {currentQ.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              {currentQ.type === 'radio' && currentQ.options && (
                <div className="space-y-2">
                  {currentQ.options.map((option, index) => (
                    <label 
                      key={index} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      htmlFor={`${currentQ.id}-${index}`}
                    >
                      <input
                        type="radio"
                        id={`${currentQ.id}-${index}`}
                        name={currentQ.id}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                        className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="flex-1 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === 'text' && (
                <input
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full text-base p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              )}

              {currentQ.type === 'textarea' && (
                <textarea
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="w-full text-base p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/98 dark:bg-gray-800/98 backdrop-blur-lg border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl z-50">
        <div className="flex justify-between items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 max-w-[120px] py-4 px-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg"
            style={{ minHeight: '52px' }}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!hasAnswer || isSubmitting}
            className="flex-1 max-w-[200px] py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-xl"
            style={{ minHeight: '52px' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating...</span>
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
  );
}