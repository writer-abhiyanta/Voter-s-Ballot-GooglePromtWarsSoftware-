import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Authentication Context Provider
 *
 * Pattern: Observer (React Context publishes to subscriber components).
 * Time Complexity: Context updates O(1)
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: "voter" | "anglo_voter" | "candidate" | null;
  enableDemoMode: (role: "voter" | "anglo_voter" | "candidate") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  enableDemoMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<
    "voter" | "anglo_voter" | "candidate" | null
  >(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (demoMode) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserRole(
              userDoc.data().role as "voter" | "anglo_voter" | "candidate",
            );
          } else {
            setUserRole(null);
          }
        } catch (error) {
          handleFirestoreError(
            error,
            OperationType.GET,
            `users/${firebaseUser.uid}`,
          );
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [demoMode]);

  const enableDemoMode = (role: "voter" | "anglo_voter" | "candidate") => {
    setDemoMode(true);
    setUser({
      uid: "demo-user-1234",
      email: "evaluator@promptwars.ai",
    } as User);
    setUserRole(role);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, userRole, enableDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
