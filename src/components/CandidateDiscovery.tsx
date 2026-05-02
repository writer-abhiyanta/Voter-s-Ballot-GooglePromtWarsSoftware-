import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, UserCheck, Activity, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { generateVoterInsight } from '../services/ai';

/**
 * Interface representing a conceptual political candidate.
 */
interface Candidate {
  id: string;
  name: string;
  party: string;
  education: string;
  experience: string;
  manifesto: string[];
  assets: string;
  liabilities: string;
  criminalRecord: string;
  performance: string;
  imageUrl: string;
  matchScore: number;
}

const CANDIDATES: Candidate[] = [
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
    assets: '$1.2M',
    liabilities: '$300K',
    criminalRecord: 'None',
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
    assets: '$2.5M',
    liabilities: '$150K',
    criminalRecord: 'None',
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
    assets: '$800K',
    liabilities: '$50K',
    criminalRecord: '1 Misdemeanor (Protest-related)',
    performance: 'Led successful campaign to ban single-use plastics locally.',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    matchScore: 0
  }
];

/**
 * Interface representing a quiz question to determine voter alignment.
 */
interface QuizQuestion {
  text: string;
  alignment: { [candidateId: string]: number };
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
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

/** Type representing the current state of the discovery process. */
type Phase = 'intro' | 'quiz' | 'discovery';

/**
 * Candidate Discovery Component
 * 
 * Implements a gamified swiping interface to help voters discover political candidates.
 * Includes a brief quiz to pre-assess alignment score based on key policy issues,
 * utilizing algorithmic matching logic to prioritize candidates with similar viewpoints.
 * 
 * Performance Note: Uses memoization for match score calculations (O(n)).
 * 
 * @returns {JSX.Element} Gamified candidate discovery UI.
 */
export const CandidateDiscovery: React.FC = (): React.ReactElement => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [exitX, setExitX] = useState<number>(0);
  
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false);

  /**
   * Memoized computation of candidate compatibility based on quiz answers.
   * Time complexity: O(C * Q) where C = Candidates, Q = Questions.
   */
  const matchedCandidates = useMemo(() => {
    if (userAnswers.length < QUIZ_QUESTIONS.length) return CANDIDATES;

    return [...CANDIDATES].map(cand => {
      let totalScore = 0;
      QUIZ_QUESTIONS.forEach((q, i) => {
        const uAns = userAnswers[i];
        const cAns = q.alignment[cand.id];
        totalScore += 1 - Math.abs(uAns - cAns) / 2;
      });
      const matchScore = Math.round((totalScore / QUIZ_QUESTIONS.length) * 100);
      return { ...cand, matchScore };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [userAnswers]);

  /**
   * Processes a submitted quiz answer and transitions state.
   * @param {number} val - The numerical value of the selected answer (-1 to 1).
   */
  const handleAnswer = (val: number): void => {
    const newAnswers = [...userAnswers, val];
    setUserAnswers(newAnswers);
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('discovery');
    }
  };

  /**
   * Handles gesture interactions for swiping candidate cards.
   * @param {Event} _event - The original DOM event.
   * @param {PanInfo} info - Contains pan offset and velocity metrics from framer-motion.
   */
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    if (info.offset.x < -100) {
      setExitX(-200);
      nextCandidate();
    } else if (info.offset.x > 100) {
       setExitX(200);
       nextCandidate();
    }
  };

  /** advance to the next candidate card after a short animation delay */
  const nextCandidate = (): void => {
    setTimeout(() => {
      if (currentIndex < matchedCandidates.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setExitX(0);
      } else {
         setCurrentIndex(matchedCandidates.length);
      }
    }, 200);
  };

  // Generate AI Insight when completion is reached
  useEffect(() => {
    if (currentIndex >= matchedCandidates.length && matchedCandidates.length > 0 && !aiInsight && !isGeneratingInsight) {
      setIsGeneratingInsight(true);
      const topCand = matchedCandidates[0];
      const answerAlignments = userAnswers.map((ans, idx) => {
         const agreement = ans === 1 ? 'strong agreement with' : ans === 0 ? 'neutrality towards' : 'strong disagreement with';
         return `User has ${agreement}: "${QUIZ_QUESTIONS[idx].text}"`;
      });
      generateVoterInsight(topCand.name, answerAlignments).then(insight => {
        setAiInsight(insight);
        setIsGeneratingInsight(false);
      });
    }
  }, [currentIndex, matchedCandidates, aiInsight, isGeneratingInsight, userAnswers]);

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-neutral-950 rounded-3xl" aria-labelledby="intro-title">
        <Activity className="w-16 h-16 text-emerald-500 mb-4" aria-hidden="true" />
        <h2 id="intro-title" className="text-2xl font-bold text-white mb-4">Discover Your Candidates</h2>
        <p className="text-neutral-400 mb-8 max-w-lg mx-auto">Take a quick 5-question match quiz to see which candidates align best with your values and priorities.</p>
        <button 
          onClick={() => setPhase('quiz')}
          aria-label="Start candidate match quiz"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          Start Match Quiz
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (phase === 'quiz') {
    const question = QUIZ_QUESTIONS[currentQuestionIndex];
    const progressPercent = Math.round((currentQuestionIndex / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6" aria-labelledby="quiz-question">
        <div className="w-full mb-8">
          <div className="flex justify-between text-xs text-neutral-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
            <span>{progressPercent}%</span>
          </div>
          {/* Accessible Progress Bar */}
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Quiz progress: ${progressPercent}%`}>
            <div 
              className="h-full bg-emerald-500 transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
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
            role="group"
            aria-labelledby="quiz-question"
          >
            <h3 id="quiz-question" className="text-2xl font-medium text-white text-center mb-10 leading-relaxed min-h-[100px]">
              "{question.text}"
            </h3>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => handleAnswer(1)}
                aria-label="Strongly Agree"
                className="w-full py-4 px-6 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-400 transition-all font-medium text-white flex justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Strongly Agree
              </button>
              <button 
                onClick={() => handleAnswer(0)}
                aria-label="Neutral response"
                className="w-full py-4 px-6 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition-all font-medium text-neutral-300 flex justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Neutral
              </button>
              <button 
                onClick={() => handleAnswer(-1)}
                aria-label="Strongly Disagree"
                className="w-full py-4 px-6 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-all font-medium text-white flex justify-center items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
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
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-neutral-950 rounded-3xl" aria-live="polite">
        <Activity className="w-16 h-16 text-emerald-500 mb-4" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-white mb-2">Discovery Complete</h3>
        <p className="text-neutral-400 max-w-sm mx-auto mb-8">You've reviewed all candidates in your district. Check your shortlist to compare them in detail.</p>
        
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 max-w-lg w-full text-left relative overflow-hidden shadow-lg shadow-emerald-900/20">
           <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" aria-hidden="true" />
           <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
             <Activity className="w-4 h-4" /> AI Match Analysis
           </p>
           {isGeneratingInsight ? (
             <div className="flex items-center gap-3 text-neutral-400">
               <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
               Generating personalized political alignment insight...
             </div>
           ) : (
             <p className="text-neutral-200 text-sm leading-relaxed">{aiInsight}</p>
           )}
        </div>
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
          role="region"
          aria-label={`Detailed profile of candidate ${candidate.name}`}
        >
          {/* Card Image Section */}
          <div className="relative h-1/2 w-full">
            <img 
              src={candidate.imageUrl} 
              alt={`Portrait of ${candidate.name}`}
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" aria-hidden="true" />
            
            {/* Match Badge */}
            <div className="absolute top-4 right-4 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <span className="text-emerald-400 font-bold text-sm" aria-label={`Match score ${candidate.matchScore}%`}>{candidate.matchScore}%</span>
               <span className="text-emerald-300/80 text-xs text-uppercase tracking-wider" aria-hidden="true">Match</span>
            </div>
          </div>

          <div className="p-6 h-1/2 flex flex-col justify-between" tabIndex={0}>
            <div>
              <div className="flex justify-between items-end mb-1">
                <h2 className="text-2xl font-bold text-white capitalize leading-none">{candidate.name}</h2>
              </div>
              <p className="text-emerald-400 font-medium text-sm mb-4">{candidate.party}</p>

              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                   <UserCheck className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" aria-hidden="true" />
                   <div>
                     <p className="text-white text-xs leading-snug">{candidate.education}</p>
                     <p className="text-neutral-400 text-xs leading-snug">{candidate.experience}</p>
                   </div>
                </div>
                 <div className="flex gap-2 items-start">
                   <Activity className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" aria-hidden="true" />
                   <p className="text-white text-xs leading-relaxed line-clamp-2">
                     <span className="text-neutral-400 mr-1">Manifesto:</span>
                     {candidate.manifesto.join(' • ')}
                   </p>
                </div>
                 <div className="flex gap-2 items-start justify-between w-full mt-2">
                     <div className="flex items-center gap-1">
                         <span className="text-neutral-400 text-xs">Assets:</span>
                         <span className="text-emerald-400 text-xs font-semibold">{candidate.assets}</span>
                     </div>
                     <div className="flex items-center gap-1">
                         <span className="text-neutral-400 text-xs">Liabilities:</span>
                         <span className="text-emerald-400 text-xs font-semibold">{candidate.liabilities}</span>
                     </div>
                     <div className="flex items-center gap-1">
                         <span className="text-neutral-400 text-xs">Businesses:</span>
                         <span className="text-emerald-400 text-xs font-semibold">Verified</span>
                     </div>
                 </div>
                 <div className="flex gap-2 items-start w-full mt-1">
                     <span className="text-neutral-400 text-xs">Criminal Record:</span>
                     <span className={`text-xs font-semibold ${candidate.criminalRecord === 'None' ? 'text-emerald-400' : 'text-amber-400'}`}>
                       {candidate.criminalRecord}
                     </span>
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
      
      {/* Action Buttons Below Cards - Kept accessible */}
      <div className="absolute -bottom-20 w-full flex justify-center gap-6">
         <button 
           onClick={() => { setExitX(-200); nextCandidate(); }}
           aria-label="Reject candidate"
           title="Reject"
           className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
         >
           <X className="w-6 h-6" aria-hidden="true" />
         </button>
         <button 
            onClick={() => { setExitX(200); nextCandidate(); }}
           aria-label="Shortlist candidate"
           title="Shortlist"
           className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
         >
           <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
         </button>
      </div>
    </div>
  );
};

