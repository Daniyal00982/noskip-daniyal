import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceCommandsProps {
  goalId: string;
  onMarkComplete: () => void;
  onAddNote: (note: string) => void;
}

export default function VoiceCommands({ goalId, onMarkComplete, onAddNote }: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setLastCommand(command);
        handleVoiceCommand(command);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceCommand = (command: string) => {
    if (command.includes('mark complete') || command.includes('done') || command.includes('completed')) {
      onMarkComplete();
      speak('Goal marked as complete');
    } else if (command.includes('add note') || command.includes('note')) {
      const note = command.replace(/add note|note/g, '').trim();
      if (note) {
        onAddNote(note);
        speak('Note added');
      }
    } else if (command.includes('status') || command.includes('progress')) {
      speak('Check your dashboard for current progress');
    } else {
      speak('Command not recognized');
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  if (!recognition) {
    return (
      <div className="card-premium p-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            Voice commands not supported in this browser
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-foreground" />
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Voice Commands</h3>
        <Badge variant="outline" className="text-muted-foreground border-border text-xs">
          BETA
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Voice Control Button */}
        <div className="text-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full ${isListening ? 'bg-destructive hover:bg-destructive/90' : 'btn-premium'}`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
          <div className="text-xs text-muted-foreground mt-2">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </div>
        </div>

        {/* Last Command */}
        {lastCommand && (
          <div className="p-3 bg-muted/50 rounded">
            <div className="text-xs font-medium text-foreground mb-1">Last Command:</div>
            <div className="text-xs text-muted-foreground">"{lastCommand}"</div>
          </div>
        )}

        {/* Available Commands */}
        <div>
          <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2">AVAILABLE COMMANDS</div>
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-medium text-foreground">"Mark complete"</span>
              <span className="text-muted-foreground"> - Mark today as done</span>
            </div>
            <div className="text-xs">
              <span className="font-medium text-foreground">"Add note [text]"</span>
              <span className="text-muted-foreground"> - Add a note</span>
            </div>
            <div className="text-xs">
              <span className="font-medium text-foreground">"Status"</span>
              <span className="text-muted-foreground"> - Check progress</span>
            </div>
          </div>
        </div>

        {/* Siri Shortcut Info */}
        <div className="p-3 border border-border rounded">
          <div className="text-xs font-medium text-foreground mb-1">iOS Shortcut</div>
          <div className="text-xs text-muted-foreground">
            Say "Hey Siri, mark my goal complete" to quickly update from anywhere
          </div>
        </div>
      </div>
    </div>
  );
}