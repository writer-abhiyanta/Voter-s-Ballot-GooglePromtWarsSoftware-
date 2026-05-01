import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, FileCheck, Users, Vote, ListTodo, MessageSquareWarning, Lightbulb, AlertTriangle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = [
  {
    id: 'registration',
    title: 'Voter Registration',
    description: 'Ensure you are registered to vote before the deadline. Keep your voter ID ready.',
    icon: FileCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'research',
    title: 'Examine Candidate',
    description: 'Learn about candidates and their manifestos to make an informed decision.',
    icon: Users,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'polling_station',
    title: 'Find Polling Station',
    description: 'Locate your designated polling booth on the map and plan your visit on election day.',
    icon: Vote,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'cast_vote',
    title: 'Give your informed vote',
    description: 'Go to the polling booth, verify identity, give your informed vote on evm unravelingly.',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'manifesto_followup',
    title: 'Its Not Done (Take Manifesto Followup)',
    description: 'Track the promises made in the manifesto and see what has been accomplished.',
    icon: ListTodo,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'raise_question',
    title: 'Raise a Question to Unfollowed Work',
    description: 'Hold elected officials accountable by asking questions about incomplete promises.',
    icon: MessageSquareWarning,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'suggest_work',
    title: 'Ask for improvement and ask for different initiative',
    description: 'Ask for improvement and ask for different initiative.',
    icon: Lightbulb,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  }
];

export const LearnElectionProcess: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      if (onComplete) onComplete();
      setCurrentStep(STEPS.length);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10b981', '#14b8a6', '#22c55e']
      });
    }
  };

  const isCompleted = currentStep === STEPS.length;
  const step = STEPS[currentStep] || STEPS[STEPS.length - 1];
  const Icon = step.icon;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Gamified Election Learning</h2>
        <p className="text-neutral-400">Master the election process to give an easy and informed vote.</p>
      </div>

      <div className="w-full relative">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 relative z-10 w-full px-8">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-neutral-800 -z-10 -translate-y-1/2">
                <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            {STEPS.map((s, idx) => (
                <div key={s.id} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${idx <= currentStep ? 'bg-emerald-500 border-emerald-500' : 'bg-neutral-900 border-neutral-700'}`}>
                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-xs font-bold text-white">{idx + 1}</span>}
                </div>
            ))}
        </div>

        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 text-center"
            >
              <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-8 ${step.bg}`}>
                <Icon className={`w-12 h-12 ${step.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-neutral-400 mb-8 max-w-md mx-auto leading-relaxed">{step.description}</p>
              
              {step.id === 'polling_station' && (
                <div className="w-full h-64 bg-neutral-800 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-neutral-700 relative">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%)'
                  }} />
                  <div className="relative z-10 text-center p-4">
                    <Vote className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-white font-medium">Main Polling Station</p>
                    <p className="text-sm text-neutral-400">Bermingom, Itly</p>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Bermingom,+Itly"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              )}

              <button
                onClick={handleNext}
                className="bg-white text-black px-8 py-3 rounded-full font-medium inline-flex items-center gap-2 hover:bg-neutral-200 transition-colors"
              >
                {currentStep === STEPS.length - 1 ? 'Finish Tutorial' : 'Understood, Next Step'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
             <motion.div
              key="complete"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 md:p-12 text-center"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 border-4 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <Award className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-emerald-400">Badge of Informed Voter Earned!</h3>
              <p className="text-neutral-300 mb-8 max-w-md mx-auto leading-relaxed text-lg">
                Congratulation! you earn a badge of informed voter
              </p>
              <button 
                onClick={() => setCurrentStep(0)}
                className="bg-emerald-500 text-neutral-900 px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                >
                Review Steps
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
