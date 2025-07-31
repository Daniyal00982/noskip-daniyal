import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, Edit3, Star, Zap, Battery, Heart, Coffee, Target, Moon, Sun, Activity } from 'lucide-react';

interface DailyJournalProps {
  goalId: string;
  date?: Date;
}

interface HourlyEntry {
  hour: number;
  activity: string;
  feeling: 'great' | 'good' | 'okay' | 'bad';
  productivity: number; // 1-5 scale
  energy: number; // 1-5 scale
  category: 'work' | 'personal' | 'health' | 'learning' | 'social' | 'break';
}

export default function DailyJournal({ goalId, date = new Date() }: DailyJournalProps) {
  const [todayReflection, setTodayReflection] = useState('');
  const [hourlyLog, setHourlyLog] = useState<HourlyEntry[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [activityInput, setActivityInput] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<'great' | 'good' | 'okay' | 'bad'>('good');
  const [selectedProductivity, setSelectedProductivity] = useState(3);
  const [selectedEnergy, setSelectedEnergy] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<'work' | 'personal' | 'health' | 'learning' | 'social' | 'break'>('work');

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

  // Smart AI-powered activity categorization
  const smartCategorizeActivity = (activity: string): 'work' | 'personal' | 'health' | 'learning' | 'social' | 'break' => {
    const activityLower = activity.toLowerCase();
    
    // Work patterns
    if (activityLower.includes('meeting') || activityLower.includes('project') || 
        activityLower.includes('coding') || activityLower.includes('email') ||
        activityLower.includes('presentation') || activityLower.includes('java') ||
        activityLower.includes('programming') || activityLower.includes('development') ||
        activityLower.includes('work') || activityLower.includes('office')) {
      return 'work';
    }
    
    // Learning patterns
    if (activityLower.includes('reading') || activityLower.includes('study') ||
        activityLower.includes('tutorial') || activityLower.includes('course') ||
        activityLower.includes('learn') || activityLower.includes('practice') ||
        activityLower.includes('book') || activityLower.includes('video')) {
      return 'learning';
    }
    
    // Health patterns
    if (activityLower.includes('exercise') || activityLower.includes('gym') ||
        activityLower.includes('walk') || activityLower.includes('run') ||
        activityLower.includes('yoga') || activityLower.includes('meditation') ||
        activityLower.includes('workout') || activityLower.includes('fitness')) {
      return 'health';
    }
    
    // Social patterns
    if (activityLower.includes('call') || activityLower.includes('chat') ||
        activityLower.includes('friend') || activityLower.includes('family') ||
        activityLower.includes('social') || activityLower.includes('party') ||
        activityLower.includes('dinner') || activityLower.includes('hangout')) {
      return 'social';
    }
    
    // Break patterns
    if (activityLower.includes('break') || activityLower.includes('lunch') ||
        activityLower.includes('rest') || activityLower.includes('nap') ||
        activityLower.includes('relax') || activityLower.includes('netflix') ||
        activityLower.includes('sleep') || activityLower.includes('tv')) {
      return 'break';
    }
    
    return 'personal';
  };

  // Smart productivity prediction based on activity
  const predictProductivity = (activity: string, hour: number): number => {
    const activityLower = activity.toLowerCase();
    
    // High productivity activities
    if (activityLower.includes('coding') || activityLower.includes('programming') ||
        activityLower.includes('project') || activityLower.includes('deep work') ||
        activityLower.includes('focused') || activityLower.includes('study')) {
      return Math.min(5, Math.max(3, 4 + (hour >= 9 && hour <= 11 ? 1 : 0)));
    }
    
    // Medium productivity activities
    if (activityLower.includes('meeting') || activityLower.includes('planning') ||
        activityLower.includes('email') || activityLower.includes('reading')) {
      return 3;
    }
    
    // Low productivity activities
    if (activityLower.includes('break') || activityLower.includes('lunch') ||
        activityLower.includes('social') || activityLower.includes('netflix')) {
      return Math.max(1, 3 - (hour >= 14 && hour <= 16 ? 1 : 0));
    }
    
    return 3; // Default
  };

  // Smart energy prediction
  const predictEnergy = (hour: number, productivity: number): number => {
    // Morning energy boost
    if (hour >= 6 && hour <= 10) return Math.min(5, productivity + 1);
    
    // Afternoon dip
    if (hour >= 14 && hour <= 16) return Math.max(1, productivity - 1);
    
    // Evening decline
    if (hour >= 19) return Math.max(1, productivity - 1);
    
    return productivity;
  };

  const saveHourlyEntry = () => {
    if (selectedHour !== null && activityInput.trim()) {
      // Auto-suggest smart values if user hasn't changed them from defaults
      const smartCategory = smartCategorizeActivity(activityInput);
      const smartProductivity = predictProductivity(activityInput, selectedHour);
      const smartEnergy = predictEnergy(selectedHour, smartProductivity);

      const newEntry: HourlyEntry = {
        hour: selectedHour,
        activity: activityInput.trim(),
        feeling: selectedFeeling,
        productivity: selectedProductivity === 3 ? smartProductivity : selectedProductivity,
        energy: selectedEnergy === 3 ? smartEnergy : selectedEnergy,
        category: selectedCategory === 'work' ? smartCategory : selectedCategory
      };
      
      const updatedLog = hourlyLog.filter(entry => entry.hour !== selectedHour);
      updatedLog.push(newEntry);
      updatedLog.sort((a, b) => a.hour - b.hour);
      
      setHourlyLog(updatedLog);
      localStorage.setItem(`journal_${goalId}_${dateKey}_hourly`, JSON.stringify(updatedLog));
      
      setSelectedHour(null);
      setActivityInput('');
      setSelectedFeeling('good');
      setSelectedProductivity(3);
      setSelectedEnergy(3);
      setSelectedCategory('work');
    }
  };

  // Smart suggestions for next hour
  const getSmartSuggestions = (currentHour: number): string[] => {
    const recentEntries = hourlyLog.filter(entry => entry.hour >= currentHour - 3 && entry.hour < currentHour);
    const lastEntry = recentEntries[recentEntries.length - 1];
    
    const suggestions: string[] = [];
    
    // Time-based suggestions
    if (currentHour >= 6 && currentHour <= 9) {
      suggestions.push("Morning routine", "Exercise", "Planning the day", "Deep work session");
    } else if (currentHour >= 12 && currentHour <= 13) {
      suggestions.push("Lunch break", "Quick walk", "Meal with colleagues");
    } else if (currentHour >= 14 && currentHour <= 16) {
      suggestions.push("Light tasks", "Meetings", "Email responses", "Admin work");
    } else if (currentHour >= 17 && currentHour <= 19) {
      suggestions.push("Wrap up work", "Review day", "Personal time");
    } else if (currentHour >= 20) {
      suggestions.push("Relaxation", "Reading", "Family time", "Preparing for tomorrow");
    }
    
    // Pattern-based suggestions
    if (lastEntry) {
      if (lastEntry.category === 'work' && lastEntry.productivity >= 4) {
        suggestions.push("Continue focused work", "Take a short break", "Tackle another important task");
      } else if (lastEntry.energy <= 2) {
        suggestions.push("Take a break", "Go for a walk", "Have a healthy snack");
      } else if (lastEntry.category === 'break') {
        suggestions.push("Get back to work", "Start a new task", "Check priorities");
      }
    }
    
    return suggestions.slice(0, 4);
  };

  const currentHour = new Date().getHours();
  const allHours = Array.from({ length: 24 }, (_, i) => i); // All 24 hours
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return <Target className="w-3 h-3" />;
      case 'personal': return <Heart className="w-3 h-3" />;
      case 'health': return <Activity className="w-3 h-3" />;
      case 'learning': return <Star className="w-3 h-3" />;
      case 'social': return <Coffee className="w-3 h-3" />;
      case 'break': return <Moon className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getFeelingEmoji = (feeling: string) => {
    switch (feeling) {
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😔';
      default: return '🙂';
    }
  };

  const getProductivityColor = (level: number) => {
    if (level >= 4) return 'text-green-400';
    if (level >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEnergyColor = (level: number) => {
    if (level >= 4) return 'text-blue-400';
    if (level >= 3) return 'text-indigo-400';
    return 'text-purple-400';
  };

  return (
    <div className="journal-glass p-8 time-flow-bg">
      {/* Header with floating animation */}
      <div className="flex items-center gap-4 mb-8 floating-element">
        <div className="w-12 h-12 journal-glass rounded-2xl flex items-center justify-center">
          <Edit3 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-semibold text-white tracking-tight mb-1">Daily Time Journal</h3>
          <p className="text-white/60 text-sm">Track your day hour by hour with mindful awareness</p>
        </div>
        <Badge variant="outline" className="text-white/70 border-white/20 text-sm px-3 py-1">
          {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Badge>
      </div>

      {/* Today's Reflection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-4 h-4 text-white/80" />
          <label className="text-sm font-medium text-white/90 tracking-wide">
            DAILY REFLECTION
          </label>
        </div>
        <Textarea
          value={todayReflection}
          onChange={(e) => setTodayReflection(e.target.value)}
          placeholder="How was your day? What did you learn? What are you grateful for? How do you feel about your progress?"
          className="journal-glass min-h-[120px] text-white placeholder:text-white/40 border-0 bg-transparent backdrop-blur-20 p-4 text-sm leading-relaxed"
          onBlur={saveReflection}
        />
      </div>

      {/* Hour-by-Hour Timeline */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white/90 tracking-wide">HOURLY TIMELINE</span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent ml-4"></div>
        </div>
        
        {/* Hour Grid - Responsive Layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
          {allHours.map(hour => {
            const status = getHourStatus(hour);
            const entry = hourlyLog.find(e => e.hour === hour);
            
            return (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`hour-block p-3 text-xs font-medium aspect-square flex flex-col items-center justify-center relative group ${
                  status === 'logged' ? 'hour-logged' :
                  status === 'current' ? 'hour-current' :
                  status === 'missed' ? 'hour-missed' : 'hour-upcoming'
                } ${selectedHour === hour ? 'ring-2 ring-white/40 scale-105' : ''}`}
              >
                <div className="text-white font-semibold mb-1">{getHourDisplay(hour)}</div>
                {entry && (
                  <>
                    <div className="text-white/80 text-[10px] text-center leading-tight mb-1">
                      {entry.activity.slice(0, 20)}{entry.activity.length > 20 ? '...' : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(entry.category)}
                      <span className="text-xs">{getFeelingEmoji(entry.feeling)}</span>
                    </div>
                  </>
                )}
                {status === 'current' && !entry && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Smart Suggestions */}
        {currentHour < 24 && (
          <div className="journal-glass p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">SMART SUGGESTIONS FOR {getHourDisplay(currentHour)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getSmartSuggestions(currentHour).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedHour(currentHour);
                    setActivityInput(suggestion);
                    setSelectedCategory(smartCategorizeActivity(suggestion));
                    setSelectedProductivity(predictProductivity(suggestion, currentHour));
                    setSelectedEnergy(predictEnergy(currentHour, predictProductivity(suggestion, currentHour)));
                  }}
                  className="p-2 text-xs text-left rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Hour Entry Form */}
        {selectedHour !== null && (
          <div className="journal-glass p-6 space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 journal-glass rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Log Activity for {getHourDisplay(selectedHour)}</h4>
                <p className="text-white/60 text-xs">Capture what you did and how you felt</p>
              </div>
              <div className="text-xs text-white/60">
                🤖 AI Auto-suggestions enabled
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-white/80 block mb-2">ACTIVITY DESCRIPTION</label>
                <Textarea
                  value={activityInput}
                  onChange={(e) => {
                    setActivityInput(e.target.value);
                    // Auto-suggest category as user types
                    if (e.target.value.trim() && selectedCategory === 'work') {
                      setSelectedCategory(smartCategorizeActivity(e.target.value));
                    }
                  }}
                  placeholder="What did you do during this hour? Be specific and mindful..."
                  className="journal-glass text-white placeholder:text-white/40 border-0 bg-transparent p-3 text-sm"
                  rows={3}
                />
                {activityInput.trim() && selectedCategory === smartCategorizeActivity(activityInput) && (
                  <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Auto-categorized as {smartCategorizeActivity(activityInput)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-white/80 block mb-2">CATEGORY</label>
                  <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                    <SelectTrigger className="journal-glass border-0 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="work">🎯 Work</SelectItem>
                      <SelectItem value="personal">❤️ Personal</SelectItem>
                      <SelectItem value="health">💪 Health</SelectItem>
                      <SelectItem value="learning">📚 Learning</SelectItem>
                      <SelectItem value="social">☕ Social</SelectItem>
                      <SelectItem value="break">🌙 Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-2">FEELING</label>
                  <Select value={selectedFeeling} onValueChange={(value: any) => setSelectedFeeling(value)}>
                    <SelectTrigger className="journal-glass border-0 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="great">😊 Great</SelectItem>
                      <SelectItem value="good">🙂 Good</SelectItem>
                      <SelectItem value="okay">😐 Okay</SelectItem>
                      <SelectItem value="bad">😔 Bad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-2">PRODUCTIVITY (1-5)</label>
                  <Select value={selectedProductivity.toString()} onValueChange={(value) => setSelectedProductivity(parseInt(value))}>
                    <SelectTrigger className="journal-glass border-0 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="1">⭐ 1 - Low</SelectItem>
                      <SelectItem value="2">⭐⭐ 2</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-2">ENERGY (1-5)</label>
                  <Select value={selectedEnergy.toString()} onValueChange={(value) => setSelectedEnergy(parseInt(value))}>
                    <SelectTrigger className="journal-glass border-0 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="1">🔋 1 - Drained</SelectItem>
                      <SelectItem value="2">🔋🔋 2</SelectItem>
                      <SelectItem value="3">🔋🔋🔋 3</SelectItem>
                      <SelectItem value="4">🔋🔋🔋🔋 4</SelectItem>
                      <SelectItem value="5">⚡ 5 - Energized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={saveHourlyEntry} 
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-20 transition-all duration-300"
              >
                SAVE ENTRY
              </Button>
              <Button 
                onClick={() => setSelectedHour(null)} 
                variant="outline" 
                className="flex-1 bg-transparent hover:bg-white/5 text-white/80 border-white/20"
              >
                CANCEL
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Daily Summary */}
      {hourlyLog.length > 0 && (
        <div className="journal-glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/90 tracking-wide">TODAY'S JOURNEY</span>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">{hourlyLog.length}</div>
              <div className="text-xs text-white/60">Hours Logged</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                {(hourlyLog.reduce((sum, entry) => sum + entry.productivity, 0) / hourlyLog.length).toFixed(1)}
              </div>
              <div className="text-xs text-white/60">Avg Productivity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400">
                {(hourlyLog.reduce((sum, entry) => sum + entry.energy, 0) / hourlyLog.length).toFixed(1)}
              </div>
              <div className="text-xs text-white/60">Avg Energy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-400">
                {Math.round((hourlyLog.filter(entry => entry.feeling === 'great' || entry.feeling === 'good').length / hourlyLog.length) * 100)}%
              </div>
              <div className="text-xs text-white/60">Positive Mood</div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hourlyLog.map(entry => (
              <div key={entry.hour} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-white/70 font-medium text-sm min-w-[60px]">
                  {getHourDisplay(entry.hour)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(entry.category)}
                    <span className="text-white text-sm">{entry.activity}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      {getFeelingEmoji(entry.feeling)} {entry.feeling}
                    </span>
                    <span className={`flex items-center gap-1 ${getProductivityColor(entry.productivity)}`}>
                      <Zap className="w-3 h-3" /> {entry.productivity}/5
                    </span>
                    <span className={`flex items-center gap-1 ${getEnergyColor(entry.energy)}`}>
                      <Battery className="w-3 h-3" /> {entry.energy}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}