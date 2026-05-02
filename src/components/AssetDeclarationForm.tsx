import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Save, Briefcase, Home, Car, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { storage, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AssetFile {
  file: File;
  category: string;
}

export const AssetDeclarationForm: React.FC = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Forms state
  const [businesses, setBusinesses] = useState([{ name: '', registrationNo: '', value: '' }]);
  const [properties, setProperties] = useState([{ address: '', type: 'Residential', value: '' }]);
  const [vehicles, setVehicles] = useState([{ makeModel: '', year: '', value: '' }]);
  const [assetFiles, setAssetFiles] = useState<AssetFile[]>([]);

  const handleAddBusiness = () => setBusinesses([...businesses, { name: '', registrationNo: '', value: '' }]);
  const handleAddProperty = () => setProperties([...properties, { address: '', type: 'Residential', value: '' }]);
  const handleAddVehicle = () => setVehicles([...vehicles, { makeModel: '', year: '', value: '' }]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({ file: f, category }));
      setAssetFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // 1. Upload files to Storage
      const uploadedDocuments: { url: string; category: string; name: string }[] = [];
      let completed = 0;

      for (const assetFile of assetFiles) {
        const fileRef = ref(storage, `assets/${user.uid}/${Date.now()}_${assetFile.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
        const uploadTask = uploadBytesResumable(fileRef, assetFile.file);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (err) => reject(err),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedDocuments.push({
                url: downloadURL,
                category: assetFile.category,
                name: assetFile.file.name,
              });
              completed++;
              setUploadProgress(Math.round((completed / assetFiles.length) * 100));
              resolve();
            }
          );
        });
      }

      // 2. Save data to Firestore
      try {
        await addDoc(collection(db, 'assetDeclarations'), {
          userId: user.uid,
          businesses,
          properties,
          vehicles,
          documents: uploadedDocuments,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'assetDeclarations');
      }

      setIsSuccess(true);
      // Reset form
      setBusinesses([{ name: '', registrationNo: '', value: '' }]);
      setProperties([{ address: '', type: 'Residential', value: '' }]);
      setVehicles([{ makeModel: '', year: '', value: '' }]);
      setAssetFiles([]);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to upload assets. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-8" aria-labelledby="asset-declaration-title">
      <header className="mb-8">
        <h2 id="asset-declaration-title" className="text-3xl font-bold text-white mb-2">Asset Declaration & Document Upload</h2>
        <p className="text-neutral-400 text-sm">Industry-ready compliance standard. Declare your business, property, and vehicle assets securely for electoral auditing.</p>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="space-y-8"
      >
        {/* Business Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Briefcase className="w-5 h-5" />
            <h3 className="text-xl font-bold">Business Holdings</h3>
          </div>
          <div className="space-y-4">
            {businesses.map((biz, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Business Name" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newBiz = [...businesses];
                    newBiz[idx].name = e.target.value;
                    setBusinesses(newBiz);
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Registration / Tax ID" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newBiz = [...businesses];
                    newBiz[idx].registrationNo = e.target.value;
                    setBusinesses(newBiz);
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Estimated Value ($)" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newBiz = [...businesses];
                    newBiz[idx].value = e.target.value;
                    setBusinesses(newBiz);
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={handleAddBusiness} className="text-sm font-medium text-emerald-500 hover:text-emerald-400">+ Add Another Business</button>
          </div>
        </div>

        {/* Properties Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Home className="w-5 h-5" />
            <h3 className="text-xl font-bold">Real Estate & Properties</h3>
          </div>
          <div className="space-y-4">
            {properties.map((prop, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Address or Location" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newProp = [...properties];
                    newProp[idx].address = e.target.value;
                    setProperties(newProp);
                  }}
                />
                <select 
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  value={prop.type}
                  onChange={(e) => {
                    const newProp = [...properties];
                    newProp[idx].type = e.target.value;
                    setProperties(newProp);
                  }}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Agricultural">Agricultural</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Estimated Value ($)" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newProp = [...properties];
                    newProp[idx].value = e.target.value;
                    setProperties(newProp);
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={handleAddProperty} className="text-sm font-medium text-emerald-500 hover:text-emerald-400">+ Add Another Property</button>
          </div>
        </div>

        {/* Vehicles Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Car className="w-5 h-5" />
            <h3 className="text-xl font-bold">Vehicles</h3>
          </div>
          <div className="space-y-4">
            {vehicles.map((veh, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  placeholder="Make and Model" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newVeh = [...vehicles];
                    newVeh[idx].makeModel = e.target.value;
                    setVehicles(newVeh);
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Year" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newVeh = [...vehicles];
                    newVeh[idx].year = e.target.value;
                    setVehicles(newVeh);
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Estimated Value ($)" 
                  required
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  onChange={(e) => {
                    const newVeh = [...vehicles];
                    newVeh[idx].value = e.target.value;
                    setVehicles(newVeh);
                  }}
                />
              </div>
            ))}
            <button type="button" onClick={handleAddVehicle} className="text-sm font-medium text-emerald-500 hover:text-emerald-400">+ Add Another Vehicle</button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <FileUp className="w-5 h-5" />
            <h3 className="text-xl font-bold">Supporting Documents</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Business Forms', 'Property Forms', 'Vehicle Forms', 'Residential Forms'].map((category) => (
              <div key={category} className="border border-neutral-800 rounded-xl p-4 bg-neutral-950">
                <label className="block text-sm font-medium text-neutral-300 mb-2">{category}</label>
                <input 
                  type="file" 
                  multiple
                  onChange={(e) => handleFileChange(e, category)}
                  className="block w-full text-sm text-neutral-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-emerald-500/10 file:text-emerald-400
                    hover:file:bg-emerald-500/20"
                />
                <div className="mt-2 flex flex-col gap-1">
                  {assetFiles.filter(f => f.category === category).map((f, i) => (
                    <div key={i} className="text-xs text-neutral-500 truncate flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {f.file.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {isSubmitting && assetFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Uploading Documents...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : isSuccess ? (
              <><CheckCircle2 className="w-5 h-5" /> Saved Securely</>
            ) : (
              <><Save className="w-5 h-5" /> Submit Asset Declaration</>
            )}
          </button>
        </div>
      </motion.form>
    </section>
  );
};
