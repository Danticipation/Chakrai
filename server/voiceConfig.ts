// Voice Configuration for TraI

export const defaultVoiceId = "EkK5I93UQWFDigLMpZcX"; // James

export const baseVoices = [
  // Original voices (4)
  {
    name: "James",
    id: "EkK5I93UQWFDigLMpZcX",
    description: "Professional and calming",
    accent: "American",
    gender: "Male",
    default: true
  },
  {
    name: "Brian",
    id: "nPczCjzI2devNBz1zQrb",
    description: "Deep and resonant",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Alexandra",
    id: "kdmDKE6EkgrWrrykO9Qt",
    description: "Clear and articulate",
    accent: "American",
    gender: "Female"
  },
  {
    name: "Carla",
    id: "l32B8XDoylOsZKiSdfhE",
    description: "Warm and empathetic",
    accent: "American",
    gender: "Female"
  },
  // New voices added (4)
  {
    name: "Hope",
    id: "s3WpFb3KxhwHdqCNjxE1",
    description: "Warm and encouraging",
    accent: "American",
    gender: "Female"
  },
  {
    name: "Charlotte",
    id: "XB0fDUnXU5powFXDhCwa",
    description: "Gentle and empathetic",
    accent: "American",
    gender: "Female"
  },
  {
    name: "Bronson",
    id: "Yko7PKHZNXotIFUBG7I9",
    description: "Confident and reassuring",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Marcus",
    id: "y3kKRaK2dnn3OgKDBckk",
    description: "Smooth and supportive",
    accent: "American",
    gender: "Male"
  }
];

export function getVoiceById(id: string) {
  return baseVoices.find((voice) => voice.id === id) || baseVoices[0];
}

export function getVoiceByName(name: string) {
  return baseVoices.find((voice) => voice.name.toLowerCase() === name.toLowerCase()) || baseVoices[0];
}

export function getDefaultVoice() {
  return baseVoices.find((voice) => voice.default) || baseVoices[0];
}

export function getVoicesByGender(gender: string) {
  return baseVoices.filter((voice) => voice.gender.toLowerCase() === gender.toLowerCase());
}

export function getMaleVoices() {
  return getVoicesByGender("Male");
}

export function getFemaleVoices() {
  return getVoicesByGender("Female");
}

export function getAllVoiceIds() {
  return baseVoices.map((voice) => voice.id);
}

export function getAllVoiceNames() {
  return baseVoices.map((voice) => voice.name);
}

// Voice mapping for frontend compatibility
export const voiceMapping: Record<string, string> = {
  james: "EkK5I93UQWFDigLMpZcX",
  brian: "nPczCjzI2devNBz1zQrb", 
  alexandra: "kdmDKE6EkgrWrrykO9Qt",
  carla: "l32B8XDoylOsZKiSdfhE",
  hope: "s3WpFb3KxhwHdqCNjxE1",
  charlotte: "XB0fDUnXU5powFXDhCwa",
  bronson: "Yko7PKHZNXotIFUBG7I9",
  marcus: "y3kKRaK2dnn3OgKDBckk"
};

export function getVoiceIdFromFrontend(frontendVoiceName: string): string {
  return voiceMapping[frontendVoiceName.toLowerCase()] || defaultVoiceId;
}