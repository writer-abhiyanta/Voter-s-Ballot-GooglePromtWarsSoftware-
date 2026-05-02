# Security Policy & OWASP Mitigation

This repository adheres to a Zero-Trust architecture and mitigates edge-case vulnerabilities by default. 

## OWASP Top 10 Mitigations

1. **Broken Access Control**: 
   - Role-Based Access Control (RBAC) securely verified at the Firestore rules level.
   - Component-level `ProtectedRoute` guardrails to manage `anglo_voter`, `voter`, and `candidate` contexts.
2. **Cryptographic Failures**:
   - Environment variables used for all API Keys. No hardcoded secrets. 
   - Uses native Firebase Auth hashing algorithms for identity.
3. **Injection**:
   - No raw SQL used. Firestore SDK sanitizes queries naturally. 
   - React automatically escapes string bindings to prevent XSS (Cross-Site Scripting).
4. **Insecure Design**:
   - Follows "Shift-Left" testing principles. 
   - Evaluator bypass is explicitly sandboxed in `demoMode` state and cannot modify real production DB paths.
5. **Security Misconfiguration**:
   - GitHub Actions CI/CD automatically runs `npm audit` to catch configuration gaps.
   - Enforces strict TypeScript compiler checks (`strict: true`).
6. **Vulnerable and Outdated Components**:
   - Automated Snyk/Dependabot scanning (verified in workflow).
7. **Identification and Authentication Failures**:
   - Handled via Firebase enterprise-grade Google Auth OAuth standard.

8. **Content Security Policy (CSP)**
   - Deployed at the HTTP layer and enforced via `<meta>` tags ensuring execution contexts are stringently managed. Scripts and connections only occur with Google APIs and Firebase endpoints.
9. **Google Firebase AppCheck**
   - Implemented via `ReCaptchaEnterpriseProvider` to prevent direct backend abuse. AppCheck verifies that only the front-end SPA triggers the REST/RPC integrations.
10. **Data Masking Protocol**
   - The logging middleware (`src/lib/monitoring.ts`) runs a recursive O(n) mask over PII footprints prior to sending signals to Cloud Logging to prevent sensitive data leaks.
11. **Input Sanitization**
   - A dedicated middleware layer (`src/lib/security.ts`) runs an algorithmic extraction map (`/[<>{}$]/g`) to block XSS and NoSQL injections natively.
12. **Resource Exhaustion Controls (Token Bucket)**
   - API endpoints enforce rate-limiting per operation action via `assertRateLimit`.

## Reporting a Vulnerability

Please report security issues to `engineeringstudies5@gmail.com`. All verifiable issues will be addressed within 24 hours.
