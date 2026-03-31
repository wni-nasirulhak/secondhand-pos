import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full text-red-600">
              <AlertCircle className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
              <p className="text-gray-600 italic text-sm">
                "{this.state.error?.message || 'A runtime error occurred.'}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={this.handleRefresh}
                icon={<RefreshCw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Try Refreshing
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                icon={<Home className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
            
            <p className="text-xs text-gray-400">
              If the problem persists, please check your network connection or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
