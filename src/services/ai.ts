import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Gemini client lazily
let aiClient: GoogleGenAI | null = null;

/**
 * Retrieves the Gemini AI client instance.
 * Time Complexity: O(1)
 * Pattern: Singleton Lazy Initialization
 * @returns {GoogleGenAI} The initialized Gemini client.
 */
export function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI features will fail.");
    }
    // As per skills guidelines, we explicitly pass the apiKey 
    aiClient = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return aiClient;
}

/**
 * Analyzes a fraud report description to determine its severity and structured category using Gemini Structured Output.
 * Aligns with SDG 16: Peace, Justice, and Strong Institutions.
 * Time Complexity: O(1) (Network boundary execution)
 * 
 * @param {string} description - the user input description.
 * @returns {Promise<{ severity: 'CRITICAL' | 'MAJOR' | 'MINOR', suggestedCategory: string, rationale: string }>} Validated structured response.
 */
export async function analyzeFraudReport(description: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Act as a senior election fraud investigator. 
You must analyze the following user report for severity and exact category.
Report: "${description}"`
            }
          ]
        }
      ],
      config: {
        maxOutputTokens: 256,
        temperature: 0.1, // Low temperature for deterministic classification
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: ['CRITICAL', 'MAJOR', 'MINOR'],
              description: 'The severity level of the reported incident.'
            },
            suggestedCategory: {
              type: Type.STRING,
              enum: ['Voter Intimidation', 'Vote Buying', 'Fake ID', 'Booth Capturing', 'EVM Tampering', 'Other'],
              description: 'The standard category mapping for the incident.'
            },
            rationale: {
              type: Type.STRING,
              description: 'A concise, one-sentence justification for the classification.'
            }
          },
          required: ['severity', 'suggestedCategory', 'rationale']
        }
      }
    });

    const outputText = response.text || "{}";
    const parsed = JSON.parse(outputText);
    return {
      severity: parsed.severity || "MINOR",
      suggestedCategory: parsed.suggestedCategory || "Other",
      rationale: parsed.rationale || "Automated analysis."
    };
  } catch (err) {
    console.error("AI Analysis Failed:", err);
    return {
        severity: 'MINOR',
        suggestedCategory: 'Other',
        rationale: 'AI processing failed or API key missing.'
    };
  }
}

/**
 * Generates an AI insight for the voter based on their top candidate match (Gemini Multimodal / Text Generation).
 * Time Complexity: O(1) (Network boundary execution)
 * 
 * @param {string} topCandidateName - Highest ranked candidate.
 * @param {string[]} alignmentDescriptions - List of text responses to questions mapped to their agreement.
 * @returns {Promise<string>} Generated analytical summary.
 */
export async function generateVoterInsight(topCandidateName: string, alignmentDescriptions: string[]) {
    try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an unbiased political analyst. A voter has just finished a matchmaking quiz and their top candidate is ${topCandidateName}. 
Based on their alignment on these issues:
${alignmentDescriptions.join('\n')}

Generate a concise, 2-to-3 sentence analytical summary explaining why this candidate is a strong match for them and what core philosophy they share.`
                }
              ]
            }
          ],
          config: {
            maxOutputTokens: 256,
            temperature: 0.7,
          }
        });
        return response.text || "You are highly aligned with " + topCandidateName + ".";
    } catch (err) {
        console.error("AI Insight Failed:", err);
        return "You have successfully matched with " + topCandidateName + " based on your core values. Contact their campaign space to learn more!";
    }
}
