import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Settings, Heart, Brain, Waves, Wind, TreePine, Droplets, Zap, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AmbientSound {
  id: string;
  name: string;
  category: 'nature' | 'urban' | 'white-noise' | 'binaural' | 'meditation';
  moodTags: string[];
  description: string;
  icon: React.ReactNode;
  audioUrl: string;
  recommendedFor: string[];
  volume: number;
}

interface UserMoodData {
  currentMood: string;
  energy: number;
  stress: number;
  focus: number;
  anxiety: number;
}

const DynamicAmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundId, setCurrentSoundId] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fadeIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Fetch user's current mood data for adaptive recommendations
  const { data: moodData } = useQuery<UserMoodData>({
    queryKey: ['/api/user-mood-current'],
    enabled: adaptiveMode
  });

  const ambientSounds: AmbientSound[] = [
    {
      id: 'rain-forest',
      name: 'Forest Rain',
      category: 'nature',
      moodTags: ['calm', 'stressed', 'anxious', 'overwhelmed'],
      description: 'Layered rain sounds with gentle forest ambiance',
      icon: <TreePine className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/rain-forest',
      recommendedFor: ['anxiety', 'stress relief', 'sleep'],
      volume: 0.7
    },
    {
      id: 'ocean-waves',
      name: 'Ocean Waves',
      category: 'nature',
      moodTags: ['peaceful', 'sad', 'contemplative', 'tired'],
      description: 'Realistic ocean waves with foam and deep water sounds',
      icon: <Waves className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/ocean-waves',
      recommendedFor: ['meditation', 'deep breathing', 'relaxation'],
      volume: 0.6
    },
    {
      id: 'wind-chimes',
      name: 'Wind Chimes',
      category: 'meditation',
      moodTags: ['restless', 'agitated', 'focused', 'creative'],
      description: 'Peaceful wind chimes with gentle breeze sounds',
      icon: <Wind className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/wind-chimes',
      recommendedFor: ['focus', 'creativity', 'mindfulness'],
      volume: 0.4
    },
    {
      id: 'binaural-alpha',
      name: 'Alpha Waves',
      category: 'binaural',
      moodTags: ['unfocused', 'scattered', 'learning', 'studying'],
      description: 'Alpha frequency binaural beats for focus',
      icon: <Brain className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/binaural-alpha',
      recommendedFor: ['concentration', 'study', 'problem solving'],
      volume: 0.3
    },
    {
      id: 'heart-rhythm',
      name: 'Heart Coherence',
      category: 'binaural',
      moodTags: ['anxious', 'panicked', 'nervous', 'stressed'],
      description: 'Rhythmic tones for heart rate coherence',
      icon: <Heart className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/heart-coherence',
      recommendedFor: ['anxiety relief', 'breathing exercises', 'calm'],
      volume: 0.5
    },
    {
      id: 'white-noise',
      name: 'Pure White Noise',
      category: 'white-noise',
      moodTags: ['distracted', 'noisy-environment', 'sleep-issues'],
      description: 'Clean white noise for masking distractions',
      icon: <Zap className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/white-noise',
      recommendedFor: ['sleep', 'concentration', 'noise masking'],
      volume: 0.4
    },
    {
      id: 'morning-birds',
      name: 'Morning Birds',
      category: 'nature',
      moodTags: ['tired', 'groggy', 'unmotivated', 'depressed'],
      description: 'Uplifting bird songs with gentle morning sounds',
      icon: <Sun className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/morning-birds',
      recommendedFor: ['energy boost', 'motivation', 'morning routine'],
      volume: 0.6
    },
    {
      id: 'water-drops',
      name: 'Water Droplets',
      category: 'meditation',
      moodTags: ['tense', 'overthinking', 'racing-thoughts'],
      description: 'Rhythmic water drops in a peaceful cave',
      icon: <Droplets className="w-5 h-5" />,
      audioUrl: '/api/ambient-audio/water-drops',
      recommendedFor: ['meditation', 'thought clearing', 'presence'],
      volume: 0.5
    }
  ];

  // Get AI-recommended sounds based on current mood
  const getRecommendedSounds = (): AmbientSound[] => {
    if (!moodData || !adaptiveMode) return ambientSounds;

    const { currentMood, energy, stress, anxiety, focus } = moodData;
    
    // Score sounds based on mood alignment
    return ambientSounds
      .map(sound => {
        let score = 0;
        
        // Mood tag matching
        if (sound.moodTags.includes(currentMood.toLowerCase())) score += 3;
        
        // Stress-based recommendations
        if (stress > 7 && sound.category === 'nature') score += 2;
        if (stress > 8 && sound.id === 'heart-rhythm') score += 3;
        
        // Anxiety-based recommendations
        if (anxiety > 6 && sound.moodTags.includes('anxious')) score += 2;
        
        // Energy-based recommendations
        if (energy < 4 && sound.id === 'morning-birds') score += 2;
        if (energy > 7 && sound.category === 'binaural') score += 1;
        
        // Focus-based recommendations
        if (focus < 5 && sound.category === 'binaural') score += 2;
        if (focus < 3 && sound.id === 'white-noise') score += 2;
        
        return { ...sound, score };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  };

  const filteredSounds = selectedCategory === 'all' 
    ? getRecommendedSounds()
    : getRecommendedSounds().filter(sound => sound.category === selectedCategory);

  const initializeAudio = (sound: AmbientSound) => {
    if (!audioRefs.current[sound.id]) {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'none'; // Changed from 'metadata' to avoid early loading
      audio.crossOrigin = 'anonymous';
      // Add more detailed error logging
      audio.onerror = (error) => {
        console.error(`Audio error for ${sound.name}:`, error);
        console.error('Audio source:', audio.src);
        console.error('Audio ready state:', audio.readyState);
        console.error('Audio network state:', audio.networkState);
      };
      audio.onloadstart = () => console.log(`Loading started for ${sound.name}`);
      audio.oncanplay = () => console.log(`Can play ${sound.name}`);
      audioRefs.current[sound.id] = audio;
    }
    return audioRefs.current[sound.id];
  };

  const fadeInAudio = (audio: HTMLAudioElement, targetVolume: number, duration: number = 2000) => {
    audio.volume = 0;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(targetVolume, volumeStep * currentStep);
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return interval;
  };

  const fadeOutAudio = (audio: HTMLAudioElement, duration: number = 1000) => {
    const initialVolume = audio.volume;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = initialVolume / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, initialVolume - (volumeStep * currentStep));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        audio.pause();
      }
    }, stepTime);

    return interval;
  };

  const playSound = async (sound: AmbientSound) => {
    setIsLoading(true);
    
    try {
      // Stop any currently playing sound
      if (currentSoundId && audioRefs.current[currentSoundId]) {
        const currentAudio = audioRefs.current[currentSoundId];
        if (fadeIntervals.current[currentSoundId]) {
          clearInterval(fadeIntervals.current[currentSoundId]);
        }
        fadeIntervals.current[currentSoundId] = fadeOutAudio(currentAudio);
      }

      const audio = initializeAudio(sound);
      
      // Set up audio source if not already set
      if (!audio.src) {
        audio.src = sound.audioUrl;
      }

      // Add error handling for audio loading
      audio.onerror = (error) => {
        console.error('Audio loading error:', error);
        generateAmbientSound(sound);
      };

      try {
        // Wait for user interaction first
        if (typeof audio.play === 'function') {
          const playPromise = audio.play();
          if (playPromise) {
            await playPromise;
          }
        }
        
        // Fade in the new sound
        const targetVolume = sound.volume * masterVolume;
        fadeIntervals.current[sound.id] = fadeInAudio(audio, targetVolume);
        
        setCurrentSoundId(sound.id);
        setIsPlaying(true);
        console.log('Successfully playing ambient sound:', sound.name);
      } catch (playError) {
        console.error('Audio play error, falling back to generated sound:', playError);
        // Try the fallback procedural generation
        try {
          generateAmbientSound(sound);
          setCurrentSoundId(sound.id);
          setIsPlaying(true);
          console.log('Fallback audio generation successful for:', sound.name);
        } catch (fallbackError) {
          console.error('Fallback audio generation failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error playing ambient sound:', error);
      generateAmbientSound(sound);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAmbientSound = (sound: AmbientSound) => {
    // Generate procedural ambient sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = sound.volume * masterVolume;

    // Different sound generation based on type
    switch (sound.category) {
      case 'white-noise':
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        break;
        
      case 'binaural':
        const freq1 = 440;
        const freq2 = 444; // 4Hz difference for alpha waves
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const merger = audioContext.createChannelMerger(2);
        
        osc1.frequency.value = freq1;
        osc2.frequency.value = freq2;
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        osc1.connect(merger, 0, 0);
        osc2.connect(merger, 0, 1);
        merger.connect(gainNode);
        
        osc1.start();
        osc2.start();
        break;
    }
  };

  const stopSound = () => {
    if (currentSoundId && audioRefs.current[currentSoundId]) {
      const audio = audioRefs.current[currentSoundId];
      if (fadeIntervals.current[currentSoundId]) {
        clearInterval(fadeIntervals.current[currentSoundId]);
      }
      fadeIntervals.current[currentSoundId] = fadeOutAudio(audio);
    }
    setIsPlaying(false);
    setCurrentSoundId(null);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopSound();
    } else if (currentSoundId) {
      const sound = ambientSounds.find(s => s.id === currentSoundId);
      if (sound) playSound(sound);
    }
  };

  // Update volume for currently playing sound
  useEffect(() => {
    if (currentSoundId && audioRefs.current[currentSoundId]) {
      const audio = audioRefs.current[currentSoundId];
      const sound = ambientSounds.find(s => s.id === currentSoundId);
      if (sound) {
        audio.volume = sound.volume * masterVolume;
      }
    }
  }, [masterVolume, currentSoundId]);

  const categories = [
    { id: 'all', name: 'All Sounds', icon: <Settings className="w-4 h-4" /> },
    { id: 'nature', name: 'Nature', icon: <TreePine className="w-4 h-4" /> },
    { id: 'meditation', name: 'Meditation', icon: <Heart className="w-4 h-4" /> },
    { id: 'binaural', name: 'Binaural', icon: <Brain className="w-4 h-4" /> },
    { id: 'white-noise', name: 'White Noise', icon: <Zap className="w-4 h-4" /> }
  ];

  return (
    <div className="h-full theme-background p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="theme-card backdrop-blur-sm rounded-2xl p-8 border-2 border-silver shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold theme-text mb-2">Dynamic Ambient Sound</h2>
              <p className="theme-text-secondary">
                AI-curated ambient sounds that adapt to your current mood and wellness needs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm theme-text">Adaptive</span>
                <button
                  onClick={() => setAdaptiveMode(!adaptiveMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    adaptiveMode ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    adaptiveMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 theme-card rounded-lg border border-silver hover:border-silver-light transition-colors"
              >
                <Settings className="w-5 h-5 theme-text" />
              </button>
            </div>
          </div>

          {/* Master Controls */}
          <div className="theme-card rounded-xl p-6 mb-8 border border-silver">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold theme-text">Audio Controls</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  disabled={!currentSoundId || isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 border border-silver"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Testing ocean waves audio...');
                    const testAudio = new Audio('/api/ambient-audio/rain-forest');
                    testAudio.volume = 0.4;
                    testAudio.play().then(() => {
                      console.log('Ocean waves test successful!');
                      setTimeout(() => {
                        testAudio.pause();
                        console.log('Test audio stopped');
                      }, 4000);
                    }).catch(e => {
                      console.error('Ocean waves test failed:', e);
                    });
                  }}
                  className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors border border-silver text-sm"
                >
                  Test Forest Rain
                </button>
                <button
                  onClick={stopSound}
                  disabled={!isPlaying}
                  className="p-3 theme-card rounded-xl border border-silver hover:border-silver-light transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-5 h-5 theme-text" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <VolumeX className="w-5 h-5 theme-text" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <Volume2 className="w-5 h-5 theme-text" />
              <span className="text-sm theme-text min-w-[3rem]">{Math.round(masterVolume * 100)}%</span>
            </div>
            
            {currentSoundId && (
              <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-300">
                  Now playing: {ambientSounds.find(s => s.id === currentSoundId)?.name}
                </p>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'theme-card border-silver hover:border-silver-light'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood-Based Recommendations */}
          {adaptiveMode && moodData && (
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-semibold theme-text mb-3">Recommended for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm theme-text">
                  <span className="opacity-80">Current mood: </span>
                  <span className="font-semibold capitalize">{moodData.currentMood}</span>
                </div>
                <div className="text-sm theme-text">
                  <span className="opacity-80">Stress level: </span>
                  <span className="font-semibold">{moodData.stress}/10</span>
                </div>
              </div>
            </div>
          )}

          {/* Sound Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSounds.map((sound, index) => (
              <div
                key={sound.id}
                className={`theme-card rounded-xl p-6 border-2 transition-all cursor-pointer hover:border-silver-light ${
                  currentSoundId === sound.id ? 'border-blue-500 bg-blue-500/10' : 'border-silver'
                } ${adaptiveMode && index < 3 ? 'ring-2 ring-purple-500/30' : ''}`}
                onClick={() => playSound(sound)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${
                      currentSoundId === sound.id ? 'bg-blue-500 text-white' : 'theme-card border border-silver'
                    }`}>
                      {sound.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold theme-text">{sound.name}</h4>
                      <p className="text-sm theme-text-secondary capitalize">{sound.category}</p>
                    </div>
                  </div>
                  {adaptiveMode && index < 3 && (
                    <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                      AI Pick
                    </div>
                  )}
                </div>
                
                <p className="text-sm theme-text-secondary mb-4">{sound.description}</p>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {sound.recommendedFor.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-8 theme-card rounded-xl p-6 border border-silver">
              <h3 className="text-lg font-semibold theme-text mb-4">Audio Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm theme-text mb-2">Auto-fade duration</label>
                  <select className="w-full p-3 theme-card border border-silver rounded-lg">
                    <option value="1000">1 second</option>
                    <option value="2000" selected>2 seconds</option>
                    <option value="3000">3 seconds</option>
                    <option value="5000">5 seconds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm theme-text mb-2">Quality</label>
                  <select className="w-full p-3 theme-card border border-silver rounded-lg">
                    <option value="standard">Standard (faster)</option>
                    <option value="high" selected>High Quality</option>
                    <option value="lossless">Lossless (slower)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicAmbientSound;