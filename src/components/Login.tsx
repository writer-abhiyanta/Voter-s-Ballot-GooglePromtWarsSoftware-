import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Mail, CheckCircle2, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'voter' | 'anglo_voter' | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a role before signing in.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        try {
           await setDoc(userRef, {
            email: user.email,
            role: selectedRole,
            points: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch(e) {
           handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed') {
        setError('Network error. If you are using a preview, please open the app in a new tab or enable third-party cookies.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background blobs */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px]"></motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute top-40 -right-40 w-96 h-96 bg-green-600/20 rounded-full mix-blend-screen filter blur-[100px]"></motion.div>
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 22, ease: "linear" }} className="absolute -bottom-40 left-40 w-96 h-96 bg-teal-600/20 rounded-full mix-blend-screen filter blur-[100px]"></motion.div>
      </div>

      {/* Floating voting icons */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div animate={{y: [100, -200], x: [-20, 20, -20], opacity: [0, 0.4, 0], rotate: [0, 10, -10, 0]}} transition={{repeat: Infinity, duration: 15, ease: "linear"}} className="absolute top-[20%] left-[15%] text-emerald-500/20 text-5xl">✅</motion.div>
        <motion.div animate={{y: [50, -150], x: [10, -10, 10], opacity: [0, 0.3, 0], rotate: [0, -10, 10, 0]}} transition={{repeat: Infinity, duration: 12, ease: "linear", delay: 2}} className="absolute bottom-[30%] right-[10%] text-emerald-500/20 text-6xl">🗳️</motion.div>
        <motion.div animate={{y: [0, -250], x: [-10, 30, -10], opacity: [0, 0.5, 0], rotate: [0, 20, -10, 0]}} transition={{repeat: Infinity, duration: 20, ease: "linear", delay: 5}} className="absolute top-[60%] left-[30%] text-emerald-500/20 text-7xl">✉️</motion.div>
        <motion.div animate={{y: [120, -100], x: [20, -20, 20], opacity: [0, 0.3, 0], rotate: [0, 360]}} transition={{repeat: Infinity, duration: 18, ease: "linear", delay: 8}} className="absolute top-[10%] right-[25%] text-teal-500/20 text-5xl">🏛️</motion.div>
        <motion.div animate={{y: [200, -50], x: [-30, 10, -30], opacity: [0, 0.4, 0], rotate: [0, -360]}} transition={{repeat: Infinity, duration: 25, ease: "linear", delay: 1}} className="absolute bottom-[20%] left-[5%] text-green-500/20 text-8xl">📜</motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-emerald-950/40 border border-emerald-900/50 backdrop-blur-md rounded-2xl p-8 relative z-10 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 h-20 relative">
            {/* Ballot Box */}
            <div className="absolute bottom-0 w-16 h-14 bg-emerald-500 border-2 border-emerald-400 rounded-lg flex items-center justify-center z-10 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <div className="w-10 h-1.5 bg-emerald-900 rounded-full"></div>
            </div>
            {/* Envelope/Ballot falling */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: [ -30, 15, 15 ], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeIn" }}
              className="absolute z-0 w-8 h-10 bg-emerald-100 rounded-sm border border-emerald-300 flex flex-col items-center justify-center gap-1 shadow-lg"
            >
               <div className="w-4 h-0.5 bg-emerald-400"></div>
               <div className="w-4 h-0.5 bg-emerald-400"></div>
               <div className="w-2 h-0.5 bg-emerald-400"></div>
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Voter's Ballot</h1>
          <p className="text-neutral-400 text-sm">Your journey to becoming an informed voter starts here.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6 mb-8">
            <div>
              <p className="text-neutral-300 text-sm font-medium mb-3 text-center">Select your role to join</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={() => setSelectedRole('voter')}
                  className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    selectedRole === 'voter' 
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-emerald-950/40 border-emerald-900/50 hover:border-emerald-700/50'
                  }`}
                >
                  {selectedRole === 'voter' && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />}
                  <User className={`w-8 h-8 ${selectedRole === 'voter' ? 'text-emerald-500' : 'text-emerald-700/50'}`} />
                  <span className={`text-sm font-medium italic ${selectedRole === 'voter' ? 'text-emerald-400' : 'text-emerald-500/70'}`}>Indian Voter</span>
                </button>
                <button
                   onClick={() => setSelectedRole('anglo_voter')}
                   className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    selectedRole === 'anglo_voter' 
                      ? 'bg-teal-500/10 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                      : 'bg-teal-950/40 border-teal-900/50 hover:border-teal-700/50'
                  }`}
                >
                  {selectedRole === 'anglo_voter' && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-teal-500" />}
                  <Users className={`w-8 h-8 ${selectedRole === 'anglo_voter' ? 'text-teal-500' : 'text-teal-700/50'}`} />
                  <span className={`text-sm font-medium italic ${selectedRole === 'anglo_voter' ? 'text-teal-400' : 'text-teal-500/70'}`}>Anglo Indian Voter</span>
                </button>
              </div>
            </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !selectedRole}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Join with Google</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
