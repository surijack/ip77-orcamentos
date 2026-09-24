import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function HomeRoute() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7fafc] text-[#0b8792]"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (!user) return <Login />;

  const email = user.email?.toLowerCase() ?? "";
  if (!email.endsWith("@ip77.com.br")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] px-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(23,63,107,0.1)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff5df] text-[#b27b18]">!</div>
          <h1 className="mt-5 text-xl font-black text-[#173f6b]">E-mail não autorizado</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Entre com um e-mail corporativo terminado em <b>@ip77.com.br</b> para acessar o painel.</p>
          <button onClick={() => void logout()} className="mt-6 rounded-xl bg-[#173f6b] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f3157]">Sair e entrar novamente</button>
        </div>
      </main>
    );
  }

  return <Home user={user} onLogout={logout} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
