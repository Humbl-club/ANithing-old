import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceSearchProps {
  onStart: () => void;
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
  showTranscript?: boolean;
  language?: string;
  continuous?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
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
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'start' | 'end' | 'speechstart' | 'speechend', listener: () => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onStart,
  onResult,
  onError,
  isActive = false,
  disabled = false,
  className,
  variant = 'default',
  showTranscript = true,
  language = 'en-US',
  continuous = false
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Setup speech recognition
  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.addEventListener('start', () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      onStart();
    });

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
        setInterimTranscript('');
        
        // Auto-stop after getting result (unless continuous)
        if (!continuous) {
          stopListening();
          onResult(finalTranscript.trim());
        }
      } else {
        setInterimTranscript(interimText);
      }
    });

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      onError(errorMessage);
    });

    recognition.addEventListener('end', () => {
      setIsListening(false);
      if (continuous && transcript && !error) {
        onResult(transcript);
      }
    });

    // Auto-stop after silence (timeout)
    recognition.addEventListener('speechend', () => {
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          stopListening();
        }
      }, 2000);
    });

  }, [onStart, onResult, onError, language, continuous, transcript, error, isListening]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Microphone not accessible. Check permissions.';
      case 'not-allowed':
        return 'Microphone permission denied.';
      case 'network':
        return 'Network error. Please check your connection.';
      case 'service-not-allowed':
        return 'Speech recognition service not allowed.';
      case 'bad-grammar':
        return 'Speech recognition grammar error.';
      case `language-not-supported`:
        return `Language "${language}" not supported.`;
      default:
        return 'Speech recognition error occurred.';
    }
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening || disabled) return;

    try {
      recognitionRef.current.start();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (err) {
      console.error('Speech recognition start error:', err);
      setError('Failed to start speech recognition');
      onError('Failed to start speech recognition');
    }
  }, [isListening, disabled, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (err) {
      console.error('Speech recognition stop error:', err);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Sync with external isActive prop
  useEffect(() => {
    if (isActive && !isListening && !disabled) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isListening, disabled, startListening, stopListening]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  const buttonVariants = {
    default: 'h-8 w-8 p-0',
    compact: 'h-6 w-6 p-0',
    floating: 'h-12 w-12 p-0 rounded-full shadow-lg'
  };

  const iconSizes = {
    default: 'w-4 h-4',
    compact: 'w-3 h-3',
    floating: 'w-5 h-5'
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant={isListening ? 'default' : error ? 'destructive' : 'ghost'}
        size="sm"
        className={cn(
          buttonVariants[variant],
          'relative transition-all duration-200',
          isListening && 'bg-red-500 hover:bg-red-600 text-white',
          error && 'bg-red-500/10 hover:bg-red-500/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative"
            >
              <MicOff className={iconSizes[variant]} />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <AlertCircle className={iconSizes[variant]} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Mic className={iconSizes[variant]} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Voice activity indicator */}
      {isListening && variant === 'floating' && (
        <motion.div
          className="absolute -inset-2 rounded-full border-2 border-red-400/50"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Transcript display */}
      <AnimatePresence>
        {showTranscript && (isListening || transcript || interimTranscript || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "absolute top-full mt-2 p-3 bg-background border rounded-lg shadow-lg min-w-[200px] max-w-[300px]",
              variant === 'floating' ? 'right-0' : 'left-0'
            )}
            style={{ zIndex: 1000 }}
          >
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-2">
              {isListening ? (
                <>
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span className="text-xs text-muted-foreground">Listening...</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {language}
                  </Badge>
                </>
              ) : error ? (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">Error</span>
                </div>
              ) : transcript ? (
                <div className="flex items-center gap-1 text-green-500">
                  <Volume2 className="w-3 h-3" />
                  <span className="text-xs">Completed</span>
                  {confidence > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(confidence * 100)}%
                    </Badge>
                  )}
                </div>
              ) : null}
            </div>

            {/* Transcript content */}
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div className="space-y-1">
                {transcript && (
                  <p className="text-sm font-medium text-foreground">
                    {transcript}
                  </p>
                )}
                {interimTranscript && (
                  <p className="text-sm text-muted-foreground italic">
                    {interimTranscript}
                  </p>
                )}
                {isListening && !transcript && !interimTranscript && (
                  <p className="text-xs text-muted-foreground">
                    Start speaking...
                  </p>
                )}
              </div>
            )}

            {/* Controls */}
            {(isListening || error) && (
              <div className="flex gap-1 mt-2 pt-2 border-t">
                {isListening && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopListening}
                    className="h-6 text-xs"
                  >
                    Stop
                  </Button>
                )}
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      startListening();
                    }}
                    className="h-6 text-xs"
                  >
                    Retry
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};