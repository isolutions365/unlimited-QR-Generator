import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React boundary error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-xs m-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl border border-slate-100 shadow-xl">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Something went wrong</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected interface rendering issue occurred. Our runtime protection caught the exception gracefully.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-50 border border-slate-200/60 p-3 rounded-xl max-h-32 overflow-y-auto">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-1">Error trace</span>
                <span className="text-[11px] font-mono text-slate-700 break-words block">
                  {this.state.error.message || String(this.state.error)}
                </span>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="py-2 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
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
