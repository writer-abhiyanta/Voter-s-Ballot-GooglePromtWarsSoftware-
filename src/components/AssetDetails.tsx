import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, Building, Car, DollarSign, Briefcase } from 'lucide-react';

const CANDIDATES_ASSETS = [
  {
    id: 1,
    name: 'oiela quarter',
    party: 'Progressive Future',
    declaredAssets: '$1.2M',
    liabilities: '$300K',
    properties: [
      { type: 'Commercial', location: 'Downtown', value: '$800K' },
      { type: 'Residential', location: 'Suburbs', value: '$400K' }
    ],
    vehicles: ['2022 Tesla Model 3'],
    businesses: ['Quarter Consulting LLC']
  },
  {
    id: 2,
    name: 'tony dragon',
    party: 'Civic Alliance',
    declaredAssets: '$4.5M',
    liabilities: '$500K',
    properties: [
      { type: 'Residential', location: 'City Center', value: '$2M' },
      { type: 'Agricultural', location: 'Countryside', value: '$1.5M' },
      { type: 'Commercial', location: 'West End', value: '$1M' }
    ],
    vehicles: ['2023 Mercedes S-Class', '2021 BMW X5'],
    businesses: ['Dragon Real Estate Group', 'Dragon Holdings']
  },
  {
    id: 3,
    name: 'moka sandrek',
    party: 'Green Coalition',
    declaredAssets: '$450K',
    liabilities: '$150K',
    properties: [
      { type: 'Residential', location: 'Eco Village', value: '$350K' }
    ],
    vehicles: ['2020 Nissan Leaf'],
    businesses: []
  }
];

export const AssetDetails: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCandidates = CANDIDATES_ASSETS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-400 mb-2">Candidate Asset Details</h2>
          <p className="text-neutral-400">Review declared assets to identify and report potential fraud or disproportionate wealth.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <label htmlFor="search-candidates" className="sr-only">Search candidates by name or party</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" aria-hidden="true" />
          <input
            id="search-candidates"
            type="text"
            placeholder="Search candidates..."
            aria-label="Search candidates"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredCandidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{candidate.name}</h3>
                <p className="text-emerald-500 font-medium">{candidate.party}</p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-sm text-neutral-400 uppercase tracking-wider font-semibold">Total Assets</p>
                  <p className="text-xl font-bold text-emerald-400">{candidate.declaredAssets}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400 uppercase tracking-wider font-semibold">Liabilities</p>
                  <p className="text-xl font-bold text-green-400">{candidate.liabilities}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Properties */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-300 font-semibold mb-2">
                  <Building className="w-5 h-5 text-emerald-500" />
                  <h4>Properties</h4>
                </div>
                {candidate.properties.map((prop, i) => (
                  <div key={i} className="bg-neutral-800/50 p-3 rounded-lg flex justify-between items-center border border-neutral-800">
                    <div>
                      <p className="text-white text-sm font-medium">{prop.type}</p>
                      <p className="text-neutral-500 text-xs">{prop.location}</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">{prop.value}</span>
                  </div>
                ))}
              </div>

              {/* Businesses */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-300 font-semibold mb-2">
                  <Briefcase className="w-5 h-5 text-green-500" />
                  <h4>Businesses</h4>
                </div>
                {candidate.businesses.length > 0 ? (
                  <ul className="space-y-2">
                    {candidate.businesses.map((biz, i) => (
                      <li key={i} className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-800 text-white text-sm font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {biz}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-sm italic py-2">No businesses declared</p>
                )}
              </div>

              {/* Vehicles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-300 font-semibold mb-2">
                  <Car className="w-5 h-5 text-purple-500" />
                  <h4>Vehicles</h4>
                </div>
                {candidate.vehicles.length > 0 ? (
                  <ul className="space-y-2">
                    {candidate.vehicles.map((veh, i) => (
                      <li key={i} className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-800 text-white text-sm font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        {veh}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-sm italic py-2">No vehicles declared</p>
                )}
              </div>
            </div>
            
            <div className="bg-neutral-800/30 p-4 border-t border-neutral-800 flex justify-end">
              <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded border border-transparent hover:border-emerald-500/30 bg-neutral-800/50 hover:bg-emerald-500/10">
                <AlertTriangle className="w-4 h-4" />
                Report Discrepancy
              </button>
            </div>
          </motion.div>
        ))}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            No candidates matched your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
