import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Sparkles, MessageCircle, CheckCircle, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandsProps {
  isListening?: boolean;
  onToggleListening?: () => void;
  onCommand?: (command: string, data: any) => void;
}

interface Command {
  pattern: RegExp;
  action: string;
  description: string;
  example: string;
}

const voiceCommands: Command[] = [
  {
    pattern: /mark.*day.*complete|completed.*today|done.*today/i,
    action: 'MARK_COMPLETE',
    description: 'Mark today as complete',
    example: '"Mark today as complete" or "I completed today"'
  },
  {
    pattern: /add.*journal.*entry|journal.*(.+)|note.*(.+)/i,
    action: 'ADD_JOURNAL',
    description: 'Add journal entry',
    example: '"Add journal entry: Had a productive morning"'
  },
  {
    pattern: /talk.*coach|ask.*coach|coach.*help/i,
    action: 'OPEN_COACH',
    description: 'Open AI coach',
    example: '"Talk to coach" or "Ask coach for help"'
  },
  {
    pattern: /share.*progress|share.*goal|post.*social/i,
    action: 'SHARE_PROGRESS',
    description: 'Share progress on social media',
    example: '"Share my progress" or "Post to social media"'
  },
  {
    pattern: /show.*analytics|view.*stats|check.*progress/i,
    action: 'SHOW_ANALYTICS',
    description: 'View analytics and statistics',
    example: '"Show analytics" or "Check my progress"'
  },
  {
    pattern: /create.*team.*goal|start.*team|join.*team/i,
    action: 'CREATE_TEAM',
    description: 'Create or join team goal',
    example: '"Create team goal" or "Start team challenge"'
  }
];

export default function VoiceCommands({ isListening = false, onToggleListening, onCommand }: VoiceCommandsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Event handlers
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        // Process final transcript for commands
        if (finalTranscript) {
          processCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Please check your microphone permissions and try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart recognition if still listening
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
        toast({
          title: "Voice Commands Active",
          description: "Listening for your commands...",
        });
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    } else {
      recognitionRef.current.stop();
    }
  }, [isListening, isSupported]);

  const processCommand = (text: string) => {
    const command = voiceCommands.find(cmd => cmd.pattern.test(text));
    
    if (command) {
      setLastCommand(command.action);
      onCommand?.(command.action, { text, transcript: text });
      
      toast({
        title: "Command Recognized!",
        description: `Executing: ${command.description}`,
      });

      // Auto-clear after 3 seconds
      setTimeout(() => setLastCommand(null), 3000);
    } else if (text.length > 10) {
      toast({
        title: "Command not recognized",
        description: "Try saying 'Show voice commands' for help.",
        variant: "destructive"
      });
    }
  };

  const handleToggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Commands Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }
    onToggleListening?.();
  };

  if (!isSupported) {
    return (
      <Card className="card-premium border-muted/30">
        <CardContent className="p-4 text-center">
          <MicOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Voice commands not supported in this browser
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Button */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleToggleListening}
            variant={isListening ? "default" : "outline"}
            size="lg"
            className={`relative overflow-hidden ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-transparent border-2 border-yellow-400/30 hover:border-yellow-400/50"
            }`}
          >
            <motion.div
              animate={isListening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.div>
            <span className="ml-2">
              {isListening ? "Stop Listening" : "Start Voice Commands"}
            </span>
            
            {/* Pulse animation when listening */}
            {isListening && (
              <motion.div
                className="absolute inset-0 bg-red-400/20 rounded"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCommands(!showCommands)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Volume2 className="w-4 h-4 mr-1" />
          Commands
        </Button>
      </div>

      {/* Live Transcript */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="journal-glass p-4 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-yellow-400 mt-1"
              >
                <Mic className="w-4 h-4" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Listening... {confidence > 0 && `(${Math.round(confidence * 100)}% confidence)`}
                </p>
                <p className="text-foreground font-medium">{transcript}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Command Feedback */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 text-sm text-green-400"
          >
            <CheckCircle className="w-4 h-4" />
            Command executed: {lastCommand.replace('_', ' ').toLowerCase()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Commands */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="journal-glass p-4 rounded-2xl space-y-3"
          >
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Available Voice Commands
            </h4>
            <div className="space-y-2">
              {voiceCommands.map((command, index) => (
                <div key={index} className="text-sm">
                  <p className="text-foreground font-medium">{command.description}</p>
                  <p className="text-muted-foreground text-xs italic">
                    Say: {command.example}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}