import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Edit3 } from 'lucide-react';

interface DailyJournalProps {
  goalId: string;
  date?: Date;
}

interface HourlyEntry {
  hour: number;
  activity: string;
  feeling: 'great' | 'good' | 'okay' | 'bad';
}

export default function DailyJournal({ goalId, date = new Date() }: DailyJournalProps) {
  const [todayReflection, setTodayReflection] = useState('');
  const [hourlyLog, setHourlyLog] = useState<HourlyEntry[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [activityInput, setActivityInput] = useState('');

  const dateKey = date.toISOString().split('T')[0];

  useEffect(() => {
    // Load saved data
    const savedReflection = localStorage.getItem(`journal_${goalId}_${dateKey}_reflection`);
    const savedHourly = localStorage.getItem(`journal_${goalId}_${dateKey}_hourly`);
    
    if (savedReflection) setTodayReflection(savedReflection);
    if (savedHourly) setHourlyLog(JSON.parse(savedHourly));
  }, [goalId, dateKey]);

  const saveReflection = () => {
    localStorage.setItem(`journal_${goalId}_${dateKey}_reflection`, todayReflection);
  };

  const saveHourlyEntry = () => {
    if (selectedHour !== null && activityInput.trim()) {
      const newEntry: HourlyEntry = {
        hour: selectedHour,
        activity: activityInput.trim(),
        feeling: 'good'
      };
      
      const updatedLog = hourlyLog.filter(entry => entry.hour !== selectedHour);
      updatedLog.push(newEntry);
      updatedLog.sort((a, b) => a.hour - b.hour);
      
      setHourlyLog(updatedLog);
      localStorage.setItem(`journal_${goalId}_${dateKey}_hourly`, JSON.stringify(updatedLog));
      
      setSelectedHour(null);
      setActivityInput('');
    }
  };

  const currentHour = new Date().getHours();
  const workingHours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

  const getHourDisplay = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getHourStatus = (hour: number) => {
    const entry = hourlyLog.find(e => e.hour === hour);
    if (entry) return 'logged';
    if (hour === currentHour) return 'current';
    if (hour < currentHour) return 'missed';
    return 'upcoming';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 glass-accent rounded-lg flex items-center justify-center">
          <Edit3 className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white tracking-tight">Daily Journal</h3>
        <Badge variant="outline" className="text-white/70 border-white/20 text-xs">
          {dateKey}
        </Badge>
      </div>

      {/* Today's Reflection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-white/90 tracking-wide block mb-3">
          HOW WAS YOUR DAY?
        </label>
        <Textarea
          value={todayReflection}
          onChange={(e) => setTodayReflection(e.target.value)}
          placeholder="Reflect on your day, challenges, wins, and feelings..."
          className="glass-input min-h-[100px] text-white placeholder:text-white/50"
          onBlur={saveReflection}
        />
      </div>

      {/* Hourly Time Tracker */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white/90 tracking-wide">HOURLY LOG</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {workingHours.map(hour => {
            const status = getHourStatus(hour);
            const entry = hourlyLog.find(e => e.hour === hour);
            
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  status === 'logged' 
                    ? 'glass-success text-white' 
                    : status === 'current'
                    ? 'glass-accent text-white animate-pulse'
                    : status === 'missed'
                    ? 'glass-error text-white/70'
                    : 'glass-neutral text-white/60 hover:text-white hover:glass-accent'
                } ${selectedHour === hour ? 'ring-2 ring-white/30' : ''}`}
              >
                <div>{getHourDisplay(hour)}</div>
                {entry && (
                  <div className="text-xs opacity-80 truncate mt-1">
                    {entry.activity.slice(0, 12)}...
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hour Entry Form */}
        {selectedHour !== null && (
          <div className="glass-card p-4 space-y-3">
            <div className="text-sm font-medium text-white">
              What did you do at {getHourDisplay(selectedHour)}?
            </div>
            <Textarea
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              placeholder="Work on Python tutorials, had lunch, meeting with team..."
              className="glass-input text-white placeholder:text-white/50"
              rows={2}
            />
            <div className="flex gap-2">
              <Button onClick={saveHourlyEntry} className="glass-button flex-1">
                SAVE ENTRY
              </Button>
              <Button 
                onClick={() => setSelectedHour(null)} 
                variant="outline" 
                className="glass-button-secondary flex-1"
              >
                CANCEL
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      {hourlyLog.length > 0 && (
        <div className="glass-card p-4">
          <div className="text-sm font-medium text-white/90 mb-3">TODAY'S ACTIVITIES</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {hourlyLog.map(entry => (
              <div key={entry.hour} className="flex justify-between items-start text-xs">
                <span className="text-white/70 font-medium">{getHourDisplay(entry.hour)}</span>
                <span className="text-white flex-1 ml-3">{entry.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}