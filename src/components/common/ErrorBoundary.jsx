import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Bug } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AS-Commerce ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI if custom fallback is supplied
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-amber-500 selection:text-white transition-colors duration-200">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-rose-500/10 dark:bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Luxury Icon Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-inner ring-8 ring-amber-500/5">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
              </div>

              {/* Tag / Status */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100/70 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Service Interruption
              </span>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Oops! Something went unexpected
              </h1>

              {/* Friendly message */}
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mb-8">
                We encountered a temporary hiccup while rendering this page. Don't worry, your shopping bag, wishlist, and session data remain completely safe.
              </p>

              {/* Quick Action CTA Buttons */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>

                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Home className="w-4 h-4" />
                  Go to Storefront
                </button>
              </div>

              {/* Collapsible Technical Error Section (for Developer / Diagnostics) */}
              {error && (
                <div className="w-full mt-2 border-t border-slate-200/80 dark:border-slate-800 pt-4 text-left">
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-amber-500" />
                      Technical Diagnostics & Error Log
                    </span>
                    {showDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showDetails && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border border-slate-800 shadow-inner">
                      <p className="text-rose-400 font-bold mb-1">
                        {error.name}: {error.message}
                      </p>
                      {errorInfo && errorInfo.componentStack && (
                        <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed mt-2">
                          {errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
