export const speakWithElevenLabs = async (text: string): Promise<void> => {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`TTS API failed with status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
};

// BROWSER TTS DISABLED - ELEVENLABS ONLY
export const speakWithBrowserTTS = (text: string): Promise<void> => {
  return Promise.reject(new Error('Browser TTS disabled - ElevenLabs only'));
};