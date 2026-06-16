import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cleanupOrphanedImages } from "@/lib/storage-cleanup";
import { AlertCircle, Loader2, Trash2, CheckCircle } from "lucide-react";

export const StorageCleanup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    count: number;
    timestamp: Date;
  } | null>(null);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsRunning(true);
    try {
      const deletedCount = await cleanupOrphanedImages();
      setLastResult({ count: deletedCount, timestamp: new Date() });
      toast({
        title: "Limpeza concluída",
        description: `${deletedCount} imagens órfãs foram removidas`,
      });
    } catch (error) {
      console.error("Cleanup failed:", error);
      toast({
        title: "Erro na limpeza",
        description: error instanceof Error ? error.message : "Falha ao limpar",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">Limpeza de Storage</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Remove imagens órfãs não referenciadas em nenhum produto
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {lastResult && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-green-800">
              <p className="font-medium">Última limpeza: {lastResult.timestamp.toLocaleString()}</p>
              <p>{lastResult.count} imagens removidas</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          💡 Dica: Execute esta limpeza regularmente para liberar espaço de storage
        </p>

        <Button
          onClick={handleCleanup}
          disabled={isRunning}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isRunning && <Trash2 className="mr-2 h-4 w-4" />}
          {isRunning ? "Limpando..." : "Executar Limpeza"}
        </Button>
      </div>
    </div>
  );
};
