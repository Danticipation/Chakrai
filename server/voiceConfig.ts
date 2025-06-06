// Voice Configuration for Reflectibot

export const defaultVoiceId = "iCrDUkL56s3C8sCRl7wb"; // Hope

export const baseVoices = [
  {
    name: "Hope",
    id: "iCrDUkL56s3C8sCRl7wb",
    description: "Warm, soothing, captivating American female",
    accent: "American",
    gender: "Female",
    default: true
  },
  {
    name: "Ophelia",
    id: "FA6HhUjVbervLw2rNl8M",
    description: "Calm, articulate British female",
    accent: "British",
    gender: "Female"
  },
  {
    name: "Alice",
    id: "Xb7hH8MSUJpSbSDYk0k2",
    description: "Confident, friendly British female",
    accent: "British",
    gender: "Female"
  },
  {
    name: "Lily",
    id: "pFZP5JQG7iQjIQuC4Bku",
    description: "Warm, engaging British female",
    accent: "British", 
    gender: "Female"
  },
  {
    name: "Sarah",
    id: "EXAVITQu4vr4xnSDxMaL",
    description: "Soft, gentle American female",
    accent: "American",
    gender: "Female"
  },
  {
    name: "Rachel",
    id: "21m00Tcm4TlvDq8ikWAM",
    description: "Calm, professional American female",
    accent: "American",
    gender: "Female"
  },
  {
    name: "Adam",
    id: "pNInz6obpgDQGcFmaJgB",
    description: "Deep, resonant American male",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Antoni",
    id: "ErXwobaYiN019PkySvjV",
    description: "Well-rounded American male",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Arnold",
    id: "VR6AewLTigWG4xSOukaG",
    description: "Crisp, authoritative American male",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Josh",
    id: "TxGEqnHWrfWFTfGW9XjX",
    description: "Deep, serious American male",
    accent: "American",
    gender: "Male"
  },
  {
    name: "Sam",
    id: "yoZ06aMxZJJ28mfd3POQ",
    description: "Raspy, casual American male",
    accent: "American",
    gender: "Male"
  }
];

export function getVoiceById(id: string) {
  return baseVoices.find((voice) => voice.id === id) || baseVoices[0];
}

export function getDefaultVoice() {
  return baseVoices.find((voice) => voice.default) || baseVoices[0];
}