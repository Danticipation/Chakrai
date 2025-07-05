import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Brain, Heart, MessageCircle, Target } from 'lucide-react';

interface PersonalityQuizProps {
  onComplete: (profile: UserProfile) => void;
  onSkip?: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  category: 'communication' | 'emotional' | 'goals' | 'support';
  options: {
    value: string;
    label: string;
    weight: number;
  }[];
}

interface UserProfile {
  communicationStyle: 'direct' | 'gentle' | 'encouraging' | 'analytical';
  emotionalSupport: 'high' | 'moderate' | 'minimal';
  preferredTone: 'casual' | 'professional' | 'warm' | 'straightforward';
  primaryGoals: string[];
  stressResponses: string[];
  motivationFactors: string[];
  sessionPreference: 'short' | 'medium' | 'long';
  personalityTraits: string[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    category: 'communication',
    question: "How do you prefer to receive feedback or guidance?",
    options: [
      { value: 'direct', label: 'Direct and straightforward', weight: 1 },
      { value: 'gentle', label: 'Gentle and encouraging', weight: 2 },
      { value: 'detailed', label: 'Detailed explanations with examples', weight: 3 },
      { value: 'supportive', label: 'Warm and emotionally supportive', weight: 4 }
    ]
  },
  {
    id: 2,
    category: 'emotional',
    question: "When you're feeling overwhelmed, what helps you most?",
    options: [
      { value: 'practical', label: 'Practical steps to solve the problem', weight: 1 },
      { value: 'validation', label: 'Someone to listen and validate my feelings', weight: 2 },
      { value: 'distraction', label: 'Activities to distract and reset my mind', weight: 3 },
      { value: 'reflection', label: 'Quiet time for self-reflection', weight: 4 }
    ]
  },
  {
    id: 3,
    category: 'goals',
    question: "What's your primary wellness goal?",
    options: [
      { value: 'stress', label: 'Managing stress and anxiety', weight: 1 },
      { value: 'mood', label: 'Improving overall mood and happiness', weight: 2 },
      { value: 'relationships', label: 'Better relationships and communication', weight: 3 },
      { value: 'growth', label: 'Personal growth and self-understanding', weight: 4 }
    ]
  },
  {
    id: 4,
    category: 'communication',
    question: "How do you like to process difficult emotions?",
    options: [
      { value: 'talking', label: 'Talking through them with someone', weight: 1 },
      { value: 'writing', label: 'Writing or journaling about them', weight: 2 },
      { value: 'thinking', label: 'Thinking them through quietly', weight: 3 },
      { value: 'activity', label: 'Working through them with activities', weight: 4 }
    ]
  },
  {
    id: 5,
    category: 'support',
    question: "What type of encouragement motivates you most?",
    options: [
      { value: 'achievement', label: 'Recognition of progress and achievements', weight: 1 },
      { value: 'potential', label: 'Reminders of your strengths and potential', weight: 2 },
      { value: 'understanding', label: 'Feeling truly understood and heard', weight: 3 },
      { value: 'challenge', label: 'Gentle challenges to grow and improve', weight: 4 }
    ]
  },
  {
    id: 6,
    category: 'goals',
    question: "How do you prefer to set and track goals?",
    options: [
      { value: 'specific', label: 'Specific, measurable targets with deadlines', weight: 1 },
      { value: 'flexible', label: 'Flexible intentions that adapt to life', weight: 2 },
      { value: 'small', label: 'Small daily habits that build over time', weight: 3 },
      { value: 'intuitive', label: 'Following what feels right in the moment', weight: 4 }
    ]
  },
  {
    id: 7,
    category: 'emotional',
    question: "When facing a challenge, you typically:",
    options: [
      { value: 'analyze', label: 'Analyze the situation logically', weight: 1 },
      { value: 'feel', label: 'Process the emotions it brings up', weight: 2 },
      { value: 'act', label: 'Take action to address it immediately', weight: 3 },
      { value: 'seek', label: 'Seek advice from others', weight: 4 }
    ]
  },
  {
    id: 8,
    category: 'support',
    question: "How much emotional support do you typically need?",
    options: [
      { value: 'minimal', label: 'I prefer to handle things independently', weight: 1 },
      { value: 'occasional', label: 'I like check-ins when things get tough', weight: 2 },
      { value: 'regular', label: 'I appreciate regular emotional support', weight: 3 },
      { value: 'frequent', label: 'I thrive with frequent encouragement', weight: 4 }
    ]
  },
  {
    id: 9,
    category: 'communication',
    question: "What session length works best for you?",
    options: [
      { value: 'short', label: 'Quick check-ins (5-10 minutes)', weight: 1 },
      { value: 'medium', label: 'Moderate conversations (15-20 minutes)', weight: 2 },
      { value: 'long', label: 'Deep discussions (30+ minutes)', weight: 3 },
      { value: 'variable', label: 'It depends on what I need that day', weight: 4 }
    ]
  },
  {
    id: 10,
    category: 'goals',
    question: "What would success in your wellness journey look like?",
    options: [
      { value: 'peace', label: 'Feeling more at peace and centered', weight: 1 },
      { value: 'confident', label: 'Being more confident and self-assured', weight: 2 },
      { value: 'resilient', label: 'Handling life\'s ups and downs better', weight: 3 },
      { value: 'fulfilled', label: 'Living a more authentic, fulfilled life', weight: 4 }
    ]
  }
];

const categoryIcons = {
  communication: MessageCircle,
  emotional: Heart,
  goals: Target,
  support: Brain
};

export default function PersonalityQuiz({ onComplete, onSkip }: PersonalityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    const profile = analyzeAnswers(answers);
    setIsComplete(true);
    setTimeout(() => {
      onComplete(profile);
    }, 2000);
  };

  const analyzeAnswers = (answers: Record<number, string>): UserProfile => {
    // Analyze communication style
    const commAnswers = [answers[1], answers[4], answers[9]];
    const communicationStyle = determineCommunicationStyle(commAnswers);
    
    // Analyze emotional support needs
    const emotionalAnswers = [answers[2], answers[7], answers[8]];
    const emotionalSupport = determineEmotionalSupport(emotionalAnswers);
    
    // Analyze preferred tone
    const preferredTone = determinePreferredTone([answers[1], answers[5]]);
    
    // Extract goals and traits
    const primaryGoals = extractGoals([answers[3], answers[6], answers[10]]);
    const stressResponses = [answers[2]];
    const motivationFactors = [answers[5]];
    const sessionPreference = determineSessionPreference(answers[9]);
    const personalityTraits = extractPersonalityTraits(answers);

    return {
      communicationStyle,
      emotionalSupport,
      preferredTone,
      primaryGoals,
      stressResponses,
      motivationFactors,
      sessionPreference,
      personalityTraits
    };
  };

  const determineCommunicationStyle = (answers: string[]): 'direct' | 'gentle' | 'encouraging' | 'analytical' => {
    if (answers.includes('direct') || answers.includes('analyze')) return 'direct';
    if (answers.includes('gentle') || answers.includes('supportive')) return 'gentle';
    if (answers.includes('detailed') || answers.includes('thinking')) return 'analytical';
    return 'encouraging';
  };

  const determineEmotionalSupport = (answers: string[]): 'high' | 'moderate' | 'minimal' => {
    if (answers.includes('frequent') || answers.includes('regular')) return 'high';
    if (answers.includes('minimal')) return 'minimal';
    return 'moderate';
  };

  const determinePreferredTone = (answers: string[]): 'casual' | 'professional' | 'warm' | 'straightforward' => {
    if (answers.includes('supportive') || answers.includes('understanding')) return 'warm';
    if (answers.includes('direct') || answers.includes('achievement')) return 'straightforward';
    if (answers.includes('detailed') || answers.includes('analyze')) return 'professional';
    return 'casual';
  };

  const extractGoals = (answers: string[]): string[] => {
    const goalMap: Record<string, string> = {
      'stress': 'Stress Management',
      'mood': 'Mood Improvement',
      'relationships': 'Better Relationships',
      'growth': 'Personal Growth',
      'specific': 'Goal Achievement',
      'flexible': 'Adaptive Wellness',
      'small': 'Habit Building',
      'peace': 'Inner Peace',
      'confident': 'Self-Confidence',
      'resilient': 'Emotional Resilience',
      'fulfilled': 'Authentic Living'
    };
    
    return answers.map(answer => goalMap[answer]).filter(Boolean);
  };

  const determineSessionPreference = (answer: string): 'short' | 'medium' | 'long' => {
    if (answer === 'short') return 'short';
    if (answer === 'long') return 'long';
    return 'medium';
  };

  const extractPersonalityTraits = (answers: Record<number, string>): string[] => {
    const traits: string[] = [];
    
    if (answers[7] === 'analyze') traits.push('Analytical');
    if (answers[7] === 'feel') traits.push('Emotionally Aware');
    if (answers[4] === 'writing') traits.push('Reflective');
    if (answers[4] === 'talking') traits.push('Verbal Processor');
    if (answers[2] === 'practical') traits.push('Solution-Oriented');
    if (answers[8] === 'minimal') traits.push('Independent');
    if (answers[8] === 'frequent') traits.push('Community-Oriented');
    
    return traits;
  };

  const currentQ = quizQuestions[currentQuestion];
  const IconComponent = categoryIcons[currentQ.category];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const selectedAnswer = answers[currentQ.id];

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-8 max-w-md w-full text-center border border-blue-400/30">
          <div className="animate-bounce mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Profile Complete!</h3>
          <p className="text-blue-200">
            Creating your personalized wellness companion experience...
          </p>
          <div className="mt-6">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-8 max-w-2xl w-full border border-blue-400/30">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <IconComponent className="w-6 h-6 text-blue-300" />
              <h2 className="text-2xl font-bold text-white">Personality Assessment</h2>
            </div>
            <span className="text-blue-300 text-sm font-medium">
              {currentQuestion + 1} of {quizQuestions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-800/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
            {currentQ.question}
          </h3>
          
          <div className="space-y-4">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQ.id, option.value)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                  selectedAnswer === option.value
                    ? 'bg-blue-600/50 border-blue-400 text-white shadow-lg'
                    : 'bg-blue-800/20 border-blue-600/30 text-blue-100 hover:bg-blue-700/30 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {selectedAnswer === option.value && (
                    <CheckCircle className="w-5 h-5 text-blue-300" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-700/50 hover:bg-blue-600/50 disabled:bg-blue-800/30 disabled:text-blue-400 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            {onSkip && currentQuestion === 0 && (
              <button
                onClick={onSkip}
                className="px-6 py-3 text-blue-300 hover:text-white transition-colors"
              >
                Skip for now
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-blue-800 disabled:to-purple-800 disabled:text-blue-400 text-white rounded-xl transition-all disabled:cursor-not-allowed"
            >
              <span>{currentQuestion === quizQuestions.length - 1 ? 'Complete' : 'Next'}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}