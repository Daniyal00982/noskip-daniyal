import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Sparkles, Target, BarChart3, MessageCircle, Share2, Users, Mic } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  highlight?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Noskip! 🎯",
    description: "Transform your goals into reality with AI-powered tracking and beautiful glassmorphic design. Let's take a quick tour!",
    icon: <Target className="w-6 h-6" />,
    position: { top: "50%", left: "50%" }
  },
  {
    id: 2,
    title: "Smart Goal Creation",
    description: "Set up your goals with AI-powered suggestions and intelligent milestone generation based on your goal type.",
    icon: <Sparkles className="w-6 h-6" />,
    position: { top: "20%", left: "50%" },
    highlight: "[data-tour='goal-setup']"
  },
  {
    id: 3,
    title: "Daily ASMR Journal",
    description: "Track your progress with our beautiful hour-by-hour journal featuring smart activity categorization and productivity insights.",
    icon: <BarChart3 className="w-6 h-6" />,
    position: { top: "30%", right: "20%" },
    highlight: "[data-tour='daily-journal']"
  },
  {
    id: 4,
    title: "AI Coach Support",
    description: "Get personalized motivation and advice from your AI coach whenever you need encouragement or guidance.",
    icon: <MessageCircle className="w-6 h-6" />,
    position: { bottom: "30%", left: "20%" },
    highlight: "[data-tour='ai-coach']"
  },
  {
    id: 5,
    title: "Share Your Success",
    description: "Celebrate achievements by sharing your progress on social media with beautiful, auto-generated success cards.",
    icon: <Share2 className="w-6 h-6" />,
    position: { bottom: "25%", right: "25%" },
    highlight: "[data-tour='social-share']"
  },
  {
    id: 6,
    title: "Team Collaboration",
    description: "Join or create team goals with voice commands support for hands-free progress updates and team coordination.",
    icon: <Users className="w-6 h-6" />,
    position: { top: "40%", left: "25%" },
    highlight: "[data-tour='team-goals']"
  },
  {
    id: 7,
    title: "Voice Commands",
    description: "Use voice commands to update progress, add journal entries, and interact with your AI coach hands-free!",
    icon: <Mic className="w-6 h-6" />,
    position: { bottom: "20%", left: "50%" },
    highlight: "[data-tour='voice-commands']"
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      // Add highlight to current step
      highlightElement();
    } else {
      // Remove all highlights
      removeAllHighlights();
    }
  }, [isOpen, currentStep]);

  const highlightElement = () => {
    removeAllHighlights();
    const step = onboardingSteps[currentStep];
    if (step?.highlight) {
      const element = document.querySelector(step.highlight);
      if (element) {
        element.classList.add('onboarding-highlight');
      }
    }
  };

  const removeAllHighlights = () => {
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
  };

  const nextStep = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleComplete();
      }
      setIsAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleComplete = () => {
    removeAllHighlights();
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    removeAllHighlights();
    onClose();
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed z-[101]"
          style={{
            top: step.position.top,
            bottom: step.position.bottom,
            left: step.position.left,
            right: step.position.right,
            transform: step.position.top === "50%" && step.position.left === "50%" 
              ? "translate(-50%, -50%)" 
              : undefined
          }}
        >
          <Card className="w-80 card-premium border-2 border-yellow-400/30 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="text-yellow-400"
                  >
                    {step.icon}
                  </motion.div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` 
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isAnimating}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    <>
                      Get Started
                      <Sparkles className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/40 rounded-full"
                animate={{
                  x: [0, Math.random() * 200 - 100],
                  y: [0, Math.random() * 200 - 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Spotlight Effect */}
      {step.highlight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 pointer-events-none z-[99]"
        >
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
        </motion.div>
      )}
    </>
  );
}