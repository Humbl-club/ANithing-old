import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'start', listener: () => void): void;
  addEventListener(type: 'end', listener: () => void): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: any) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.addEventListener('start', () => {
        setIsListening(true);
      });

      recognitionInstance.addEventListener('end', () => {
        setIsListening(false);
      });

      recognitionInstance.addEventListener('result', (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript.trim());
        }
      });

      recognitionInstance.addEventListener('error', (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      });

      setRecognition(recognitionInstance);
    }
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const handleClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      className={`p-2 hover:bg-primary/10 transition-colors ${className}`}
      aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
    >
      {isListening ? (
        <div className="flex items-center gap-1">
          <MicOff className="w-4 h-4 text-red-500" />
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      ) : (
        <Mic className="w-4 h-4 text-muted-foreground hover:text-primary" />
      )}
    </Button>
  );
};