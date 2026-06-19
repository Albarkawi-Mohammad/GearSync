import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full cyber-panel p-8 text-center border-red-500/40 shadow-red-500/10">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                <AlertOctagon size={48} />
              </div>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-red-500 mb-2 font-mono">
              SYSTEM EXCEPTION
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              GearSync encountered an unrecoverable rendering boundary error. 
            </p>
            <div className="bg-black/35 rounded-lg p-4 mb-6 text-left border border-slate-800 text-xs font-mono overflow-auto max-h-32 text-red-400">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20"
            >
              <RefreshCw size={18} />
              Reset Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
