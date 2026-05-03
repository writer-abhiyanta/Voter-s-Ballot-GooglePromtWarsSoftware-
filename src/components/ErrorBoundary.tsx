import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message || String(error) };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const fbErr = typeof window !== 'undefined' ? (window as any).__FIREBASE_ERROR__ : null;
      let msgToCheck = this.state.errorMsg;
      if (fbErr) {
        msgToCheck += " " + (fbErr.message || String(fbErr));
      }

      const isSecurityError = msgToCheck.includes("insecure") || msgToCheck.includes("SecurityError") || msgToCheck.includes("indexedDB") || msgToCheck.includes("localStorage");
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 text-white">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">
              {isSecurityError ? "Browser Security Restriction" : "Unexpected Error"}
            </h1>
            <p className="text-neutral-400 mb-6">
              {isSecurityError
                ? "Your browser is blocking access to local storage or cookies, which is required for this app to function. This usually happens in preview environments or strict privacy modes."
                : "The application encountered an unexpected error and could not recover."}
            </p>
            {isSecurityError && (
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Open in New Tab
              </a>
            )}
            <div className="mt-6 text-left text-xs bg-black/50 p-3 rounded overflow-auto max-h-32 text-neutral-500">
              <code>{this.state.errorMsg}</code>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
