import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  Plus,
  Save,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ManifestoItem = {
  id: string;
  text: string;
  status: "todo" | "in-progress" | "completed";
};

type CandidateProfile = {
  name: string;
  party: string;
  education: string;
  experience: string;
  imageUrl: string;
  manifestoItems: ManifestoItem[];
  performance: string;
};

export default function ManifestoManager() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (user?.uid === "demo-user-1234") {
      setProfile({
        name: "Demo Candidate",
        party: "Demo Party",
        education: "",
        experience: "",
        imageUrl: "",
        manifestoItems: [],
        performance: "",
      });
      setIsEditingProfile(true);
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "candidates", user!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setProfile({
          name: data.name || "",
          party: data.party || "",
          education: data.education || "",
          experience: data.experience || "",
          imageUrl: data.imageUrl || "",
          manifestoItems: data.manifestoItems || [],
          performance: data.performance || "",
        });
      } else {
        setProfile({
          name: "",
          party: "",
          education: "",
          experience: "",
          imageUrl: "",
          manifestoItems: [],
          performance: "",
        });
        setIsEditingProfile(true);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `candidates/${user?.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    if (user?.uid === "demo-user-1234") {
      setIsEditingProfile(false);
      return;
    }
    try {
      const docRef = doc(db, "candidates", user!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { ...profile });
      } else {
        await setDoc(docRef, { ...profile, userId: user!.uid });
      }
      setIsEditingProfile(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `candidates/${user?.uid}`);
    }
  };

  const addManifestoItem = async () => {
    if (!newItemText.trim() || !profile) return;

    const newItem: ManifestoItem = {
      id: Math.random().toString(36).substring(7),
      text: newItemText,
      status: "todo",
    };

    const updatedProfile = {
      ...profile,
      manifestoItems: [...profile.manifestoItems, newItem],
    };

    setProfile(updatedProfile);
    setNewItemText("");

    if (user?.uid === "demo-user-1234") return;

    try {
      const docRef = doc(db, "candidates", user!.uid);
      await updateDoc(docRef, {
        manifestoItems: updatedProfile.manifestoItems,
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `candidates/${user?.uid}`);
    }
  };

  const updateItemStatus = async (
    id: string,
    newStatus: ManifestoItem["status"],
  ) => {
    if (!profile) return;

    const updatedItems = profile.manifestoItems.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );

    const updatedProfile = { ...profile, manifestoItems: updatedItems };
    setProfile(updatedProfile);
    
    if (user?.uid === "demo-user-1234") return;

    try {
      const docRef = doc(db, "candidates", user!.uid);
      await updateDoc(docRef, { manifestoItems: updatedItems });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `candidates/${user?.uid}`);
    }
  };

  const deleteItem = async (id: string) => {
    if (!profile) return;

    const updatedItems = profile.manifestoItems.filter(
      (item) => item.id !== id,
    );

    const updatedProfile = { ...profile, manifestoItems: updatedItems };
    setProfile(updatedProfile);
    
    if (user?.uid === "demo-user-1234") return;

    try {
      const docRef = doc(db, "candidates", user!.uid);
      await updateDoc(docRef, { manifestoItems: updatedItems });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `candidates/${user?.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Manifesto</h2>
          <p className="text-neutral-400">
            Manage your promises and update your constituents on your progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="col-span-1">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Profile</h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profile?.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p!, name: e.target.value }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-party"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    Party
                  </label>
                  <input
                    id="profile-party"
                    type="text"
                    value={profile?.party}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p!, party: e.target.value }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-education"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    Education
                  </label>
                  <input
                    id="profile-education"
                    type="text"
                    value={profile?.education}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p!, education: e.target.value }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-experience"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    Experience (short)
                  </label>
                  <input
                    id="profile-experience"
                    type="text"
                    value={profile?.experience}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p!, experience: e.target.value }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-image"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    Image URL
                  </label>
                  <input
                    id="profile-image"
                    type="text"
                    value={profile?.imageUrl}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p!, imageUrl: e.target.value }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-performance"
                    className="block text-xs font-medium text-neutral-400 mb-1"
                  >
                    Past Performance / Quote
                  </label>
                  <textarea
                    id="profile-performance"
                    value={profile?.performance}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p!,
                        performance: e.target.value,
                      }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20"
                  />
                </div>
                <button
                  onClick={saveProfile}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile?.imageUrl && (
                  <img
                    src={profile.imageUrl}
                    alt={profile.name}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                )}
                <div>
                  <h4 className="font-bold text-white text-xl">
                    {profile?.name || "Unnamed Candidate"}
                  </h4>
                  <p className="text-emerald-400 text-sm">
                    {profile?.party || "No Party specified"}
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-800 text-sm space-y-2 text-neutral-300">
                  <p>
                    <span className="text-neutral-500">Edu:</span>{" "}
                    {profile?.education || "-"}
                  </p>
                  <p>
                    <span className="text-neutral-500">Exp:</span>{" "}
                    {profile?.experience || "-"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manifesto Items */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6">
              Promises & Implementation
            </h3>

            <div className="flex gap-2 mb-6">
              <label htmlFor="new-manifesto-item" className="sr-only">
                New Manifesto Promise
              </label>
              <input
                id="new-manifesto-item"
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManifestoItem()}
                placeholder="E.g., 100% Renewable Energy by 2030"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={addManifestoItem}
                disabled={!newItemText.trim()}
                aria-label="Add manifesto item"
                className="bg-white text-black px-4 rounded-xl font-medium disabled:opacity-50 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {profile?.manifestoItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">{item.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`status-${item.id}`} className="sr-only">
                        Update status for {item.text}
                      </label>
                      <select
                        id={`status-${item.id}`}
                        value={item.status}
                        onChange={(e) =>
                          updateItemStatus(item.id, e.target.value as any)
                        }
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
                          item.status === "completed"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : item.status === "in-progress"
                              ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                              : "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400"
                        }`}
                      >
                        <option value="todo">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => deleteItem(item.id)}
                        aria-label={`Delete manifesto item: ${item.text}`}
                        className="p-2 text-neutral-500 hover:text-red-400 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {profile?.manifestoItems.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No manifesto promises added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
