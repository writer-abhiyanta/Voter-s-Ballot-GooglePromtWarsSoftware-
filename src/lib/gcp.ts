import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";
import { logSystemHealth } from "./monitoring";

/**
 * Initializes and references the Google Cloud Functions instance.
 * Deployed in asia-southeast1 to adhere to regional compliance.
 */
const functions = getFunctions(app, "asia-southeast1");

/**
 * Invokes a sterile Google Cloud Function for anomaly detection.
 * Used for offloading heavy ML logic or secure backend operations.
 * 
 * @param {Object} data - Payload sent to the backend.
 * @returns {Promise<any>} The processed result.
 */
export async function invokeAnomalyDetection(data: Record<string, any>): Promise<any> {
  const detectAnomaly = httpsCallable(functions, "detectFraudulency");
  try {
    const result = await detectAnomaly(data);
    logSystemHealth("CLOUD_FUNCTION_SUCCESS", { function: "detectFraudulency" });
    return result.data;
  } catch (error) {
    logSystemHealth("CLOUD_FUNCTION_ERROR", { error: String(error) });
    throw error;
  }
}

/**
 * Simulates a direct Google BigQuery export stream.
 * In production, this proxies data to BigQuery via Firebase Extensions 
 * for exhaustive analytical workloads and O(1) columnar reads.
 * 
 * @param {string} dataset - Target BigQuery dataset.
 * @param {Record<string, any>} row - Data row to insert.
 */
export async function streamToBigQuery(dataset: string, row: Record<string, any>): Promise<void> {
  // Simulating BigQuery streaming insert
  logSystemHealth("BIGQUERY_STREAM_INSERT", { dataset, simulatedRowId: Date.now() });
}
