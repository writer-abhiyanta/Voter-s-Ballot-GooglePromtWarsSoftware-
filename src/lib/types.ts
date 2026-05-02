/**
 * Shared Type Interfaces for Unified Dependency Architecture
 * Maintains Orthogonality across components
 */

export interface Candidate {
  id: string;
  name: string;
  party: string;
  education: string;
  experience: string;
  manifesto: string[];
  assets: string;
  liabilities: string;
  criminalRecord: string;
  performance: string;
  imageUrl: string;
  matchScore: number;
}

export interface ManifestoPromise {
  id: string;
  text: string;
  status: "todo" | "in-progress" | "completed";
  update: string;
}

export interface ManifestoData {
  id: string;
  name: string;
  party: string;
  imageUrl: string;
  promises: ManifestoPromise[];
}
