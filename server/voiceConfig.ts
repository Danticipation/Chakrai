// Voice Configuration for Reflectibot

export const defaultVoiceId = "EkK5I93UQWFDigLMpZcX"; // James

export const baseVoices = [
  {
    name: "James",
    id: "EkK5I93UQWFDigLMpZcX",
    description: "Professional male voice",
    accent: "American",
    gender: "Male",
    default: true
  },
  {
    name: "Brian",
    id: "nPczCjzI2devNBz1zQrb",
    description: "Deep, resonant male voice",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Alexandra",
    id: "kdmDKE6EkgrWrrykO9Qt",
    description: "Clear female voice",
    accent: "American",
    gender: "Female"
  },
  {
    name: "Carla",
    id: "l32B8XDoylOsZKiSdfhE",
    description: "Warm female voice",
    accent: "American",
    gender: "Female"
  }
];

export function getVoiceById(id: string) {
  return baseVoices.find((voice) => voice.id === id) || baseVoices[0];
}

export function getDefaultVoice() {
  return baseVoices.find((voice) => voice.default) || baseVoices[0];
}