import { openai } from './openaiRetry';
import { storage } from './storage';
import type { VrEnvironment, VrSession, VrTherapeuticPlan, VrAccessibilityProfile } from '@shared/schema';

export interface VrTherapyRecommendation {
  environmentId: number;
  recommendationReason: string;
  adaptations: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    intensity: number;
    specialSettings: Record<string, any>;
  };
  therapeuticBenefits: string[];
  contraindications: string[];
  confidence: number;
}

export interface VrSessionAnalysis {
  effectivenessScore: number;
  stressReduction: number;
  engagement: number;
  comfort: number;
  achievements: string[];
  recommendations: string[];
  nextSessionSuggestions: VrTherapyRecommendation[];
}

export interface PersonalizedVrEnvironment {
  baseEnvironment: VrEnvironment;
  adaptations: {
    visualSettings: Record<string, any>;
    audioSettings: Record<string, any>;
    interactionSettings: Record<string, any>;
    comfortSettings: Record<string, any>;
  };
  therapeuticGoals: string[];
  estimatedDuration: number;
  difficultyLevel: number;
}

/**
 * Analyzes user's emotional state and therapeutic needs to recommend VR environments
 */
export async function generateVrRecommendations(
  userId: number,
  currentMood?: string,
  therapeuticGoals?: string[],
  sessionHistory?: VrSession[]
): Promise<VrTherapyRecommendation[]> {
  try {
    // Get user's VR progress and accessibility profile
    const [progress, accessibilityProfile, environments] = await Promise.all([
      storage.getUserVrProgress(userId),
      storage.getUserVrAccessibilityProfile(userId),
      storage.getVrEnvironments()
    ]);

    // Get recent mood entries for context
    const recentMoods = await storage.getMoodEntries(userId, 7);
    
    const analysisPrompt = `
You are a VR therapy specialist. Analyze the user's profile and recommend personalized VR therapeutic experiences.

User Context:
- Current mood: ${currentMood || 'Not specified'}
- Therapeutic goals: ${therapeuticGoals?.join(', ') || 'General wellness'}
- Recent emotional patterns: ${recentMoods.map(m => `${m.emotion} (${m.intensity}/10)`).join(', ')}
- VR experience level: ${progress.length > 0 ? 'Experienced' : 'Beginner'}
- Motion sensitivity: ${accessibilityProfile?.motionSensitivity || 'medium'}

Available VR environments: ${environments.map(env => 
  `${env.name} (${env.category}, ${env.difficulty}, ${env.duration}min) - ${env.description}`
).join('\n')}

Previous VR sessions: ${sessionHistory?.slice(0, 5).map(session => 
  `Environment: ${session.environmentId}, Duration: ${session.duration}s, Effectiveness: ${session.effectiveness}/10`
).join('\n') || 'None'}

Generate 3-5 personalized VR therapy recommendations. For each recommendation, provide:
1. Environment selection reasoning
2. Specific adaptations needed
3. Therapeutic benefits
4. Any contraindications
5. Confidence score (0.0-1.0)

Focus on progressive exposure therapy, mindfulness, stress reduction, and therapeutic goals.
Consider the user's experience level and accessibility needs.

Return as JSON array with fields: environmentId, recommendationReason, adaptations, therapeuticBenefits, contraindications, confidence.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const recommendations = JSON.parse(response.choices[0].message.content || '[]');
    
    return recommendations.map((rec: any) => ({
      environmentId: rec.environmentId,
      recommendationReason: rec.recommendationReason,
      adaptations: {
        difficulty: rec.adaptations?.difficulty || 'beginner',
        duration: rec.adaptations?.duration || 15,
        intensity: rec.adaptations?.intensity || 0.5,
        specialSettings: rec.adaptations?.specialSettings || {}
      },
      therapeuticBenefits: rec.therapeuticBenefits || [],
      contraindications: rec.contraindications || [],
      confidence: rec.confidence || 0.7
    }));

  } catch (error) {
    console.error('Error generating VR recommendations:', error);
    return [];
  }
}

/**
 * Analyzes a completed VR session for therapeutic effectiveness
 */
export async function analyzeVrSession(sessionId: number): Promise<VrSessionAnalysis> {
  try {
    const session = await storage.getVrSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const environment = await storage.getVrEnvironment(session.environmentId);
    const userProgress = await storage.getVrProgress(session.userId, session.environmentId);

    const analysisPrompt = `
Analyze this VR therapy session for therapeutic effectiveness:

Session Details:
- Environment: ${environment?.name} (${environment?.category})
- Duration: ${session.duration} seconds (planned: ${environment?.duration} minutes)
- Completion: ${session.completionStatus}
- User effectiveness rating: ${session.effectiveness}/10
- Stress levels: ${JSON.stringify(session.stressLevel)}
- Heart rate data: ${JSON.stringify(session.heartRate)}
- Interactions: ${JSON.stringify(session.interactions)}
- Side effects: ${session.sideEffects?.join(', ') || 'None reported'}
- User notes: ${session.notes || 'None'}

User Progress:
- Total sessions in this environment: ${userProgress?.sessionCount || 0}
- Average effectiveness: ${userProgress?.averageEffectiveness || 'N/A'}
- Best score: ${userProgress?.bestScore || 'N/A'}

Provide detailed analysis including:
1. Effectiveness score (0.0-1.0)
2. Stress reduction score (0.0-1.0)  
3. Engagement score (0.0-1.0)
4. Comfort score (0.0-1.0)
5. Achieved therapeutic goals
6. Recommendations for improvement
7. Suggestions for next sessions

Return as JSON with fields: effectivenessScore, stressReduction, engagement, comfort, achievements, recommendations, nextSessionSuggestions.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.2,
      max_tokens: 1500
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      effectivenessScore: analysis.effectivenessScore || 0.5,
      stressReduction: analysis.stressReduction || 0.5,
      engagement: analysis.engagement || 0.5,
      comfort: analysis.comfort || 0.5,
      achievements: analysis.achievements || [],
      recommendations: analysis.recommendations || [],
      nextSessionSuggestions: analysis.nextSessionSuggestions || []
    };

  } catch (error) {
    console.error('Error analyzing VR session:', error);
    return {
      effectivenessScore: 0.5,
      stressReduction: 0.5,
      engagement: 0.5,
      comfort: 0.5,
      achievements: [],
      recommendations: ['Session analysis unavailable. Please try again.'],
      nextSessionSuggestions: []
    };
  }
}

/**
 * Creates a personalized VR therapeutic plan based on user's conditions and goals
 */
export async function createPersonalizedVrPlan(
  userId: number,
  therapeuticGoal: string,
  targetConditions: string[],
  planDuration: number = 30 // days
): Promise<VrTherapeuticPlan> {
  try {
    const [environments, userProgress, accessibilityProfile, recentMoods] = await Promise.all([
      storage.getVrEnvironments(),
      storage.getUserVrProgress(userId),
      storage.getUserVrAccessibilityProfile(userId),
      storage.getMoodEntries(userId, 14)
    ]);

    const planPrompt = `
Create a comprehensive VR therapeutic plan for progressive treatment:

Therapeutic Goal: ${therapeuticGoal}
Target Conditions: ${targetConditions.join(', ')}
Plan Duration: ${planDuration} days
User Experience: ${userProgress.length > 0 ? 'Has VR experience' : 'VR beginner'}
Accessibility Needs: Motion sensitivity ${accessibilityProfile?.motionSensitivity || 'medium'}

Available VR Environments:
${environments.map(env => 
  `ID: ${env.id}, Name: ${env.name}, Category: ${env.category}, Difficulty: ${env.difficulty}, Duration: ${env.duration}min`
).join('\n')}

Recent emotional patterns: ${recentMoods.map(m => `${m.emotion} (intensity: ${m.intensity})`).slice(0, 10).join(', ')}

Design a progressive plan with:
1. Gradual exposure therapy progression
2. Appropriate difficulty scaling
3. Session frequency and timing
4. Therapeutic milestones
5. Adaptive settings for user comfort

Return as JSON with:
- planName: descriptive plan name
- environments: array of {environmentId, sessionCount, weekStart, adaptations}
- totalStages: number of plan stages
- estimatedDuration: total days
- adaptiveSettings: comfort and progression settings

Focus on evidence-based VR therapy approaches for the specified conditions.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: planPrompt }],
      temperature: 0.2,
      max_tokens: 2000
    });

    const planData = JSON.parse(response.choices[0].message.content || '{}');
    
    const plan = await storage.createVrTherapeuticPlan({
      userId,
      planName: planData.planName || `${therapeuticGoal} Plan`,
      therapeuticGoal,
      environments: planData.environments || [],
      totalStages: planData.totalStages || 4,
      estimatedDuration: planData.estimatedDuration || planDuration,
      adaptiveSettings: planData.adaptiveSettings || {}
    });

    return plan;

  } catch (error) {
    console.error('Error creating VR therapeutic plan:', error);
    throw new Error('Failed to create therapeutic plan');
  }
}

/**
 * Adapts VR environment settings based on user's accessibility profile and preferences
 */
export async function personalizeVrEnvironment(
  environmentId: number,
  userId: number,
  sessionGoals?: string[]
): Promise<PersonalizedVrEnvironment> {
  try {
    const [environment, accessibilityProfile, progress] = await Promise.all([
      storage.getVrEnvironment(environmentId),
      storage.getUserVrAccessibilityProfile(userId),
      storage.getVrProgress(userId, environmentId)
    ]);

    if (!environment) {
      throw new Error('Environment not found');
    }

    const adaptationPrompt = `
Personalize this VR environment for the user's needs:

Environment: ${environment.name}
Category: ${environment.category}
Base difficulty: ${environment.difficulty}
Duration: ${environment.duration} minutes
Description: ${environment.description}

User Profile:
- Motion sensitivity: ${accessibilityProfile?.motionSensitivity || 'medium'}
- Comfort settings: ${JSON.stringify(accessibilityProfile?.comfortSettings || {})}
- Visual adjustments: ${JSON.stringify(accessibilityProfile?.visualAdjustments || {})}
- Audio preferences: ${JSON.stringify(accessibilityProfile?.audioPreferences || {})}
- Previous sessions: ${progress?.sessionCount || 0}
- Best performance: ${progress?.bestScore || 'N/A'}

Session Goals: ${sessionGoals?.join(', ') || 'General therapeutic benefit'}

Provide specific adaptations for:
1. Visual settings (contrast, brightness, field of view)
2. Audio settings (volume, spatial audio, voice guidance)
3. Interaction settings (movement speed, control sensitivity)
4. Comfort settings (snap turning, teleportation vs smooth movement)

Return as JSON with fields: visualSettings, audioSettings, interactionSettings, comfortSettings, therapeuticGoals, estimatedDuration, difficultyLevel.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: adaptationPrompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    const adaptations = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      baseEnvironment: environment,
      adaptations: {
        visualSettings: adaptations.visualSettings || {},
        audioSettings: adaptations.audioSettings || {},
        interactionSettings: adaptations.interactionSettings || {},
        comfortSettings: adaptations.comfortSettings || {}
      },
      therapeuticGoals: adaptations.therapeuticGoals || sessionGoals || [],
      estimatedDuration: adaptations.estimatedDuration || environment.duration,
      difficultyLevel: adaptations.difficultyLevel || 0.5
    };

  } catch (error) {
    console.error('Error personalizing VR environment:', error);
    return {
      baseEnvironment: environment!,
      adaptations: {
        visualSettings: {},
        audioSettings: {},
        interactionSettings: {},
        comfortSettings: {}
      },
      therapeuticGoals: sessionGoals || [],
      estimatedDuration: environment!.duration,
      difficultyLevel: 0.5
    };
  }
}

/**
 * Monitors VR session in real-time for safety and effectiveness
 */
export async function monitorVrSession(
  sessionId: number,
  heartRate?: number,
  stressLevel?: number,
  userInteractions?: any[]
): Promise<{
  safetyWarnings: string[];
  adaptationSuggestions: string[];
  continueSession: boolean;
}> {
  try {
    const session = await storage.getVrSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const monitoringPrompt = `
Monitor this ongoing VR therapy session for safety and effectiveness:

Session Duration: ${Date.now() - new Date(session.startTime).getTime()}ms
Current Heart Rate: ${heartRate || 'Not available'}
Current Stress Level: ${stressLevel || 'Not available'} (1-10 scale)
User Interactions: ${JSON.stringify(userInteractions || [])}
Side Effects Reported: ${session.sideEffects?.join(', ') || 'None'}

Provide real-time guidance:
1. Safety warnings (motion sickness, fatigue, stress)
2. Adaptation suggestions for better experience
3. Whether to continue or pause session

Return as JSON with: safetyWarnings[], adaptationSuggestions[], continueSession (boolean).
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: monitoringPrompt }],
      temperature: 0.1,
      max_tokens: 500
    });

    const monitoring = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      safetyWarnings: monitoring.safetyWarnings || [],
      adaptationSuggestions: monitoring.adaptationSuggestions || [],
      continueSession: monitoring.continueSession !== false
    };

  } catch (error) {
    console.error('Error monitoring VR session:', error);
    return {
      safetyWarnings: ['Unable to monitor session'],
      adaptationSuggestions: [],
      continueSession: true
    };
  }
}

/**
 * Generates therapeutic VR environments based on specific conditions and goals
 */
export async function generateCustomVrEnvironment(
  therapeuticGoal: string,
  targetCondition: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<Partial<VrEnvironment>> {
  try {
    const generationPrompt = `
Design a custom VR therapeutic environment:

Therapeutic Goal: ${therapeuticGoal}
Target Condition: ${targetCondition}
Difficulty Level: ${difficulty}

Create a detailed VR environment specification including:
1. Environment name and description
2. Therapeutic category (mindfulness, exposure, relaxation, etc.)
3. Detailed scene description
4. Audio elements and guidance
5. Interaction elements
6. Therapeutic goals and benefits
7. Contraindications and safety considerations
8. Accessibility features

Return as JSON with VR environment fields: name, description, category, scenePath, audioPath, instructions, therapeuticGoals, contraindications, vrSettings, accessibility, tags.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: generationPrompt }],
      temperature: 0.4,
      max_tokens: 1500
    });

    const environmentData = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      name: environmentData.name || `${therapeuticGoal} Environment`,
      description: environmentData.description || '',
      category: environmentData.category || 'mindfulness',
      difficulty,
      duration: difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30,
      environmentType: 'vr',
      scenePath: environmentData.scenePath || `/scenes/${environmentData.name?.toLowerCase().replace(/\s+/g, '_')}`,
      audioPath: environmentData.audioPath || null,
      instructions: environmentData.instructions || [],
      therapeuticGoals: environmentData.therapeuticGoals || [],
      contraindications: environmentData.contraindications || [],
      vrSettings: environmentData.vrSettings || {},
      accessibility: environmentData.accessibility || {},
      tags: environmentData.tags || [therapeuticGoal, targetCondition, difficulty]
    };

  } catch (error) {
    console.error('Error generating custom VR environment:', error);
    throw new Error('Failed to generate custom environment');
  }
}