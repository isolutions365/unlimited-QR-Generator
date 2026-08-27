import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
          message: error?.message || String(error),
          stack: error?.stack || '',
          componentStack: errorInfo?.componentStack || '',
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
    if (!this.props.isInline && typeof window !== 'undefined') {
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
          <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border border-slate-200/80 rounded-2xl p-6 my-4 text-center space-y-3 max-w-xl mx-auto shadow-sm">
            <div className="mx-auto w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200/60 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Something went wrong / کوئی مسئلہ پیش آ گیا</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Please retry or refresh this section to restore normal operation.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleReset}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry / دوبارہ کوشش کریں
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[360px] flex items-center justify-center p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50 border border-slate-200/80 rounded-2xl shadow-sm m-4">
          <div className="max-w-md w-full text-center space-y-5 p-8 bg-white rounded-2xl border border-slate-200/80 shadow-md">
            <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Workspace Recovery / ایپلیکیشن بحال کریں</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An unexpected condition was safely intercepted. You can reload the application workspace or return to the main dashboard.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.assign('/');
                  }
                }}
                className="py-2.5 px-5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
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
