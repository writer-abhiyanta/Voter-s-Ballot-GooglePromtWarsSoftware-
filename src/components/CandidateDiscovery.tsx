import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

const CANDIDATES = [
  {
    id: '1',
    name: 'oiela quarter',
    party: 'Progressive Future',
    education: 'MSc Public Policy, Oxford',
    experience: 'City Council (4 yrs), Tech Entrepreneur',
    manifesto: [
      '100% Renewable Energy by 2030',
      'Free Universal Pre-K',
      'Modernize Public Transit Network'
    ],
    performance: 'Passed 12 local ordinances, 95% attendance rate.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    matchScore: 0
  },
  {
    id: '2',
    name: 'tony dragon',
    party: 'Civic Alliance',
    education: 'JD, Harvard Law',
    experience: 'District Attorney (8 yrs)',
    manifesto: [
      'Comprehensive Tax Reform',
      'Increase Teacher Salaries',
      'Expand Small Business Grants'
    ],
    performance: 'Cleared historic case backlog, implemented community policing.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    matchScore: 0
  },
  {
    id: '3',
    name: 'moka sandrek',
    party: 'Green Coalition',
    education: 'PhD Environmental Science',
    experience: 'NGO Director, Climate Activist',
    manifesto: [
      'Stop Urban Sprawl',
      'Protect Local Watersheds',
      'Implement City-wide Composting'
    ],
    performance: 'Led successful campaign to ban single-use plastics locally.',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    matchScore: 0
  }
];

const QUIZ_QUESTIONS = [
  {
    text: "We need to rapidly transition to 100% Renewable Energy.",
    alignment: { '1': 1, '2': 0, '3': 1 }
  },
  {
    text: "Comprehensive tax reform and business growth should be our top priorities.",
    alignment: { '1': -0.5, '2': 1, '3': -0.5 }
  },
  {
    text: "The city must invest heavily in modernizing public transit.",
    alignment: { '1': 1, '2': 0, '3': 0.5 }
  },
  {
    text: "Protecting watersheds and stopping urban sprawl is more important than rapid development.",
    alignment: { '1': 0.5, '2': -0.5, '3': 1 }
  },
  {
    text: "Public funds should be used to guarantee free universal Pre-K.",
    alignment: { '1': 1, '2': 0.5, '3': 0 }
  }
];

type Phase = 'intro' | 'quiz' | 'discovery';

export const CandidateDiscovery: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);

  const matchedCandidates = useMemo(() => {
    if (userAnswers.length < QUIZ_QUESTIONS.length) return CANDIDATES;

    return [...CANDIDATES].map(cand => {
      let totalScore = 0;
      QUIZ_QUESTIONS.forEach((q, i) => {
        const uAns = userAnswers[i];
        const cAns = q.alignment[cand.id as keyof typeof q.alignment];
        totalScore += 1 - Math.abs(uAns - cAns) / 2;
      });
      const matchScore = Math.round((totalScore / QUIZ_QUESTIONS.length) * 100);
      return { ...cand, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [userAnswers]);

  const handleAnswer = (val: number) => {
    const newAnswers = [...userAnswers, val];
    setUserAnswers(newAnswers);
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('discovery');
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -100) {
      setExitX(-200);
      nextCandidate();
    } else if (info.offset.x > 100) {
       setExitX(200);
       nextCandidate();
    }
  };

  const nextCandidate = () => {
    setTimeout(() => {
      if (currentIndex < matchedCandidates.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setExitX(0);
      } else {
         setCurrentIndex(matchedCandidates.length);
      }
    }, 200);
  };

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Activity className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Discover Your Candidates</h2>
        <p className="text-neutral-400 mb-8">Take a quick 5-question match quiz to see which candidates align best with your values and priorities.</p>
        <button 
          onClick={() => setPhase('quiz')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          Start Match Quiz
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (phase === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6">
        <div className="w-full mb-8">
          <div className="flex justify-between text-xs text-neutral-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round((currentQuestionIndex / QUIZ_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300" 
              style={{ width: `${(currentQuestionIndex / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <h3 className="text-2xl font-medium text-white text-center mb-10 leading-relaxed min-h-[100px]">
              "{question.text}"
            </h3>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => handleAnswer(1)}
                className="w-full py-4 px-6 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-400 transition-all font-medium text-white flex justify-center items-center"
              >
                Strongly Agree
              </button>
              <button 
                onClick={() => handleAnswer(0)}
                className="w-full py-4 px-6 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition-all font-medium text-neutral-300 flex justify-center items-center"
              >
                Neutral
              </button>
              <button 
                onClick={() => handleAnswer(-1)}
                className="w-full py-4 px-6 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all font-medium text-white flex justify-center items-center"
              >
                Strongly Disagree
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (currentIndex >= matchedCandidates.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Activity className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Discovery Complete</h3>
        <p className="text-neutral-400">You've reviewed all candidates in your district. Check your shortlist to compare them in detail.</p>
      </div>
    );
  }

  const candidate = matchedCandidates[currentIndex];

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] flex items-center justify-center perspective-[1000px]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={candidate.id}
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
          exit={{ x: exitX, opacity: 0, rotate: exitX * 0.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute w-full h-[500px] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ zIndex: matchedCandidates.length - currentIndex }}
        >
          {/* Card Content */}
          <div className="relative h-1/2 w-full">
            <img 
              src={candidate.imageUrl} 
              alt={candidate.name}
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
            
            {/* Match Badge */}
            <div className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <span className="text-emerald-400 font-bold text-sm">{candidate.matchScore}%</span>
               <span className="text-emerald-300/80 text-xs text-uppercase tracking-wider">Match</span>
            </div>
          </div>

          <div className="p-6 h-1/2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-1">
                <h2 className="text-2xl font-bold text-white leading-none">{candidate.name}</h2>
              </div>
              <p className="text-emerald-400 font-medium text-sm mb-4">{candidate.party}</p>

              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                   <UserCheck className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                   <div>
                     <p className="text-white text-xs leading-snug">{candidate.education}</p>
                     <p className="text-neutral-400 text-xs leading-snug">{candidate.experience}</p>
                   </div>
                </div>
                 <div className="flex gap-2 items-start">
                   <Activity className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                   <p className="text-white text-xs leading-relaxed line-clamp-2">
                     <span className="text-neutral-400 mr-1">Manifesto:</span>
                     {candidate.manifesto.join(' • ')}
                   </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
               <p className="text-neutral-500 text-[10px] uppercase tracking-wider mb-1">Past Performance</p>
               <p className="text-white text-xs italic opacity-80">"{candidate.performance}"</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Action Buttons Below Cards */}
      <div className="absolute -bottom-20 w-full flex justify-center gap-6">
         <button 
           onClick={() => { setExitX(-200); nextCandidate(); }}
           className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors shadow-lg"
         >
           <X className="w-6 h-6" />
         </button>
         <button 
            onClick={() => { setExitX(200); nextCandidate(); }}
           className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-colors shadow-lg"
         >
           <CheckCircle2 className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

