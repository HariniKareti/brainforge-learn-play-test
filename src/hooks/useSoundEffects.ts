import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'correct' | 'wrong' | 'click' | 'levelUp' | 'gameOver' | 'background';

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const useSoundEffects = (enabled: boolean = true) => {
  const backgroundRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!enabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [enabled]);

  const playSound = useCallback((sound: SoundType) => {
    if (!enabled) return;

    switch (sound) {
      case 'correct':
        playTone(523.25, 0.1, 'sine', 0.4); // C5
        setTimeout(() => playTone(659.25, 0.1, 'sine', 0.4), 100); // E5
        setTimeout(() => playTone(783.99, 0.15, 'sine', 0.4), 200); // G5
        break;
      case 'wrong':
        playTone(200, 0.3, 'sawtooth', 0.2);
        break;
      case 'click':
        playTone(800, 0.05, 'square', 0.1);
        break;
      case 'levelUp':
        [523.25, 587.33, 659.25, 783.99, 880].forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.15, 'sine', 0.3), i * 80);
        });
        break;
      case 'gameOver':
        [400, 350, 300, 250].forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.2, 'triangle', 0.3), i * 150);
        });
        break;
    }
  }, [enabled, playTone]);

  const startBackgroundMusic = useCallback(() => {
    if (!enabled || backgroundRef.current) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    
    backgroundRef.current = oscillator;
    gainRef.current = gainNode;
    
    oscillator.start();
  }, [enabled]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundRef.current) {
      backgroundRef.current.stop();
      backgroundRef.current = null;
      gainRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  return { playSound, startBackgroundMusic, stopBackgroundMusic };
};
