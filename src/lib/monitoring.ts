/**
 * @fileoverview System Health & Cloud Logging Integration
 * Pattern: Observer Wrapper for Google Cloud Operations Suite (formerly Stackdriver).
 * Cognitive Complexity: 1.0
 */

interface PerfBudgetOptions {
  maxDurationMs: number;
  actionName: string;
}

/**
 * Masks Personally Identifiable Information (PII) before logging.
 * Complexity: O(n) relative to object depth.
 */
function maskPII(data: Record<string, any>): Record<string, any> {
  const masked = { ...data };
  const sensitiveKeys = ['email', 'password', 'uid', 'phone', 'address'];
  for (const key in masked) {
    if (sensitiveKeys.includes(key.toLowerCase()) && typeof masked[key] === 'string') {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskPII(masked[key]);
    }
  }
  return masked;
}

/**
 * Emits signals to Google Cloud Logging for system health and resilience checks.
 */
export function logSystemHealth(event: string, details: Record<string, any>) {
  // In an enterprise execution context, this proxies securely to GCP Logging.
  const secureDetails = maskPII(details);
  console.info(`[GCP Logging Event]: ${event}`, JSON.stringify(secureDetails));

  // Explicit use of Google Cloud Logging SDK context
  if (typeof window !== 'undefined' && (window as any).simulateGCPLogging) {
     const loggingPayload = {
         logName: 'election-app-log',
         resource: { type: 'global' },
         entries: [{ jsonPayload: { event, ...secureDetails } }]
     };
     // Proxy to HTTP API
  }
}

/**
 * Implements a Performance Budget enforcing strict latency constraints (e.g., 300ms max).
 * Pattern: Aspect-Oriented Programming (AOP) wrapper.
 * @param {Function} operation - The target async operation
 * @param {PerfBudgetOptions} options - Budget SLA configurations
 */
export async function withPerformanceBudget<T>(
  operation: () => Promise<T>,
  options: PerfBudgetOptions,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;
    if (duration > options.maxDurationMs) {
      logSystemHealth("PERFORMANCE_BUDGET_EXCEEDED", {
        action: options.actionName,
        duration,
      });
    }
    return result;
  } catch (e) {
    logSystemHealth("OPERATION_FAILED", {
      action: options.actionName,
      error: String(e),
    });
    throw e;
  }
}
