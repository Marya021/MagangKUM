import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const message = this.state.error?.message || "Terjadi kesalahan yang tidak terduga.";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="card-clean max-w-md w-full p-8 text-center space-y-6">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Oops! Terjadi Kesalahan</h1>
            <p className="text-sm text-muted-foreground break-words">{message}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={this.handleReload} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Muat Ulang
            </Button>
            <Button variant="outline" onClick={this.handleHome} className="gap-2">
              <Home className="h-4 w-4" />
              Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
