import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2, ShieldAlert, BadgeCheck, FileText, Camera, MapPin, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthProvider';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const DOCUMENTS = [
  { id: 'id', title: 'Identity Proof', icon: BadgeCheck, desc: 'Aadhar, PAN, or Passport', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'address', title: 'Address Proof', icon: MapPin, desc: 'Utility bill or Rent agreement', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'age', title: 'Age Declaration', icon: FileText, desc: 'Form 6 for 18+ verification', color: 'text-green-400', bg: 'bg-green-400/10' }
];

export const EnrollmentMission: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [collected, setCollected] = useState<string[]>([]);
  const [scanning, setScanning] = useState<string | null>(null);
  const { user } = useAuth();

  const handleCollect = (id: string) => {
    setScanning(id);
    // Simulate AR scanning delay
    setTimeout(() => {
      setScanning(null);
      if (!collected.includes(id)) {
        const newCollected = [...collected, id];
        setCollected(newCollected);
        
        // Small confetti pop for finding an item
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

  const handleLevelComplete = async () => {
    // Big confetti pop for level complete
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
          points: 100, // Award initial points
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    
    setTimeout(onComplete, 3000);
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-80px)] flex flex-col pt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">The Enrollment Mission</h2>
        <p className="text-neutral-400 text-sm">Find and scan the 3 required documents to unlock your Voter Avatar.</p>
      </div>

      <div className="flex-1 space-y-4">
        {DOCUMENTS.map((doc) => {
          const isCollected = collected.includes(doc.id);
          const isScanning = scanning === doc.id;
          const Icon = doc.icon;

          return (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-colors duration-500 ${
                isCollected 
                  ? 'bg-emerald-500/10 border-emerald-500/40' 
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.bg}`}>
                  <Icon className={`w-6 h-6 ${doc.color}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium">{doc.title}</h3>
                  <p className="text-neutral-500 text-xs">{doc.desc}</p>
                </div>

                <div className="shrink-0">
                  {isCollected ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => handleCollect(doc.id)}
                      disabled={isScanning || !!scanning}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                        isScanning 
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                          : 'border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                      {isScanning && (
                         <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
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
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto mb-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Progress</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{collected.length}</span>
            <span className="text-neutral-500">/ 3</span>
          </div>
        </div>
        <div className="flex-1 max-w-[120px]">
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(collected.length / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
