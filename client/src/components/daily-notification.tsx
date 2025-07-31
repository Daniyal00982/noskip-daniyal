import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

interface DailyNotificationProps {
  daysRemaining: number;
  goalName: string;
}

export function DailyNotification({ daysRemaining, goalName }: DailyNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem('lastNotificationShown');
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      setIsOpen(true);
      localStorage.setItem('lastNotificationShown', today);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center p-4">
          <div className="mb-4">
            <Flame className="h-16 w-16 text-accent mx-auto mb-4" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Only {daysRemaining} days left!
          </h3>
          <p className="text-gray-600 mb-6">
            No skipping today. Your future self is counting on you.
          </p>
          <Button 
            onClick={handleClose}
            className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity duration-200 w-full"
          >
            Let's Go! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
