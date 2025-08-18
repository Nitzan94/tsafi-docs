import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleClearStorage = () => {
    // Clear localStorage to fix corrupted data
    try {
      localStorage.removeItem('template-storage');
      localStorage.removeItem('patient-storage');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              שגיאה במערכת
            </h2>
            
            <p className="text-gray-600 mb-6">
              מצטערים, אירעה שגיאה לא צפויה. אנא נסי את הפעולות הבאות:
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                נסה שוב
              </button>

              <button
                onClick={this.handleClearStorage}
                className="w-full btn btn-ghost text-sm"
              >
                נקה נתונים וטען מחדש
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 text-right">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  פרטי השגיאה (למפתחים)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-red-600 overflow-auto text-left">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}