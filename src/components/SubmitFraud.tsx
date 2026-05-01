import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, CheckCircle2, ThumbsUp } from 'lucide-react';

export const SubmitFraud: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    incidentType: '',
    description: '',
    evidence: null as File | null,
  });

  const [reports, setReports] = useState([
    { id: 1, location: 'minatet booth', type: 'Voter Intimidation', votes: 20, description: 'saw people making threatening voters' },
    { id: 2, location: 'mart booth', type: 'Fake ID', votes: 7, description: 'someone tried to vote two times along different IDs' },
  ]);

  const handleVote = (id: number) => {
    setReports(reports.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setReports([
        {
          id: Date.now(),
          location: formData.location,
          type: formData.incidentType,
          votes: 0,
          description: formData.description,
        },
        ...reports
      ]);
      setFormData({
        location: '',
        incidentType: '',
        description: '',
        evidence: null,
      });
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Report Submitted Successfully</h2>
        <p className="text-neutral-400 text-center mb-8">
          Thank you for helping us maintain the integrity of the election process. Your report has been securely transmitted to the relevant authorities for investigation.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-neutral-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-neutral-700 transition-colors"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20">
          <AlertTriangle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Report Election Fraud II</h2>
        <p className="text-neutral-400">
          If you have observed any suspicious or fraudulent activities, please report them here, submission are firmly unrevelling.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Incident Location / Polling Booth</label>
          <input
            type="text"
            required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="e.g., denmark tannoor"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Type of Incident</label>
          <select
            required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
            value={formData.incidentType}
            onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
          >
            <option value="" disabled>Select incident type...</option>
            <option value="voter_intimidation">Voter Intimidation</option>
            <option value="vote_buying">Vote Buying / Bribery</option>
            <option value="fake_id">Fake ID / Impersonation</option>
            <option value="booth_capturing">Booth Capturing / Violence</option>
            <option value="evm_tampering">EVM Tampering</option>
            <option value="asset_details">Asset Details / Disproportionate Assets</option>
            <option value="other">Different Submission</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Detailed Description</label>
          <textarea
            required
            rows={4}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            placeholder="Please provide as much detail as possible about what you observed..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <Send className="w-5 h-5" />
          Submit Fraud Report
        </button>
      </motion.form>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-white mb-6">Report Submission</h3>
        <div className="space-y-4">
          {reports.map((report) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={report.id}
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 flex items-center justify-center py-1 rounded text-xs font-semibold uppercase">{report.type.replace('_', ' ')}</span>
                  <span className="text-neutral-400 text-sm">{report.location}</span>
                </div>
                <p className="text-white">{report.description}</p>
              </div>
              <button
                onClick={() => handleVote(report.id)}
                className="flex flex-col items-center justify-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-3 flex items-center justify-center py-2 rounded-lg transition-colors min-w-[60px]"
              >
                <ThumbsUp className="w-5 h-5 text-emerald-500" />
                <span className="text-neutral-300 font-medium">{report.votes}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
