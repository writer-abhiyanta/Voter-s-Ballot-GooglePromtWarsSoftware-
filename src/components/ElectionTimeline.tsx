import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flag, Vote, Trophy, CheckCircle2, Circle } from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    id: 'registration',
    date: 'Oct 15 - Nov 15, 2026',
    title: 'Voter Registration',
    description: 'Register to vote or update your existing registration details.',
    icon: Calendar,
    status: 'completed'
  },
  {
    id: 'campaign',
    date: 'Nov 16 - Dec 10, 2026',
    title: 'Campaign Period',
    description: 'Candidates publish manifestos and conduct campaign events.',
    icon: Flag,
    status: 'current'
  },
  {
    id: 'voting',
    date: 'Dec 12, 2026',
    title: 'Election Day',
    description: 'Cast your vote at your designated polling station.',
    icon: Vote,
    status: 'upcoming'
  },
  {
    id: 'results',
    date: 'Dec 15, 2026',
    title: 'Result Day',
    description: 'Official announcement of the election results.',
    icon: Trophy,
    status: 'upcoming'
  }
];

export const ElectionTimeline: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Election Timeline</h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          key dates and phase for upcoming election drives
        </p>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-neutral-800 -translate-x-1/2" />

        <div className="space-y-12">
          {TIMELINE_EVENTS.map((event, index) => {
            const isEven = index % 2 === 0;
            const Icon = event.icon;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full -translate-x-1/2 flex items-center justify-center bg-neutral-900 border-4 border-neutral-950 z-10">
                  {event.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : event.status === 'current' ? (
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-600" />
                  )}
                </div>

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className={`bg-neutral-900 border ${event.status === 'current' ? 'border-emerald-500/50' : 'border-neutral-800'} p-6 rounded-xl relative`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${event.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : event.status === 'current' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-emerald-500">{event.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-neutral-400">{event.description}</p>
                    
                    {/* Tail */}
                    <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-neutral-900 border-t ${event.status === 'current' ? 'border-emerald-500/50' : 'border-neutral-800'} ${isEven ? 'right-[-8px] border-r rotate-45' : 'left-[-8px] border-l -rotate-45'}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
