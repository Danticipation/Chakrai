// Current 8-voice system for TrAI Mental Wellness Companion
export interface VoiceProfile {
  voiceId: string;
  name: string;
  emotion: string;
  characteristics: string[];
  gender: 'male' | 'female';
}

export const voiceProfiles: VoiceProfile[] = [
  // Male voices (4)
  {
    voiceId: "EkK5I93UQWFDigLMpZcX", // James
    name: "James - Professional & Calming",
    emotion: "professional",
    characteristics: ["professional", "calming", "therapeutic"],
    gender: "male"
  },
  {
    voiceId: "nPczCjzI2devNBz1zQrb", // Brian
    name: "Brian - Deep & Resonant",
    emotion: "calm",
    characteristics: ["deep", "resonant", "grounding"],
    gender: "male"
  },
  {
    voiceId: "Yko7PKHZNXotIFUBG7I9", // Bronson
    name: "Bronson - Confident & Reassuring",
    emotion: "confident",
    characteristics: ["confident", "reassuring", "supportive"],
    gender: "male"
  },
  {
    voiceId: "y3kKRaK2dnn3OgKDBckk", // Marcus
    name: "Marcus - Smooth & Supportive",
    emotion: "supportive",
    characteristics: ["smooth", "supportive", "understanding"],
    gender: "male"
  },
  // Female voices (4)
  {
    voiceId: "kdmDKE6EkgrWrrykO9Qt", // Alexandra
    name: "Alexandra - Clear & Articulate",
    emotion: "clear",
    characteristics: ["clear", "articulate", "professional"],
    gender: "female"
  },
  {
    voiceId: "l32B8XDoylOsZKiSdfhE", // Carla
    name: "Carla - Warm & Empathetic",
    emotion: "empathetic",
    characteristics: ["warm", "empathetic", "caring"],
    gender: "female"
  },
  {
    voiceId: "s3WpFb3KxhwHdqCNjxE1", // Hope
    name: "Hope - Warm & Encouraging",
    emotion: "encouraging",
    characteristics: ["warm", "encouraging", "uplifting"],
    gender: "female"
  },
  {
    voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte
    name: "Charlotte - Gentle & Empathetic",
    emotion: "gentle",
    characteristics: ["gentle", "empathetic", "soothing"],
    gender: "female"
  }
];

export function selectVoiceForMood(mood: string, userPreference?: string): string {
  // If user has selected a specific voice, use that
  if (userPreference) {
    const selectedProfile = voiceProfiles.find(v => v.name.toLowerCase().includes(userPreference.toLowerCase()));
    if (selectedProfile) return selectedProfile.voiceId;
  }

  // Map mood to appropriate voice based on current 8-voice system
  const moodToVoice: Record<string, string> = {
    "excited": "s3WpFb3KxhwHdqCNjxE1", // Hope - encouraging
    "happy": "s3WpFb3KxhwHdqCNjxE1", // Hope - encouraging
    "calm": "nPczCjzI2devNBz1zQrb", // Brian - deep & resonant
    "peaceful": "XB0fDUnXU5powFXDhCwa", // Charlotte - gentle
    "reflective": "nPczCjzI2devNBz1zQrb", // Brian - deep & resonant
    "contemplative": "EkK5I93UQWFDigLMpZcX", // James - professional
    "anxious": "l32B8XDoylOsZKiSdfhE", // Carla - warm & empathetic
    "stressed": "XB0fDUnXU5powFXDhCwa", // Charlotte - gentle
    "supportive": "y3kKRaK2dnn3OgKDBckk", // Marcus - supportive
    "professional": "EkK5I93UQWFDigLMpZcX", // James - professional
    "confident": "Yko7PKHZNXotIFUBG7I9", // Bronson - confident
    "clear": "kdmDKE6EkgrWrrykO9Qt", // Alexandra - clear
    "neutral": "EkK5I93UQWFDigLMpZcX" // James - default
  };

  return moodToVoice[mood.toLowerCase()] || "EkK5I93UQWFDigLMpZcX"; // Default to James
}

export function getVoiceSettings(mood: string, userPreference?: string) {
  const voiceId = selectVoiceForMood(mood, userPreference);
  
  // Base settings for TrAI therapeutic conversations
  const baseSettings = {
    voiceId,
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true
  };

  // Mood-based voice parameter adjustments for therapeutic responses
  switch (mood.toLowerCase()) {
    case "excited":
    case "happy":
      return {
        ...baseSettings,
        stability: 0.3, // More variation for excitement
        style: 0.2 // Slightly more expressive
      };
    
    case "calm":
    case "peaceful":
    case "reflective":
      return {
        ...baseSettings,
        stability: 0.8, // Very stable for calmness
        style: 0.0 // Neutral expression
      };
    
    case "anxious":
    case "stressed":
      return {
        ...baseSettings,
        stability: 0.7, // Stable but gentle
        similarityBoost: 0.8, // Higher similarity for consistency
        style: -0.1 // Slightly softer
      };

    case "supportive":
    case "empathetic":
      return {
        ...baseSettings,
        stability: 0.6,
        similarityBoost: 0.8,
        style: 0.1 // Slightly more warm
      };

    case "professional":
    case "clear":
      return {
        ...baseSettings,
        stability: 0.7,
        similarityBoost: 0.75,
        style: 0.0 // Neutral professional tone
      };
    
    default:
      return baseSettings;
  }
}

// Helper function to get voice by name for user preference
export function getVoiceByName(name: string): VoiceProfile | undefined {
  return voiceProfiles.find(voice => 
    voice.name.toLowerCase().includes(name.toLowerCase())
  );
}

// Helper function to get voices by gender
export function getVoicesByGender(gender: 'male' | 'female'): VoiceProfile[] {
  return voiceProfiles.filter(voice => voice.gender === gender);
}

// Helper function to get voices by emotion
export function getVoicesByEmotion(emotion: string): VoiceProfile[] {
  return voiceProfiles.filter(voice => 
    voice.emotion === emotion || 
    voice.characteristics.includes(emotion)
  );
}