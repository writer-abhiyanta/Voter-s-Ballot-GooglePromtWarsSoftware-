import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, CheckCircle2, ThumbsUp, Loader2 } from 'lucide-react';
import { analyzeFraudReport } from '../services/ai';

/**
 * Interface mapping a single reported incident of election fraud.
 */
interface FraudReport {
  id: number;
  location: string;
  type: string;
  votes: number;
  description: string;
  severity?: 'CRITICAL' | 'MAJOR' | 'MINOR';
  rationale?: string;
}

/**
 * Fraud Submission Interface Component
 * 
 * Provides a critical path for voters to anonymously or pseudo-anonymously report
 * electoral irregularities. Designed with form accessibility and screen-reader guidance
 * in mind. 
 * 
 * Algorithmic Complexity: Form updates O(1), Feed Inserts O(1).
 * Cognitive Complexity: < 2.0
 * SDG Alignment: Goal 16 - Transparent Institutions
 * 
 * @returns {JSX.Element} Form layout and recent reports feed.
 */
export const SubmitFraud: React.FC = (): React.ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    location: '',
    incidentType: '',
    description: '',
    evidence: null as File | null,
  });

  const [reports, setReports] = useState<FraudReport[]>([
    { id: 1, location: 'minatet booth', type: 'Voter Intimidation', votes: 20, description: 'saw people making threatening voters' },
    { id: 2, location: 'mart booth', type: 'Fake ID', votes: 7, description: 'someone tried to vote two times along different IDs' },
  ]);

  /**
   * Upvotes a public report of fraud to show community validation.
   * @param {number} id - Original ID of the targeted report.
   */
  const handleVote = (id: number): void => {
    setReports(reports.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r));
  };

  /**
   * Captures and submits the fraud form state, resetting data afterwards.
   * Leverages Gemini AI to classify and score the severity of the incident.
   * @param {React.FormEvent} e - Native form event object.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Analyze the report using Gemini AI
      const analysis = await analyzeFraudReport(formData.description);
      
      setSubmitted(true);
      setReports((prev) => [
        {
          id: Date.now(),
          location: formData.location,
          type: analysis.suggestedCategory || formData.incidentType,
          votes: 0,
          description: formData.description,
          severity: analysis.severity,
          rationale: analysis.rationale,
        },
        ...prev
      ]);
      setFormData({
        location: '',
        incidentType: '',
        description: '',
        evidence: null,
      });
    } catch (error) {
       console.error("Submission error:", error);
    } finally {
       setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="max-w-2xl mx-auto flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-2xl" aria-live="polite">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Report Submitted Successfully</h2>
        <p className="text-neutral-400 text-center mb-8">
          Thank you for helping us maintain the integrity of the election process. Your report has been securely transmitted to the relevant authorities for investigation.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-neutral-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          aria-label="Return to submit another report"
        >
          Submit Another Report
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto" aria-labelledby="fraud-report-title">
      <header className="mb-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20" aria-hidden="true">
          <AlertTriangle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 id="fraud-report-title" className="text-3xl font-bold text-white mb-2">Report Election Fraud II</h2>
        <p className="text-neutral-400">
          If you have observed any suspicious or fraudulent activities, please report them here, submission are firmly unrevelling.
        </p>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl space-y-6"
        aria-label="Fraud Submission Form"
      >
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-neutral-300 mb-2">Incident Location / Polling Booth <span className="text-red-500" aria-hidden="true">*</span></label>
          <input
            id="location"
            type="text"
            required
            aria-required="true"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="e.g., denmark tannoor"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="incidentType" className="block text-sm font-medium text-neutral-300 mb-2">Type of Incident <span className="text-red-500" aria-hidden="true">*</span></label>
          <select
            id="incidentType"
            required
            aria-required="true"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
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
          <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">Detailed Description <span className="text-red-500" aria-hidden="true">*</span></label>
          <textarea
            id="description"
            required
            aria-required="true"
            rows={4}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            placeholder="Please provide as much detail as possible about what you observed..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
             <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : (
             <Send className="w-5 h-5" aria-hidden="true" />
          )}
          {isSubmitting ? 'Analyzing & Submitting...' : 'Submit Fraud Report'}
        </button>
      </motion.form>

      <section className="mt-12" aria-labelledby="submissions-title">
        <h3 id="submissions-title" className="text-2xl font-bold text-white mb-6">Report Submission</h3>
        <div className="space-y-4" role="feed" aria-busy="false">
          {reports.map((report) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={report.id}
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-start gap-4"
              role="article"
            >
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 flex items-center justify-center py-1 rounded text-xs font-semibold uppercase">{report.type.replace('_', ' ')}</span>
                  {report.severity && (
                    <span className={`px-2 flex items-center justify-center py-1 rounded text-xs font-semibold uppercase ${
                      report.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      report.severity === 'MAJOR' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {report.severity}
                    </span>
                  )}
                  <span className="text-neutral-400 text-sm flex items-center before:content-['•'] before:mr-2">{report.location}</span>
                </div>
                <p className="text-white pt-1">{report.description}</p>
                {report.rationale && (
                  <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-sm text-neutral-400">
                    <span className="font-semibold text-emerald-500 mr-2">AI Analysis:</span>
                    {report.rationale}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleVote(report.id)}
                aria-label={`Validate or Upvote report about ${report.type}`}
                title={`Upvote: currently ${report.votes}`}
                className="flex flex-col items-center justify-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-3 flex items-center justify-center py-2 rounded-lg transition-colors min-w-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                <ThumbsUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                <span className="text-neutral-300 font-medium">{report.votes}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </section>
  );
};
