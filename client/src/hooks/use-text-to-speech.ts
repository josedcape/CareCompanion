import { useState, useCallback } from 'react';

interface TextToSpeechResult {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
}

export function useTextToSpeech(): TextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Check if the browser supports the Web Speech API
  const hasSpeechSynthesis = 'speechSynthesis' in window;
  
  // Speak text
  const speak = useCallback((text: string) => {
    if (!hasSpeechSynthesis) {
      console.error("Speech synthesis is not supported in this browser");
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.includes('es') && !voice.name.includes('Google')
    );
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    // Configure speech parameters
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Speak
    window.speechSynthesis.speak(utterance);
  }, [hasSpeechSynthesis]);
  
  // Cancel speaking
  const cancel = useCallback(() => {
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [hasSpeechSynthesis]);
  
  // Fallback for browsers without speech synthesis
  if (!hasSpeechSynthesis) {
    return {
      speak: (text) => console.warn("Speech synthesis not supported", text),
      cancel: () => {},
      isSpeaking: false
    };
  }
  
  return {
    speak,
    cancel,
    isSpeaking
  };
}
