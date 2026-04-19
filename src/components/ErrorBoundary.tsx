import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <main className="min-h-screen bg-background flex items-center justify-center p-4">
          <article className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We hit an unexpected error. Don't worry — your data is safe. Try refreshing the page or heading home.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh page
              </Button>
              <Button variant="outline" onClick={() => { this.handleReset(); window.location.href = "/"; }}>
                <Home className="h-4 w-4" aria-hidden="true" />
                Go home
              </Button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 p-3 bg-muted rounded-md text-xs text-left overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
          </article>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
