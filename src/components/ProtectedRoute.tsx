import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se está logado mas não é admin, mostra mensagem de acesso negado
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
        <div className="w-full max-w-sm space-y-4 p-8 rounded-2xl border bg-card shadow-lg text-center">
          <h1 className="text-xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão de administrador para acessar o painel.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com o proprietário da loja.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="text-primary hover:underline font-medium"
          >
            Voltar à página inicial
          </button>
        </div>
      </div>
    );
  }

  return children;
};
