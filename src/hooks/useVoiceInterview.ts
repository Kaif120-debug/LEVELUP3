import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceState =
  | 'idle'
  | 'ai_thinking'
  | 'ai_speaking'
  | 'listening'
  | 'processing'
  | 'next_question'
  | 'completed';

export type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface UseVoiceInterviewOptions {
  onTranscriptFinalized?: (finalText: string) => void;
  onError?: (errorMsg: string) => void;
}

export function useVoiceInterview(options: UseVoiceInterviewOptions = {}) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<MicPermissionState>('prompt');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speakingDuration, setSpeakingDuration] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speakingTimerRef = useRef<any>(null);

  // Check browser SpeechRecognition & SpeechSynthesis support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasTTS = 'speechSynthesis' in window;

    if (!SpeechRec || !hasTTS) {
      setIsSupported(false);
      setMicPermission('unsupported');
    }
  }, []);

  // Request Microphone Permission
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setMicPermission('unsupported');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      // Release initial test track
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: any) {
      console.warn('Microphone permission denied or unavailable:', err);
      setMicPermission('denied');
      return false;
    }
  }, []);

  // Audio Visualizer setup when listening
  const setupAudioVisualizer = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('Could not initialize audio visualizer:', e);
    }
  }, []);

  const cleanupAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Text-To-Speech (TTS) Engine
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      setVoiceState('ai_speaking');

      // If recognition was listening, stop it while AI speaks
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      cleanupAudioVisualizer();

      // Clean text of markdown/brackets for smoother speech
      const spokenText = text
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'code snippet')
        .replace(/[*_~#]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .trim();

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen') ||
            v.name.includes('Alex'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) {
          onEnd();
        }
      };

      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event);
        setIsSpeaking(false);
        if (onEnd) {
          onEnd();
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [cleanupAudioVisualizer]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Speech-To-Text (STT) Engine
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      setMicPermission('unsupported');
      return;
    }

    // Stop speaking if AI was speaking
    stopSpeaking();

    // Reset transcripts and timer
    setInterimTranscript('');
    setSpeakingDuration(0);

    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
    }
    speakingTimerRef.current = setInterval(() => {
      setSpeakingDuration((prev) => prev + 1);
    }, 1000);

    // Setup visualizer
    setupAudioVisualizer();

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState('listening');
        setMicPermission('granted');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans + ' ';
          } else {
            interim += trans;
          }
        }

        if (final) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${final.trim()}` : final.trim()));
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermission('denied');
          setIsListening(false);
          cleanupAudioVisualizer();
        }
      };

      recognition.onend = () => {
        // Only set isListening false if not intentionally restarted
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
      setIsListening(false);
      cleanupAudioVisualizer();
    }
  }, [stopSpeaking, setupAudioVisualizer, cleanupAudioVisualizer]);

  const stopListening = useCallback(() => {
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setIsListening(false);
    cleanupAudioVisualizer();
  }, [cleanupAudioVisualizer]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setSpeakingDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
      }
      cleanupAudioVisualizer();
    };
  }, [cleanupAudioVisualizer]);

  return {
    voiceState,
    setVoiceState,
    transcript,
    setTranscript,
    interimTranscript,
    isListening,
    isSpeaking,
    micPermission,
    setMicPermission,
    isSupported,
    audioLevel,
    speakingDuration,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    resetTranscript,
    requestMicPermission,
  };
}
