import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Circle, ChevronRight, BarChart3 } from 'lucide-react';

/**
 * Interface mapping individual promises mapped within a candidate's manifesto.
 */
interface ManifestoPromise {
  id: string;
  text: string;
  status: 'completed' | 'in-progress' | 'todo';
  update: string;
}

/**
 * Interface for the manifesto data.
 */
interface ManifestoData {
  id: string;
  name: string;
  party: string;
  imageUrl: string;
  promises: ManifestoPromise[];
}

const MANIFESTO_DATA: ManifestoData[] = [
  {
    id: '1',
    name: 'oiela quarter',
    party: 'Progressive Future',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    promises: [
      { id: '1a', text: '100% Renewable Energy by 2030', status: 'in-progress', update: 'Feasibility study completed. Solar panel subsidies drafted.' },
      { id: '1b', text: 'Free Universal Pre-K', status: 'completed', update: 'Funding secured in the 2026 budget.' },
      { id: '1c', text: 'Modernize Public Transit Network', status: 'todo', update: 'Awaiting federal grant approval.' }
    ]
  },
  {
    id: '2',
    name: 'tony dragon',
    party: 'Civic Alliance',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    promises: [
      { id: '2a', text: 'Comprehensive Tax Reform', status: 'todo', update: 'Drafting initial committee proposal.' },
      { id: '2b', text: 'Increase Teacher Salaries by 15%', status: 'in-progress', update: 'Negotiating with teachers union.' },
      { id: '2c', text: 'Expand Small Business Grants', status: 'completed', update: '$5M grant program launched last month.' }
    ]
  },
  {
    id: '3',
    name: 'moka sandrek',
    party: 'Green Coalition',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    promises: [
      { id: '3a', text: 'Stop Urban Sprawl', status: 'in-progress', update: 'Zoning laws are being reviewed by the city council.' },
      { id: '3b', text: 'Protect Local Watersheds', status: 'completed', update: 'New conservation zones established.' },
      { id: '3c', text: 'Implement City-wide Composting', status: 'in-progress', update: 'Pilot program active in 3 neighborhoods.' }
    ]
  }
];

/**
 * Manifesto Tracker Component
 * 
 * An interactive explorer allowing voters to parse candidate promises. Tracks 
 * implementation status to foster civic accountability. Uses accessible list/detail 
 * patterns suitable for screen readers.
 * 
 * @returns {JSX.Element} Structural master-detail layout mapping candidates to promises.
 */
export const ManifestoTracker: React.FC = (): React.ReactElement => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(MANIFESTO_DATA[0].id);

  const activeCandidate = MANIFESTO_DATA.find(c => c.id === selectedCandidate);

  return (
    <section className="flex flex-col h-full" aria-labelledby="manifesto-title">
      <header className="mb-8">
        <h2 id="manifesto-title" className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-500" aria-hidden="true" />
          Manifesto Implementations Tracker
        </h2>
        <p className="text-neutral-400">Track the progress of candidates' electoral promises and hold them accountable.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Candidates List */}
        <nav className="col-span-1 border border-neutral-800 rounded-2xl bg-neutral-900 overflow-hidden flex flex-col" aria-label="Select a candidate to view their manifesto">
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-xs">Candidates</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2" role="tablist" aria-orientation="vertical">
            {MANIFESTO_DATA.map(candidate => (
              <button
                key={candidate.id}
                role="tab"
                id={`candidate-tab-${candidate.id}`}
                aria-controls="manifesto-panel"
                aria-selected={selectedCandidate === candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 group ${
                  selectedCandidate === candidate.id 
                    ? 'bg-emerald-500/10 border border-emerald-500/30' 
                    : 'hover:bg-neutral-800 border border-transparent'
                }`}
              >
                <img 
                  src={candidate.imageUrl} 
                  alt="" 
                  aria-hidden="true"
                  className="w-12 h-12 rounded-full object-cover border border-neutral-700"
                />
                <div className="text-left flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">{candidate.name}</h4>
                  <p className="text-xs text-emerald-400 truncate">{candidate.party}</p>
                </div>
                {selectedCandidate === candidate.id && <ChevronRight className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Tracker View */}
        <section 
          id="manifesto-panel"
          className="col-span-1 md:col-span-2 border border-neutral-800 rounded-2xl bg-neutral-900 overflow-hidden flex flex-col relative py-2"
          role="tabpanel"
          aria-labelledby={activeCandidate ? `candidate-tab-${activeCandidate.id}` : undefined}
          tabIndex={0}
        >
          {activeCandidate && (
             <div className="p-6 h-full overflow-y-auto w-full">
                <header className="flex items-center gap-4 mb-8">
                   <img 
                      src={activeCandidate.imageUrl} 
                      alt="" 
                      aria-hidden="true"
                      className="w-20 h-20 rounded-2xl object-cover border border-neutral-700 shadow-lg"
                   />
                   <div>
                     <h3 className="text-2xl font-bold text-white mb-1">{activeCandidate.name}</h3>
                     <p className="text-emerald-400 font-medium">{activeCandidate.party} • Implementation Tracker</p>
                   </div>
                </header>

                <div className="space-y-4" role="list" aria-label={`Promises by ${activeCandidate.name}`}>
                   {activeCandidate.promises.map((promise, index) => (
                     <motion.article 
                       key={promise.id}
                       role="listitem"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: index * 0.1 }}
                       className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 relative overflow-hidden group"
                     >
                        <div className="absolute top-0 left-0 w-1 h-full bg-neutral-800 group-hover:bg-emerald-500/50 transition-colors" aria-hidden="true" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                           <h4 className="text-lg font-medium text-white">{promise.text}</h4>
                           
                           {/* Status Badge */}
                           <div 
                              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap w-fit ${
                             promise.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                             promise.status === 'in-progress' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                             'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20'
                           }`}
                            aria-label={`Status: ${promise.status === 'todo' ? 'Not Started' : promise.status.replace('-', ' ')}`}
                           >
                             {promise.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                             {promise.status === 'in-progress' && <Clock className="w-3.5 h-3.5" aria-hidden="true" />}
                             {promise.status === 'todo' && <Circle className="w-3.5 h-3.5" aria-hidden="true" />}
                             <span aria-hidden="true">{promise.status === 'todo' ? 'Not Started' : promise.status.replace('-', ' ')}</span>
                           </div>
                        </div>

                        <div className="ml-0 sm:ml-2 pl-4 border-l-2 border-neutral-800">
                          <p className="text-sm text-neutral-400">
                            <span className="font-semibold text-neutral-300">Latest Update: </span>
                            {promise.update}
                          </p>
                        </div>
                     </motion.article>
                   ))}
                </div>
             </div>
          )}
        </section>
      </div>
    </section>
  );
};
