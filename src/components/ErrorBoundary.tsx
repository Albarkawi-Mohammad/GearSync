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
    error: null,
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
        <div className="min-h-screen bg-[#0C0B0E] text-[#F7F6F9] flex items-center justify-center p-6">
          <div className="max-w-md w-full gs-card p-8 text-center border-rose-500/30">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center">
                <AlertOctagon size={34} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#F7F6F9] mb-2">
              Unexpected Application Error
            </h1>
            <p className="text-[#A6A2B5] text-sm mb-6">
              GearSync encountered a rendering error. Your saved configurations in local storage remain intact.
            </p>
            <div className="bg-[#121117] rounded-2xl p-4 mb-6 text-left border border-white/10 text-xs font-mono overflow-auto max-h-32 text-rose-400">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-5 gs-btn-primary text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
