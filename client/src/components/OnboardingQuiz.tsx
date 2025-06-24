import React, { useState } from 'react';

interface OnboardingQuizProps {
  onComplete: (responses: Record<string, string>) => void;
}

const questions = [
  {
    id: 'communication_style',
    question: 'How do you prefer to communicate?',
    options: [
      { value: 'direct', label: 'Direct and to the point' },
      { value: 'casual', label: 'Casual and friendly' },
      { value: 'warm', label: 'Warm and empathetic' },
      { value: 'professional', label: 'Professional and structured' }
    ]
  },
  {
    id: 'support_type',
    question: 'What type of support are you looking for?',
    options: [
      { value: 'emotional', label: 'Emotional support' },
      { value: 'practical', label: 'Practical advice' },
      { value: 'listening', label: 'Someone to listen' },
      { value: 'guidance', label: 'Life guidance' }
    ]
  }
];

export default function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleResponse = (questionId: string, value: string) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newResponses);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Getting to Know You</h2>
        <div className="mb-6">
          <p className="text-white/80 mb-4">{question.question}</p>
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleResponse(question.id, option.value)}
                className="w-full p-3 text-left bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center text-white/60 text-sm">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
    </div>
  );
}