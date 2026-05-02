import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, TrendingUp, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface PastPerformance {
  id: string;
  candidateName: string;
  party: string;
  term: string;
  promisesMade: number;
  promisesKept: number;
  score: number;
  details: {
    promise: string;
    status: 'kept' | 'broken' | 'in-progress';
    workflow: string;
  }[];
}

const HISTORICAL_DATA: PastPerformance[] = [
  {
    id: '1',
    candidateName: 'oiela quarter',
    party: 'Progressive Future',
    term: '2022 - 2026',
    promisesMade: 15,
    promisesKept: 12,
    score: 80,
    details: [
      { promise: 'Construct 5 new public schools', status: 'kept', workflow: 'Funding allocated in 2023, constructed by 2025.' },
      { promise: 'Reduce carbon emissions by 20%', status: 'in-progress', workflow: 'Passed green energy bill, currently at 12% reduction.' },
      { promise: 'Zero tax on essential food items', status: 'broken', workflow: 'Vetoed by parliament during budget review.' }
    ]
  },
  {
    id: '2',
    candidateName: 'tony dragon',
    party: 'Civic Alliance',
    term: '2022 - 2026',
    promisesMade: 10,
    promisesKept: 9,
    score: 90,
    details: [
      { promise: 'Increase police funding by 15%', status: 'kept', workflow: 'Implemented via budget amendment 4.' },
      { promise: 'Build new commercial district', status: 'kept', workflow: 'Zoning approved and phase 1 complete.' }
    ]
  }
];

export const KnowBetter: React.FC = () => {
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string | null>(HISTORICAL_DATA[0].id);
  const activeRecord = HISTORICAL_DATA.find(r => r.id === selectedHistoricalId);

  return (
    <section className="max-w-6xl mx-auto py-8" aria-labelledby="know-better-title">
      <header className="mb-8">
        <h2 id="know-better-title" className="text-3xl font-bold text-emerald-400 mb-2 flex items-center gap-3">
          <History className="w-8 h-8" /> Know Better: Pre-Term Performance
        </h2>
        <p className="text-neutral-400">Review historical data. Analyze what candidates promised in their previous terms, what they actually delivered, and the workflow of their actions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-neutral-800 bg-neutral-900 rounded-2xl p-4 flex flex-col gap-2">
          {HISTORICAL_DATA.map(record => (
            <button
              key={record.id}
              onClick={() => setSelectedHistoricalId(record.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedHistoricalId === record.id 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <h3 className="font-bold text-lg">{record.candidateName}</h3>
              <p className="text-xs uppercase tracking-wider opacity-80 mb-2">{record.party} • {record.term}</p>
              <div className="flex items-center gap-4 text-sm mt-2">
                <div>
                  <span className="opacity-60 block text-[10px] uppercase">Score</span>
                  <span className="font-bold">{record.score}%</span>
                </div>
                <div>
                  <span className="opacity-60 block text-[10px] uppercase">Delivered</span>
                  <span className="font-bold">{record.promisesKept} / {record.promisesMade}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 border border-neutral-800 bg-neutral-900 rounded-2xl p-6">
          {activeRecord ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               key={activeRecord.id}
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
                 <div>
                   <h3 className="text-2xl font-bold text-white mb-1">{activeRecord.candidateName}</h3>
                   <span className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded text-sm">{activeRecord.term} Term Audit</span>
                 </div>
                 <div className="text-right">
                   <div className="text-4xl font-bold text-emerald-500">{activeRecord.score}%</div>
                   <div className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Trust Score</div>
                 </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                   <FileText className="w-5 h-5" /> Manifesto Items & Workflow
                </h4>
                
                {activeRecord.details.map((detail, idx) => (
                   <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        detail.status === 'kept' ? 'bg-emerald-500' :
                        detail.status === 'broken' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      
                      <div className="flex justify-between items-start gap-4 mb-3">
                         <h5 className="text-white font-medium text-lg">{detail.promise}</h5>
                         <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                           detail.status === 'kept' ? 'bg-emerald-500/10 text-emerald-500' :
                           detail.status === 'broken' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                         }`}>
                           {detail.status === 'kept' && <CheckCircle2 className="w-3.5 h-3.5" />}
                           {detail.status === 'broken' && <XCircle className="w-3.5 h-3.5" />}
                           {detail.status === 'in-progress' && <TrendingUp className="w-3.5 h-3.5" />}
                           {detail.status}
                         </span>
                      </div>

                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-400">
                         <span className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Implementation Workflow</span>
                         {detail.workflow}
                      </div>
                   </div>
                ))}
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex items-center justify-center text-neutral-500 flex-col gap-4">
                <AlertCircle className="w-12 h-12 opacity-50" />
                <p>Select a candidate to view pre-term performance</p>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};
