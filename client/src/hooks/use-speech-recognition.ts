import { useState, useEffect, useCallback } from "react";
import { parseTaskFromSpeech } from "@/lib/utils";
import { Task } from "@shared/schema";

interface SpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  parsedTask: Partial<Task> | null;
}

// Check if the browser supports the Web Speech API
const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
const hasSpeechRecognition = !!SpeechRecognition;

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedTask, setParsedTask] = useState<Partial<Task> | null>(null);
  
  // Instance of speech recognition
  const recognitionRef = useCallback(() => {
    if (!hasSpeechRecognition) return null;
    
    const instance = new SpeechRecognition();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = "es-ES"; // Set language to Spanish
    
    return instance;
  }, []);
  
  // Start listening
  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser");
      return;
    }
    
    const recognition = recognitionRef();
    if (!recognition) return;
    
    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const fullTranscript = event.results[current][0].transcript;
      setTranscript(fullTranscript);
      
      // Parse the speech to extract task information
      const extracted = parseTaskFromSpeech(fullTranscript);
      if (extracted) {
        setParsedTask(extracted);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      // Only stop if we deliberately called stopListening
      if (isListening) {
        recognition.start();
      }
    };
    
    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  }, [isListening, recognitionRef]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (!hasSpeechRecognition) return;
    
    const recognition = recognitionRef();
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognitionRef]);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript("");
    setParsedTask(null);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);
  
  // Fallback for browsers without speech recognition
  if (!hasSpeechRecognition) {
    return {
      isListening: false,
      transcript: "Tu navegador no soporta reconocimiento de voz.",
      startListening: () => console.warn("Speech recognition not supported"),
      stopListening: () => {},
      resetTranscript: () => {},
      parsedTask: null
    };
  }
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    parsedTask
  };
}
