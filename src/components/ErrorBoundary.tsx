import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  isInline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  reported: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    reported: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React boundary error:', error, errorInfo);

    try {
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'react_error_boundary',
          message: error.message || String(error),
          stack: error.stack || '',
          componentStack: errorInfo.componentStack || '',
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      })
        .then(() => this.setState({ reported: true }))
        .catch(() => this.setState({ reported: true }));
    } catch {
      this.setState({ reported: true });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, reported: false });
    if (!this.props.isInline) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.isInline) {
        return (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 my-4 text-center space-y-3 max-w-xl mx-auto">
            <div className="mx-auto w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800">Kuch masla ho gaya, dobara try karein</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Baraye meharbani dobara koshish karein ya page ko refresh karein.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="py-1.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Dobara Koshish Karein
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-xs m-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl border border-slate-100 shadow-xl">
            <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Kuch masla ho gaya, dobara try karein</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Baraye meharbani page ko reload karein ya thori der baad dobara koshish karein.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="py-2.5 px-5 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="py-2.5 px-5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
