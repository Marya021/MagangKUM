import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { showError } from "@/lib/error-utils";
import Landing from "./pages/Landing";
import Guide from "./pages/Guide";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Positions from "./pages/Positions";
import Applications from "./pages/Applications";
import UsersManagement from "./pages/UsersManagement";
import Attendance from "./pages/Attendance";
import DailyReports from "./pages/DailyReports";
import Profile from "./pages/Profile";
import Certificate from "./pages/Certificate";
import Intern from "./pages/Intern";
import Supervisor from "./pages/Supervisor";
import ActivityLogs from "./pages/ActivityLogs";
import Penempatan from "./pages/Penempatan";
import NotFound from "./pages/NotFound";
import { AssistantWidget } from "@/features/assistant/AssistantWidget";
import { SplashScreen } from "@/components/SplashScreen";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const msg = (error as { message?: string })?.message?.toLowerCase() || "";
        // Don't retry auth/permission errors
        if (msg.includes("jwt") || msg.includes("permission") || msg.includes("not authorized") || msg.includes("rls")) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast if the query has observers (visible) and isn't silenced via meta
      if (query.meta?.silent) return;
      showError(error, "Gagal memuat data");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.silent) return;
      // Only show if no custom onError handler is defined
      if (!mutation.options.onError) showError(error);
    },
  }),
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
  <ThemeProvider attribute="class" defaultTheme="light" storageKey="magangkum-theme">
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SplashScreen />
      <NuqsAdapter>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
            <Route path="/panduan" element={<Guide />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/positions" element={<ProtectedRoute><Positions /></ProtectedRoute>} />
            <Route path="/intern" element={<ProtectedRoute><Intern /></ProtectedRoute>} />
            <Route path="/supervisor" element={<ProtectedRoute><Supervisor /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><DailyReports /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/certificate" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
            <Route path="/activity-logs" element={<AdminRoute><ActivityLogs /></AdminRoute>} />
            <Route path="/penempatan" element={<AdminRoute><Penempatan /></AdminRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AssistantWidget />
        </AuthProvider>
      </BrowserRouter>
      </NuqsAdapter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  </ErrorBoundary>
);

export default App;
