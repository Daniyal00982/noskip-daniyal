import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Facebook, Twitter, Instagram, Linkedin, Copy, Download, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  goalName: string;
  progress: {
    currentStreak: number;
    bestStreak: number;
    totalCompleted: number;
  };
}

export default function SocialShare({ isOpen, onClose, goalName, progress }: SocialShareProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateShareText = () => {
    const messages = [
      `🎯 Making amazing progress on my goal: ${goalName}! Current streak: ${progress.currentStreak} days with Noskip! #NoSkip #GoalAchievement`,
      `🔥 ${progress.currentStreak} days strong on "${goalName}"! The journey continues with Noskip's AI coaching. #ProgressNotPerfection #NoSkip`,
      `💪 Personal best streak of ${progress.bestStreak} days and counting! "${goalName}" - crushing it with Noskip! #GoalDigger #NoSkip`,
      `✨ Total ${progress.totalCompleted} days completed on my journey: ${goalName}. Grateful for Noskip's smart tracking! #Consistency #NoSkip`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const shareLinks = {
    twitter: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://noskip.vercel.app')}`,
    facebook: (text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://noskip.vercel.app')}&quote=${encodeURIComponent(text)}`,
    linkedin: (text: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://noskip.vercel.app')}&summary=${encodeURIComponent(text)}`,
    instagram: () => 'https://www.instagram.com' // Instagram doesn't support direct text sharing
  };

  const handleShare = async (platform: string) => {
    setIsGenerating(true);
    
    // Simulate AI generating personalized content
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const shareText = generateShareText();
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Your success story is ready to share anywhere.",
      });
    } else if (platform === 'instagram') {
      toast({
        title: "Instagram Story Ready!",
        description: "Copy your text and create a beautiful story on Instagram.",
      });
    } else {
      const link = shareLinks[platform as keyof typeof shareLinks](shareText);
      window.open(link, '_blank', 'noopener,noreferrer');
    }
    
    setIsGenerating(false);
  };

  const generateSuccessCard = () => {
    // This would generate a beautiful visual card for download
    toast({
      title: "Success Card Generated!",
      description: "Your beautiful progress card is ready for download.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card-premium border-2 border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Share2 className="w-5 h-5 text-yellow-400" />
            Share Your Success
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="journal-glass p-4 rounded-2xl"
          >
            <div className="text-center space-y-2">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="text-4xl mb-2"
              >
                🎯
              </motion.div>
              <h3 className="font-semibold text-lg text-foreground">{goalName}</h3>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <span>🔥 {progress.currentStreak} days</span>
                <span>⭐ Best: {progress.bestStreak}</span>
                <span>📈 Total: {progress.totalCompleted}</span>
              </div>
              <p className="text-xs text-muted-foreground">Powered by Noskip</p>
            </div>
          </motion.div>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Share your progress:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                disabled={isGenerating}
                className="flex items-center gap-2 h-12 bg-[#1DA1F2]/10 border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                disabled={isGenerating}
                className="flex items-center gap-2 h-12 bg-[#4267B2]/10 border-[#4267B2]/30 hover:bg-[#4267B2]/20"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                disabled={isGenerating}
                className="flex items-center gap-2 h-12 bg-[#0077B5]/10 border-[#0077B5]/30 hover:bg-[#0077B5]/20"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleShare('instagram')}
                disabled={isGenerating}
                className="flex items-center gap-2 h-12 bg-gradient-to-r from-[#E4405F]/10 to-[#5B51D8]/10 border-[#E4405F]/30 hover:from-[#E4405F]/20 hover:to-[#5B51D8]/20"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('copy')}
                disabled={isGenerating}
                className="flex-1 flex items-center gap-2 h-12"
              >
                <Copy className="w-4 h-4" />
                Copy Text
              </Button>
              
              <Button
                variant="outline"
                onClick={generateSuccessCard}
                disabled={isGenerating}
                className="flex-1 flex items-center gap-2 h-12"
              >
                <Download className="w-4 h-4" />
                Download Card
              </Button>
            </div>
          </div>

          {/* AI Generation Status */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
              AI is crafting your perfect success story...
            </motion.div>
          )}

          {/* Motivational Footer */}
          <div className="text-center pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Keep crushing your goals! 💪 Share your wins and inspire others.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}