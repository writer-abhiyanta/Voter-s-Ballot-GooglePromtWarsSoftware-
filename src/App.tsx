import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Login from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

import { motion } from 'framer-motion';
import { useAuth } from './components/AuthProvider';
import { auth } from './lib/firebase';
import { LogOut, BadgeCheck, Clock, MapPin, Search, ClipboardList, TrendingUp, BookOpen, ShieldAlert } from 'lucide-react';

// Lazy load components for performance optimization (Code Splitting)
const EnrollmentMission = React.lazy(() => import('./components/EnrollmentMission').then(m => ({ default: m.EnrollmentMission })));
const CandidateDiscovery = React.lazy(() => import('./components/CandidateDiscovery').then(m => ({ default: m.CandidateDiscovery })));
const LearnElectionProcess = React.lazy(() => import('./components/LearnElectionProcess').then(m => ({ default: m.LearnElectionProcess })));
const SubmitFraud = React.lazy(() => import('./components/SubmitFraud').then(m => ({ default: m.SubmitFraud })));
const AssetDetails = React.lazy(() => import('./components/AssetDetails').then(m => ({ default: m.AssetDetails })));
const ElectionTimeline = React.lazy(() => import('./components/ElectionTimeline').then(m => ({ default: m.ElectionTimeline })));
const ManifestoManager = React.lazy(() => import('./components/ManifestoManager'));
const ManifestoTracker = React.lazy(() => import('./components/ManifestoTracker').then(m => ({ default: m.ManifestoTracker })));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex justify-center items-center h-full w-full">
    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" aria-label="Loading content..." role="status"></div>
  </div>
);

function Dashboard() {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'enrollment' | 'discovery' | 'manifesto' | 'manifesto-tracker' | 'learn' | 'fraud' | 'timeline' | 'assets'>('enrollment');
  const [level1Done, setLevel1Done] = React.useState(false); // In real app, fetch from Firestore
  const [isBadgeEarned, setIsBadgeEarned] = React.useState(false);

  React.useEffect(() => {
    if (userRole === 'candidate') {
      setActiveTab('manifesto');
    } else {
      setActiveTab('enrollment');
    }
  }, [userRole]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col relative overflow-hidden">
      {/* Background voting animations */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <motion.div animate={{y: [100, -100], x: [0, 20, 0], opacity: [0, 0.4, 0]}} transition={{repeat: Infinity, duration: 8, ease: "linear"}} className="absolute bottom-10 left-[10%] text-emerald-500/10 text-6xl">✉️</motion.div>
         <motion.div animate={{y: [100, -150], x: [0, -30, 0], opacity: [0, 0.3, 0]}} transition={{repeat: Infinity, duration: 12, ease: "linear", delay: 2}} className="absolute bottom-20 right-[20%] text-emerald-500/10 text-8xl">🗳️</motion.div>
         <motion.div animate={{y: [100, -120], opacity: [0, 0.5, 0]}} transition={{repeat: Infinity, duration: 10, ease: "linear", delay: 5}} className="absolute bottom-0 left-[50%] text-emerald-500/10 text-7xl">✓</motion.div>
      </div>

      <header className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div>
           <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
             Voter's Ballot
             {isBadgeEarned && (
               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30" title="Badge of Informed Voter">
                 <BadgeCheck className="w-3 h-3" />
                 Informed Voter
               </span>
             )}
           </h1>
           <p className="text-xs text-neutral-400 capitalize">{userRole?.replace('_', ' ')} • Voter ID: {user?.uid ? `VTR-${user.uid.substring(0, 6).toUpperCase()}` : 'PENDING'}</p>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Navigation Tabs */}
        <div 
          className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-neutral-800" 
          role="tablist" 
          aria-label="Dashboard views"
        >
           {userRole === 'candidate' ? (
             <TabButton 
               active={activeTab === 'manifesto'} 
               onClick={() => setActiveTab('manifesto')}
               title="My Manifesto"
               id="tab-manifesto"
             />
           ) : (
             <>
                <TabButton 
                  active={activeTab === 'enrollment'} 
                  onClick={() => setActiveTab('enrollment')}
                  title="Enrollment"
                  id="tab-enrollment"
                />
                <TabButton 
                  active={activeTab === 'discovery'} 
                  onClick={() => setActiveTab('discovery')}
                  title="Manifesto Followed"
                  id="tab-discovery"
                />
                <TabButton 
                  active={activeTab === 'manifesto-tracker'} 
                  onClick={() => setActiveTab('manifesto-tracker')}
                  title="Manifesto"
                  id="tab-manifesto-tracker"
                />
                <TabButton 
                  active={activeTab === 'learn'} 
                  onClick={() => setActiveTab('learn')}
                  title="Gamified Learn"
                  id="tab-learn"
                />
                <TabButton 
                  active={activeTab === 'fraud'} 
                  onClick={() => setActiveTab('fraud')}
                  title="Submit Fraud"
                  id="tab-fraud"
                />
                <TabButton 
                  active={activeTab === 'assets'} 
                  onClick={() => setActiveTab('assets')}
                  title="Asset Details"
                  id="tab-assets"
                />
                <TabButton 
                  active={activeTab === 'timeline'} 
                  onClick={() => setActiveTab('timeline')}
                  title="Timeline"
                  id="tab-timeline"
                />
             </>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" role="tabpanel" tabIndex={0} aria-labelledby={`tab-${activeTab}`}>
          <Suspense fallback={<PageLoader />}>
            {activeTab === 'manifesto' && (
               <ManifestoManager />
            )}
            {activeTab === 'enrollment' && (
              level1Done ? (
                <div className="flex flex-col items-center justify-center h-full text-center fade-in">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                     <BadgeCheck className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Voter Avatar Unlocked!</h2>
                  <p className="text-neutral-400 mb-8 max-w-md">You've successfully gathered all required documents. You are now ready to explore candidates.</p>
                  <button 
                    onClick={() => setActiveTab('discovery')}
                    className="bg-white text-black px-6 py-3 rounded-xl font-medium focus:ring-4 focus:ring-emerald-500/50"
                  >
                    Manifesto Followed
                  </button>
                </div>
              ) : (
                <EnrollmentMission onComplete={() => setLevel1Done(true)} />
              )
            )}

            {activeTab === 'discovery' && (
              <div className="h-full pt-8">
                <CandidateDiscovery />
              </div>
            )}

            {activeTab === 'manifesto-tracker' && (
              <div className="h-full pt-8">
                <ManifestoTracker />
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="h-full pt-8">
                <LearnElectionProcess onComplete={() => setIsBadgeEarned(true)} />
              </div>
            )}

            {activeTab === 'fraud' && (
              <div className="h-full pt-8">
                <SubmitFraud />
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="h-full pt-8 pb-12">
                <ElectionTimeline />
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="h-full pt-8 pb-12">
                <AssetDetails />
              </div>
            )}
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function TabButton({ active, onClick, title, disabled = false, id }: { active: boolean, onClick: () => void, title: string, disabled?: boolean, id?: string }) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
        active 
          ? 'bg-white text-black' 
          : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {title}
    </button>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<Dashboard />} />
             {/* Add more routes here */}
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
