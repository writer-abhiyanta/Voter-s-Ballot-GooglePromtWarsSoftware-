import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, FileText, Camera, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthProvider';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

/**
 * Interface mapping out required documents for the enrollment mission.
 */
interface RequiredDocument {
  id: string;
  title: string;
  icon: React.ElementType;
  desc: string;
  color: string;
  bg: string;
}

const DOCUMENTS: RequiredDocument[] = [
  { id: 'id', title: 'Identity Proof', icon: BadgeCheck, desc: 'Aadhar, PAN, or Passport', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'address', title: 'Address Proof', icon: MapPin, desc: 'Utility bill or Rent agreement', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'age', title: 'Age Declaration', icon: FileText, desc: 'Form 6 for 18+ verification', color: 'text-green-400', bg: 'bg-green-400/10' }
];

/**
 * Enrollment Mission Component
 * 
 * Simulates a document scanning mission for a user. Helps users gather necessary
 * documents to unlock voter avatars in a gamified context. Designed with cognitive 
 * ease and AAA interaction criteria.
 * 
 * @param {Object} props - Properties for the component.
 * @param {Function} props.onComplete - Callback that fires when all documents are handled.
 * @returns {JSX.Element} Interactive list of documents to scan.
 */
export const EnrollmentMission: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [collected, setCollected] = useState<string[]>([]);
  const [scanning, setScanning] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Triggers the simulated optical scanning of a document.
   * Modifies component state and checks for completion conditions.
   * 
   * @param {string} id - The unique identifier of the document being scanned.
   */
  const handleCollect = (id: string): void => {
    setScanning(id);
    // Simulate AR scanning delay and process capture
    setTimeout(() => {
      setScanning(null);
      if (!collected.includes(id)) {
        const newCollected = [...collected, id];
        setCollected(newCollected);
        
        // Minor visual feedback: confetti pop for finding an item
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#14b8a6', '#22c55e'],
          shapes: ['square']
        });

        if (newCollected.length === DOCUMENTS.length) {
          handleLevelComplete();
        }
      }
    }, 1500);
  };

  /**
   * Asynchronous handler for completing the level.
   * Fires a database update and triggers the onComplete callback.
   */
  const handleLevelComplete = async (): Promise<void> => {
    // Large visual feedback: Big confetti pop for level complete
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      zIndex: 9999,
      colors: ['#10b981', '#14b8a6', '#22c55e', '#059669', '#34d399'],
      shapes: ['square']
    });

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          level1Completed: true,
          points: 100, // Award initial gamified points
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    
    // Defer the UI transition to let confeti run
    setTimeout(onComplete, 3000);
  };

  const progressPercent = Math.round((collected.length / DOCUMENTS.length) * 100);

  return (
    <section className="max-w-md mx-auto h-[calc(100vh-80px)] flex flex-col pt-8" aria-labelledby="mission-title">
      <header className="mb-8">
        <h2 id="mission-title" className="text-3xl font-bold text-white mb-2 tracking-tight">The Enrollment Mission</h2>
        <p className="text-neutral-400 text-sm">Find and scan the {DOCUMENTS.length} required documents to unlock your Voter Avatar.</p>
      </header>

      <div className="flex-1 space-y-4" role="list">
        {DOCUMENTS.map((docItem) => {
          const isCollected = collected.includes(docItem.id);
          const isScanning = scanning === docItem.id;
          const Icon = docItem.icon;

          return (
            <motion.div
              key={docItem.id}
              layout
              role="listitem"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-colors duration-500 ${
                isCollected 
                  ? 'bg-emerald-500/10 border-emerald-500/40' 
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${docItem.bg}`} aria-hidden="true">
                  <Icon className={`w-6 h-6 ${docItem.color}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium">{docItem.title}</h3>
                  <p className="text-neutral-500 text-xs">{docItem.desc}</p>
                </div>

                <div className="shrink-0">
                  {isCollected ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <BadgeCheck className="w-8 h-8 text-emerald-500" aria-label={`Successfully scanned ${docItem.title}`} />
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => handleCollect(docItem.id)}
                      disabled={isScanning || !!scanning}
                      aria-label={isScanning ? `Scanning ${docItem.title}...` : `Initialize scan for ${docItem.title}`}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
                        isScanning 
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                          : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                      }`}
                    >
                      <Camera className="w-5 h-5" aria-hidden="true" />
                      {isScanning && (
                         <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Scanning visual effect */}
              {isScanning && (
                <motion.div 
                  initial={{ top: '-100%' }}
                  animate={{ top: '200%' }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute left-0 w-full h-8 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent blur-sm z-10"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <footer className="mt-auto mb-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
        <div aria-live="polite">
          <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1" id="progress-label">Progress</p>
          <div className="flex items-baseline gap-1" aria-labelledby="progress-label">
            <span className="text-2xl font-bold text-white">{collected.length}</span>
            <span className="text-neutral-500">/ {DOCUMENTS.length}</span>
          </div>
        </div>
        <div className="flex-1 max-w-[120px]" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Mission Progress: ${progressPercent}%`}>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </footer>
    </section>
  );
};
